# 🚗 Metropole Garage

Sistema de garagem para o servidor **Metrópole RP** no FiveM, utilizando **TypeScript**, **React**, **MySQL** e **Lua**.

---

## 📋 Resumo do Projeto

Este sistema permite que os jogadores visualizem seus veículos salvos, retirem veículos da garagem e que administradores possam spawnar veículos usando comandos.  
Os veículos têm cor e customizações salvas, são persistidos no banco de dados e a integridade é garantida com o uso de **StateBags** para evitar veículos duplicados.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React + TypeScript + TailwindCSS + Vite
- **Backend**: TypeScript + Lua para integração com o FiveM
- **Banco de Dados**: MySQL
- **Comunicação**: NUI Messages e Eventos Net (`onNet`, `emitNet`)
- **Gerenciamento de estado no servidor**: StateBags
- **ORM**: Consulta direta usando `oxmysql`
- **Controle de Permissões**: ACE Permissions

---

## 📂 Estrutura de Pastas

```
/client (Interface React + TypeScript)
  /components
  /nui
  /types
/server (Servidor FiveM + TypeScript + Lua)
  spawn.lua (eventos de spawn no Lua)
  index.ts (lógica principal da garagem)
  fivem.d.ts (tipagens nativas do FiveM)
```

---

## ⚙️ Instalação

### 1. Requisitos

- FiveM Server (FXServer atualizado)
- Node.js (v18 ou superior)
- Banco de dados MySQL
- Resource **oxmysql** instalado e iniciado no servidor
- Permissões ACE configuradas no server.cfg

### 2. Clonar o projeto

```bash
git clone https://github.com/seu-usuario/metropole-garage.git
```

### 3. Instalar dependências do Frontend

```bash
cd metropole-garage/client
npm install
npm run build
```

### 4. Instalar dependências do Backend

```bash
cd ../server
npm install
npm run build
```

---

## 📂 Banco de Dados

### Criação da tabela de veículos

Execute a seguinte query no seu banco MySQL:

```sql
CREATE TABLE `vehicles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `plate` VARCHAR(10) NOT NULL,
  `model` VARCHAR(50) NOT NULL,
  `color` VARCHAR(20) NOT NULL,
  `customizations` JSON DEFAULT NULL,
  `owner` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `plate` (`plate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO vehicles (plate, model, color, customizations, owner) VALUES
('ADD123', 'adder', '#de0f18', '{"secondaryColor": "#0b9cf1", "mods": {"engine": 3}}', 'steam:11000010cdec5a1'),
('ZEN123', 'zentorno', '#1b6770', '{"mods": {"engine": 3}}', 'steam:11000010cdec5a1'),
('COM123', 'comet2', '#f1cc40', '{"secondaryColor": "#f21f99", "mods": {"engine": 3}}', 'steam:11000010cdec5a1');

INSERT INTO vehicles (plate, model, color, customizations, owner) VALUES
('JES123', 'jester', '#0b9cf1', '{"secondaryColor": "#ffcf20", "mods": {"spoiler": 1}}', 'steam:110000100000001'),
('BAN123', 'banshee', '#bc1917', '{"secondaryColor": "#afd6e4", "mods": {"exhaust": 2}}', 'steam:110000100000001'),
('ELE123', 'elegy', '#f21f99', '{"secondaryColor": "#fcf9f1", "mods": {"spoiler": 3, "engine":3}}', 'steam:110000100000001');

OBS: Troque o owner para seu steam ID no primeiro INSERT.
```

---

## 🚀 Como Usar

### 1. Adicionar no `server.cfg`

```cfg
ensure oxmysql
ensure metropole-garage
```

### 2. Configurar Permissões ACE

```cfg
add_ace group.admin metropole.admin allow
add_principal identifier.[STEAM_ID] group.admin
```

Assim, apenas administradores poderão usar o comando `/car`.

---

## 🕹️ Comandos Disponíveis

| Comando | Função | Permissão Necessária |
| :--- | :--- | :--- |
| `/garage` | Abre a garagem NUI para o jogador visualizar seus veículos. | Nenhuma |
| `/car [placa]` | Spawna o veículo pela placa cadastrada. | metropole.admin |
| `/car [modelo]` | Spawna um veículo pelo modelo (ex: `sultan`, `zentorno`). | metropole.admin |

---

## 🧪 Como Testar

1. Conecte no seu servidor FiveM.
2. Use `/garage` para abrir a garagem e visualizar seus veículos.
3. Clique em "Retirar Carro" para spawnar um dos seus veículos.
4. Como admin, use `/car ABC123` para spawnar pela placa cadastrada.
5. Como admin, use `/car sultan` para spawnar um novo veículo direto pelo modelo.
6. Teste erros de veículo já spawnado (StateBag controlado).

---

## 📝 Observações Importantes

- O script **não** usa **qbcore**, **esx**, **vrp**, ou qualquer framework.
- Controle de spawn é feito para **evitar duplicação de veículos**.
- Todos os veículos são persistidos entre sessões via MySQL.
- Customizações de cor e mods são reaplicadas no spawn.
- **Vídeo de demonstração** incluído abaixo.

---

## 🎥 Víde o de Demonstração

[*Assista o Vídeo do funcionamento do Sistema*](https://youtu.be/UvZZJosmbXc)
