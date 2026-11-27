## PetShopLuzzie

## Descrição
Um site onde você pode marcar consultas veterinárias e comprar produtos ou acessórios para o seu pet.
Você também pode contemplar a experiência de adotar um novo companheiro.

## Objetivos
O objetivo do projeto é desenvolver um site que facilite os cuidados com os animais de estimação, reunindo em uma única plataforma serviços e recursos voltados ao bem-estar animal.

O projeto busca conectar tutores, veterinários e pessoas interessadas em ajudar os animais, incentivando a adoção responsável, a conscientização e o cuidado com os pets.

O site permite que os usuários agendem consultas veterinárias, comprem produtos e acessórios para seus pets, além de possibilitar a adoção responsável de animais que precisam de um lar. Futuramente também será possível cadastrar animais encontrados na rua ou aqueles que seus tutores não podem mais cuidar, ajudando a encontrar novos lares e a promover o acolhimento.

## Conteúdo e funcionalidades
- Cadastro e login de usuários (com autenticação via JWT e senha criptografada com bcrypt).
- CRUD de usuários, pets, produtos e veterinários, com validação de IDs e de dados.
- Registro de compras de produtos (quantidade e data) e de consultas veterinárias (com datas e observações).
- Upload de fotos para usuários, pets e produtos.
- Páginas públicas com a listagem de pets disponíveis para adoção e de produtos à venda.

## Tecnologias utilizadas
- Node.js com Express (API REST)
- PostgreSQL (banco de dados relacional)
- Docker e Docker Compose (ambiente containerizado)
- HTML, CSS e JavaScript (frontend)
- JWT, bcrypt, multer, pg

## Como executar
Certifique-se de ter o Docker e o Docker Compose instalados. No terminal, na pasta do projeto:

    É necessário primeiro construir o database no docker, após ter certeza de que está funcionando,
    entrar no cmd, dentro do frontend e digitar "npm run dev".
    
    Para recriar o banco do zero (apaga os dados):
    docker compose down -v
    docker compose up --build -d    

## Após inicializado:
    - Site: http://localhost:5173/
    - Backend: http://localhost:3000/
    - Interface gráfica do banco (pgweb): http://localhost:8081/

## Participantes
    Eloah Gabriele dos Santos
    Julia Cantuária Linhares
