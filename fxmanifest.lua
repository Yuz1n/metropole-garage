fx_version 'cerulean'
game 'gta5'

author 'Yuri Leite'
description 'Sistema de Garagem para Metropole'
version '1.0.0'

client_scripts {
    'client/client.lua'
}

server_scripts {
    'server/dist/src/index.js',
    'server/spawn.lua'
}

ui_page 'client/html/index.html'

files {
    'client/html/**',
    'server/dist/**'
}

dependency 'oxmysql'