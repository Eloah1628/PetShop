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

CREATE TABLE Cliente_Pet (
    id_usuario INT NOT NULL,
    id_pet INT NOT NULL,

    PRIMARY KEY (id_usuario, id_pet),

    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_pet) REFERENCES Pets(id) ON DELETE CASCADE
);

CREATE TABLE Cliente_Produto (
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1 CHECK (quantidade > 0),
    data_compra DATE NOT NULL,

    PRIMARY KEY (id_usuario, id_produto, data_compra),

    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES Produtos(id) ON DELETE CASCADE
);

CREATE TABLE Cliente_Veterinario (
    id_usuario INT NOT NULL,
    id_veterinario INT NOT NULL,
    data_consulta DATE NOT NULL,

    PRIMARY KEY (id_usuario, id_veterinario, data_consulta),

    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_veterinario) REFERENCES Veterinarios(id) ON DELETE CASCADE
);

CREATE TABLE Pet_Veterinario (
    id_pet INT NOT NULL,
    id_veterinario INT NOT NULL,
    data_atendimento DATE NOT NULL,
    observacoes VARCHAR(200),

    PRIMARY KEY (id_pet, id_veterinario, data_atendimento),

    FOREIGN KEY (id_pet) REFERENCES Pets(id) ON DELETE CASCADE,
    FOREIGN KEY (id_veterinario) REFERENCES Veterinarios(id) ON DELETE CASCADE
);

INSERT INTO Usuarios (nome, cpf) VALUES ('Ana Silva', '123.456.789-01'),
INSERT INTO Usuarios (nome, cpf) VALUES ('Bruno Santos', '234.567.890-12'),
INSERT INTO Usuarios (nome, cpf) VALUES ('Carla Oliveira', '345.678.901-23'),
INSERT INTO Usuarios (nome, cpf) VALUES ('Daniel Costa', '456.789.012-34'),
INSERT INTO Usuarios (nome, cpf) VALUES ('Mariana Souza', '567.890.123-45');


INSERT INTO Pets (nome, idade, sexo, descricao, historico_vet, estado_atual) VALUES ('Rex', 5, 'M', 'Cachorro da raça Labrador', 'Vacinado e castrado', 'Saudável'),
INSERT INTO Pets (nome, idade, sexo, descricao, historico_vet, estado_atual) VALUES ('Luna', 3, 'F', 'Gata da raça Siamês', 'Tratamento contra pulgas', 'Saudável'),
INSERT INTO Pets (nome, idade, sexo, descricao, historico_vet, estado_atual) VALUES ('Bob', 7, 'M', 'Cachorro da raça Poodle', 'Acompanhamento odontológico', 'Em observação')

INSERT INTO Produtos (nome, preco, descricao, quant_estoque) VALUES ('Ração para cães', 89.90, 'Ração premium para cães adultos', 30),
INSERT INTO Produtos (nome, preco, descricao, quant_estoque) VALUES ('Ração para gatos', 74.50, 'Ração para gatos adultos', 25),
INSERT INTO Produtos (nome, preco, descricao, quant_estoque) VALUES ('Coleira azul', 19.90, 'Coleira ajustável para cães', 40),
INSERT INTO Produtos (nome, preco, descricao, quant_estoque) VALUES ('Brinquedo mordedor', 14.99, 'Mordedor de borracha', 50),
INSERT INTO Produtos (nome, preco, descricao, quant_estoque) VALUES ('Shampoo pet', 27.50, 'Shampoo para cães e gatos', 20);

INSERT INTO Veterinarios (nome, data_nasc, especializacao) VALUES ('Dr. Pedro Almeida', '1985-04-12', 'Clínica geral'),
INSERT INTO Veterinarios (nome, data_nasc, especializacao) VALUES ('Dra. Julia Martins', '1990-08-25', 'Dermatologia veterinária'),
INSERT INTO Veterinarios (nome, data_nasc, especializacao) VALUES ('Dr. Marcos Lima', '1982-11-03', 'Cirurgia veterinária'),
INSERT INTO Veterinarios (nome, data_nasc, especializacao) VALUES ('Dra. Fernanda Rocha', '1988-02-17', 'Odontologia veterinária'),
INSERT INTO Veterinarios (nome, data_nasc, especializacao) VALUES ('Dr. Lucas Ferreira', '1993-06-09', 'Medicina felina');

INSERT INTO Cliente_Pet (id_usuario, id_pet) VALUES (1, 1)
INSERT INTO Cliente_Pet (id_usuario, id_pet) VALUES (1, 2),
INSERT INTO Cliente_Pet (id_usuario, id_pet) VALUES (2, 3),
INSERT INTO Cliente_Pet (id_usuario, id_pet) VALUES (3, 4),
INSERT INTO Cliente_Pet (id_usuario, id_pet) VALUES (4, 5);