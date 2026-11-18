const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const pastaUploads = path.join(__dirname, "..", "..", "upload");

fs.mkdirSync(pastaUploads, { recursive: true });

const extensoes = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif"
};

const armazenamento = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, pastaUploads);
    },

    filename: (req, file, cb) => {
        const extensao = extensoes[file.mimetype];
        const nomeArquivo = crypto.randomUUID() + extensao;

        cb(null, nomeArquivo);
    }
});

const upload = multer({
    storage: armazenamento,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        if (extensoes[file.mimetype]) {
            cb(null, true);
        } else {
            cb(new Error("Formato de imagem não permitido."));
        }
    }
});

module.exports = upload;