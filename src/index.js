const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(cors());

app.use("/hello", require("./routes/rota"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "static", "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor executando na porta ${PORT}`);
});
