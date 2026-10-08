/*
Perfil individual de cada pet
Produtos
Veterinário
Perfil de usuário
*/

CREATE DATABASE IF NOT EXISTS PetShopLuzzie;
USE DATABASE;

CREATE TABLE Pets(
    id serial primary key
    -- foto
    nome varchar(80),
    idade int,
    sexo char(1) check("F", "f", "M", "m") not null,
    descricao varchar(140) not null,
    historico_vet varchar(200),
    estado_atual varchar(200)
)

CREATE TABLE Usuarios(
    id serial primary key
    -- foto
    nome varchar(80) not null,
    cpf char(14) not null
)

CREATE TABLE Produtos(
    id serial primary key
    -- foto
    nome varchar(40) not null,
    preco float not null,
    descricao varchar(60) not null,
    quant_estoque int not null
)

CREATE TABLE Veterinarios(
    id serial primary Key
    --foto
    nome varchar(80) not null,
    data_nasc date not null,
    especializacao varchar(140)
)

--Foreign Key's
    /*
    *cliente_produto
    *cliente_pet
    *cliente_veterinario
    *pet_veterinario
    */



--Join's