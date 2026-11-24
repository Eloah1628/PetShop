const express = require("express");
const path = require("path");

const router = express.Router();

const pastaViews = path.join(__dirname, "..", "views");

router.get("/", (req, res) => {
    res.sendFile(path.join(pastaViews, "home.html"));
});

router.get("/login", (req, res) => {
    res.sendFile(path.join(pastaViews, "login.html"));
});

router.get("/cadastro", (req, res) => {
    res.sendFile(path.join(pastaViews, "cadastro.html"));
});

module.exports = router;