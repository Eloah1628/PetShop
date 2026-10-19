CREATE DATABASE IF "PetShopLuzzie" NOT EXISTS;
USE PetShopLuzzie;

CREATE TABLE Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    cpf CHAR(14) NOT NULL UNIQUE
);

CREATE TABLE Pets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    idade INT CHECK (idade IS NULL OR idade >= 0),
    sexo CHAR(1) NOT NULL CHECK (sexo IN ('F', 'f', 'M', 'm')),
    descricao VARCHAR(140) NOT NULL,
    historico_vet VARCHAR(200),
    estado_atual VARCHAR(200)
);

CREATE TABLE Produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(40) NOT NULL,
    preco DECIMAL(10,2) NOT NULL CHECK (preco >= 0),
    descricao VARCHAR(60) NOT NULL,
    quant_estoque INT NOT NULL CHECK (quant_estoque >= 0)
);

CREATE TABLE Veterinarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    data_nasc DATE NOT NULL,
    especializacao VARCHAR(140)
);