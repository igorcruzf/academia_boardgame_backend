# Auxiliador para o jogo Academia

O Auxiliador para o jogo Academia é um projeto em NestJS com TypeScript que permite aos jogadores cadastrar palavras 
e definições. Também permite receber todas as palavras cadastradas via endpoint ou via evento com websocket.
Além disso, possui gerenciamento de pontuação e sala, para permitir jogos simultâneos.

## Banco de Dados

O projeto utiliza um banco de dados em memória para armazenar os cards cadastrados.

## Endpoints

O projeto possui os seguintes endpoints:

- `/rooms`
  - **POST**: - Cria uma nova sala de jogo. O corpo da requisição deve conter o seguinte parâmetro:
      - `name` (nome da sala)

  - **POST**: `/newRound` - Inicia uma nova rodada na sala de jogo. O corpo da requisição deve conter os seguintes parâmetros:
      - `roomName` (nome da sala)
      - `scores` (pontuação dos jogadores na rodada)

  - **POST**: `/newGame` - Inicia um novo jogo na sala de jogo. O corpo da requisição deve conter o seguinte parâmetro:
      - `name` (nome da sala)

- `/players`
  - **GET**: - Retorna a lista de jogadores ordenados pela pontuação total. A consulta pode ser filtrada pelo nome da sala através do parâmetro de consulta `roomName`.

  - **POST**: - Cadastra um novo jogador na sala de jogo. O corpo da requisição deve conter os seguintes parâmetros:
      - `roomName` (ID da sala de jogo)
      - `name` (nome do jogador)

  - **PATCH**: `/:id` - Altera a sala de jogo de um jogador específico. O corpo da requisição deve conter o seguinte parâmetro:
      - `roomName` (novo nome da sala)

- `/cards`
  - **GET**: - Retorna a lista de cartas cadastradas. A consulta pode ser filtrada pelo nome da sala através do parâmetro de consulta `roomName`.

  - **POST**: - Cadastra uma nova carta na sala de jogo. O corpo da requisição deve conter os seguintes parâmetros:
      - `playerId` (ID do jogador que criou a carta)
      - `title` (título da carta)
      - `answer` (resposta da carta)

  - **DELETE**: - Deleta todas as cartas cadastradas na sala de jogo especificada. A consulta pode ser filtrada pelo nome da sala através do parâmetro de consulta `roomName`.


## WebSocket

O projeto utiliza o protocolo WebSocket para enviar os cards cadastrados para o moderador. Isso é feito através do evento chamado `cardsOf${roomName}`.

## Pré-requisitos

Certifique-se de ter os seguintes softwares instalados em sua máquina:

- Node.js (v14+)
- npm (ou yarn)

## Como executar o projeto

1. Clone este repositório para a sua máquina local.

2. Abra o diretório do projeto no terminal.

3. Execute o seguinte comando para instalar as dependências:

   ```bash
   npm install
   
4. Execute o seguinte comando para iniciar o servidor:

   ```bash
    npm run start

O servidor estará em execução e pronto para receber requisições.

## Testes

O projeto possui testes automatizados para garantir o bom funcionamento das funcionalidades implementadas. Foram implementados testes unitários e testes E2E utilizando a biblioteca Jest.

### Testes Unitários

Os testes unitários são responsáveis por testar as funções e métodos de forma isolada, garantindo que cada parte da aplicação funcione corretamente. Para executar os testes unitários, basta executar o seguinte comando:

-   ```bash
    jest
    
### Testes E2E

Os testes E2E são responsáveis por testar a aplicação de ponta a ponta, simulando a interação do usuário com a aplicação. Para executar os testes E2E, basta executar o seguinte comando:

-   ```bash
    jest --config ./test/jest-e2e.json

## Deploy Automático com Render

Este projeto possui integração com a plataforma Render, permitindo um processo de deploy automatizado e facilitado. O Render é uma plataforma de hospedagem que simplifica o deployment de aplicativos e oferece escalabilidade e alta disponibilidade.

O deploy automático está configurado para este projeto, o que significa que sempre que você fizer push para o branch principal do repositório, o Render automaticamente atualizará a aplicação hospedada.

### Acesso à Aplicação

A aplicação está disponível para acesso na seguinte URL:

[https://academia-4oto.onrender.com](https://academia-4oto.onrender.com)

Certifique-se de acessar a URL acima para interagir com a aplicação.

### Como Fazer Deploy Manualmente

Caso queira fazer o deploy manualmente, siga as etapas abaixo:

1. Faça o push do código para o branch principal do repositório.

2. Acesse o painel do Render em [https://render.com](https://render.com) e faça login na sua conta (ou crie uma nova, caso ainda não tenha).

3. Crie um novo serviço (service) no Render.

4. Configure o serviço com as seguintes opções:
    - Escolha a opção "Web Service".
    - Selecione a opção "Automatic Deploy" (deploy automático) e escolha o repositório Git correto.

5. Verifique se as configurações estão corretas e clique em "Create Service" (criar serviço).

O Render irá automaticamente detectar o repositório e iniciar o processo de build e deploy da aplicação.

Acompanhe o progresso do deploy no painel do Render. Após a conclusão, a aplicação estará disponível para acesso na URL fornecida pelo Render.


## Repositório do Frontend

O código-fonte do frontend do Jogo Academia está disponível no seguinte repositório do GitHub: [academia_boardgame_frontend](https://github.com/igorcruzf/academia_boardgame). 