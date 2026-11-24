const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "static")));

app.use("/uploads", express.static(path.join(__dirname, "..", "upload")));

app.use(require("./routes/paginas"));
app.use(require("./routes/rota"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor executando na porta ${PORT}`);
});
