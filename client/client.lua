-- Função para converter código hexadecimal (ex.: #1b6770) para RGB
function HexToRGB(hex)
    hex = hex:gsub("#", "") -- Remove o # do início
    local r = tonumber("0x" .. hex:sub(1, 2)) -- Converte os primeiros 2 caracteres para vermelho
    local g = tonumber("0x" .. hex:sub(3, 4)) -- Converte os próximos 2 caracteres para verde
    local b = tonumber("0x" .. hex:sub(5, 6)) -- Converte os últimos 2 caracteres para azul
    return r, g, b
end

-- Função para abrir a interface da garagem
function ShowUI()
    local playerId = PlayerId() -- Obtém o ID do jogador no cliente
    local serverId = GetPlayerServerId(playerId) -- Obtém o ID do servidor do jogador
    print('ShowUI: Enviando metropole:getSteamId para o servidor com serverId ' .. serverId)
    -- Solicita o Steam ID ao servidor
    TriggerServerEvent('metropole:getSteamId', serverId)
end

-- Recebe o Steam ID do servidor e abre a interface
RegisterNetEvent('metropole:receiveSteamId')
AddEventHandler('metropole:receiveSteamId', function(steamId)
    if steamId then
        print('Recebido Steam ID: ' .. steamId)
        -- Envia o evento para o servidor para buscar os veículos
        TriggerServerEvent('metropole:getVehicles', steamId)

        -- Abre a interface (NUI)
        print('Abrindo NUI...')
        SetNuiFocus(true, true)
        SendNUIMessage({
            action = 'openGarage'
        })
    else
        print('Erro: Não foi possível obter o Steam ID.')
    end
end)

-- Recebe os veículos do servidor e atualiza a interface
RegisterNetEvent('metropole:setVehicles')
AddEventHandler('metropole:setVehicles', function(vehicles)
    print('Recebido veículos: ' .. json.encode(vehicles))
    SendNUIMessage({
        action = 'setVehicles',
        vehicles = vehicles
    })
end)

-- Recebe mensagens de erro do servidor
RegisterNetEvent('metropole:error')
AddEventHandler('metropole:error', function(message)
    print('Erro do servidor: ' .. message)
    SendNUIMessage({
        action = 'error',
        message = message
    })
end)

-- Recebe erro ao spawnar veículo
RegisterNetEvent('metropole:spawnError')
AddEventHandler('metropole:spawnError', function(error)
  SendNUIMessage({
    action = 'spawnError',
    error = error
  })
end)

-- Recebe sucesso ao spawnar veículo
RegisterNetEvent('metropole:spawnSuccess')
AddEventHandler('metropole:spawnSuccess', function(plate)
    print('Veículo spawnado: ' .. plate)
    SendNUIMessage({
        action = 'spawnSuccess',
        plate = plate
    })
end)

-- Callback do NUI para fechar a interface
RegisterNUICallback('close', function(data, cb)
    print('Fechando NUI...')
    SetNuiFocus(false, false)
    SendNUIMessage({
        action = 'closeUI'
    })
    cb('ok')
end)

-- Callback do NUI para spawnar veículo
RegisterNUICallback('spawnVehicle', function(data, cb)
    print('Solicitando spawn do veículo com placa: ' .. data.plate)
    TriggerServerEvent('metropole:spawnVehicle', data.plate)
    cb('ok')
end)

-- Callback do NUI para spawnar veículo como admin
RegisterNUICallback('adminSpawnVehicle', function(data, cb)
    print('Solicitando spawn admin do veículo com placa: ' .. data.plate)
    TriggerServerEvent('metropole:adminSpawnVehicle', data.plate)
    cb('ok')
end)

-- Comando /garage para abrir a interface
RegisterCommand('garage', function(source, args, rawCommand)
    print('Executando comando /garage')
    ShowUI()
end, false)

-- Recebe evento para spawnar o veículo no cliente
RegisterNetEvent('metropole:spawnVehicleClient')
AddEventHandler('metropole:spawnVehicleClient', function(plate, model, color, customizations)
    print('Recebido evento para spawnar veículo - Placa: ' .. plate .. ', Modelo: ' .. model)
    
    local playerPed = PlayerPedId()
    local coords = GetEntityCoords(playerPed)
    local heading = GetEntityHeading(playerPed)

    -- Converte o nome do modelo para um hash
    local modelHash = GetHashKey(model)
    print('Convertendo modelo para hash: ' .. model .. ' -> ' .. modelHash)
    
    RequestModel(modelHash)
    while not HasModelLoaded(modelHash) do
        Citizen.Wait(0)
    end

    -- Spawna o veículo
    local vehicle = CreateVehicle(modelHash, coords.x, coords.y, coords.z, heading, true, false)
    SetVehicleNumberPlateText(vehicle, plate)
    SetPedIntoVehicle(playerPed, vehicle, -1)

    -- Decodifica a string JSON de customizations, se necessário
    local decodedCustomizations = customizations
    if type(customizations) == "string" then
        print('Decodificando customizations: ' .. customizations)
        decodedCustomizations = json.decode(customizations)
    end

    -- Converte as cores hexadecimais para RGB
    local primaryR, primaryG, primaryB = HexToRGB(color) -- Cor primária
    -- Se secondaryColor não estiver definido, usa a cor primária
    local secondaryColor = decodedCustomizations.secondaryColor or color
    local secondaryR, secondaryG, secondaryB = HexToRGB(secondaryColor)

    -- Aplica as cores personalizadas
    print('Aplicando cores - Primária: ' .. color .. ' (RGB: ' .. primaryR .. ', ' .. primaryG .. ', ' .. primaryB .. '), Secundária: ' .. secondaryColor .. ' (RGB: ' .. secondaryR .. ', ' .. secondaryG .. ', ' .. secondaryB .. ')')
    SetVehicleCustomPrimaryColour(vehicle, primaryR, primaryG, primaryB)
    SetVehicleCustomSecondaryColour(vehicle, secondaryR, secondaryG, secondaryB)

    -- Aplica os mods, verificando se mods existe
    if decodedCustomizations.mods and type(decodedCustomizations.mods) == "table" then
        for modType, modIndex in pairs(decodedCustomizations.mods) do
            print('Aplicando mod - Tipo: ' .. modType .. ', Índice: ' .. modIndex)
            SetVehicleMod(vehicle, tonumber(modType), modIndex)
        end
    else
        print('Nenhum mod encontrado para aplicar.')
    end

    print('Veículo spawnado: Placa ' .. plate .. ', Modelo ' .. model)
    SetModelAsNoLongerNeeded(modelHash)
end)