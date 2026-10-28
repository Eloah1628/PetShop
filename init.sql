CREATE DATABASE IF NOT EXISTS "PetShopLuzzie";
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

INSERT INTO Usuarios (nome, cpf) VALUES ('Ana Silva', '123.456.789-01');
INSERT INTO Usuarios (nome, cpf) VALUES ('Bruno Santos', '234.567.890-12');
INSERT INTO Usuarios (nome, cpf) VALUES ('Carla Oliveira', '345.678.901-23');
INSERT INTO Usuarios (nome, cpf) VALUES ('Daniel Costa', '456.789.012-34');
INSERT INTO Usuarios (nome, cpf) VALUES ('Mariana Souza', '567.890.123-45');


INSERT INTO Pets (nome, idade, sexo, descricao, historico_vet, estado_atual) VALUES ('Rex', 5, 'M', 'Cachorro da raca Labrador', 'Vacinado e castrado', 'Saudavel');
INSERT INTO Pets (nome, idade, sexo, descricao, historico_vet, estado_atual) VALUES ('Luna', 3, 'F', 'Gata da raca Siames', 'Tratamento contra pulgas', 'Saudavel');
INSERT INTO Pets (nome, idade, sexo, descricao, historico_vet, estado_atual) VALUES ('Bob', 7, 'M', 'Cachorro da raca Poodle', 'Acompanhamento odontologico', 'Em observacao');

INSERT INTO Produtos (nome, preco, descricao, quant_estoque) VALUES ('Racao para caes', 89.90, 'Racao premium para caes adultos', 30);
INSERT INTO Produtos (nome, preco, descricao, quant_estoque) VALUES ('Racao para gatos', 74.50, 'Racao para gatos adultos', 25);
INSERT INTO Produtos (nome, preco, descricao, quant_estoque) VALUES ('Coleira azul', 19.90, 'Coleira ajustavel para caes', 40);
INSERT INTO Produtos (nome, preco, descricao, quant_estoque) VALUES ('Brinquedo mordedor', 14.99, 'Mordedor de borracha', 50);
INSERT INTO Produtos (nome, preco, descricao, quant_estoque) VALUES ('Shampoo pet', 27.50, 'Shampoo para caes e gatos', 20);

INSERT INTO Veterinarios (nome, data_nasc, especializacao) VALUES ('Dr. Pedro Almeida', '1985-04-12', 'Clinica geral');
INSERT INTO Veterinarios (nome, data_nasc, especializacao) VALUES ('Dra. Julia Martins', '1990-08-25', 'Dermatologia veterinaria');
INSERT INTO Veterinarios (nome, data_nasc, especializacao) VALUES ('Dr. Marcos Lima', '1982-11-03', 'Cirurgia veterinaria');
INSERT INTO Veterinarios (nome, data_nasc, especializacao) VALUES ('Dra. Fernanda Rocha', '1988-02-17', 'Odontologia veterinaria');
INSERT INTO Veterinarios (nome, data_nasc, especializacao) VALUES ('Dr. Lucas Ferreira', '1993-06-09', 'Medicina felina');

INSERT INTO Cliente_Pet (id_usuario, id_pet) VALUES (1, 1)
INSERT INTO Cliente_Pet (id_usuario, id_pet) VALUES (1, 2);
INSERT INTO Cliente_Pet (id_usuario, id_pet) VALUES (2, 3);
INSERT INTO Cliente_Pet (id_usuario, id_pet) VALUES (3, 4);
INSERT INTO Cliente_Pet (id_usuario, id_pet) VALUES (4, 5);

INSERT INTO Cliente_Produto (id_usuario, id_produto, quantidade, data_compra) VALUES (1, 1, 2, '2026-10-01');
INSERT INTO Cliente_Produto (id_usuario, id_produto, quantidade, data_compra) VALUES (1, 3, 1, '2026-10-01');
INSERT INTO Cliente_Produto (id_usuario, id_produto, quantidade, data_compra) VALUES (2, 2, 1, '2026-10-05');
INSERT INTO Cliente_Produto (id_usuario, id_produto, quantidade, data_compra) VALUES (3, 4, 3, '2026-10-10');
INSERT INTO Cliente_Produto (id_usuario, id_produto, quantidade, data_compra) VALUES (4, 5, 1, '2026-10-15');
INSERT INTO Cliente_Produto (id_usuario, id_produto, quantidade, data_compra) VALUES (5, 1, 1, '2026-10-16');

INSERT INTO Cliente_Veterinario (id_usuario, id_veterinario, data_consulta) VALUES (1, 1, '2026-10-02');
INSERT INTO Cliente_Veterinario (id_usuario, id_veterinario, data_consulta) VALUES (1, 2, '2026-10-12');
INSERT INTO Cliente_Veterinario (id_usuario, id_veterinario, data_consulta) VALUES (2, 3, '2026-10-05');
INSERT INTO Cliente_Veterinario (id_usuario, id_veterinario, data_consulta) VALUES (3, 4, '2026-10-10');
INSERT INTO Cliente_Veterinario (id_usuario, id_veterinario, data_consulta) VALUES (4, 5, '2026-10-15');

INSERT INTO Pet_Veterinario (id_pet, id_veterinario, data_atendimento, observacoes) VALUES (1, 1, '2026-10-02', 'Consulta de rotina');
INSERT INTO Pet_Veterinario (id_pet, id_veterinario, data_atendimento, observacoes) VALUES (2, 2, '2026-10-12', 'Avaliacao dermatologica');
INSERT INTO Pet_Veterinario (id_pet, id_veterinario, data_atendimento, observacoes) VALUES (3, 3, '2026-10-05', 'Avaliacao clinica');
INSERT INTO Pet_Veterinario (id_pet, id_veterinario, data_atendimento, observacoes) VALUES (4, 4, '2026-10-10', 'Limpeza dentaria');
INSERT INTO Pet_Veterinario (id_pet, id_veterinario, data_atendimento, observacoes) VALUES (5, 5, '2026-10-15', 'Consulta de filhote');