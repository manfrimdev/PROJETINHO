// Importação de módulos
const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");
const cors = require("cors");

// Configuração do Express
const App = express();
App.set("view engine", "ejs");
App.set("views", path.join(__dirname, "mvc/views"));
App.use(express.static(path.join(__dirname, "public")));
App.use(express.urlencoded({ extended: true }));
App.use(express.json());
App.use(cors());

// Conexão com o banco de dados
const connection = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    database: "dengue",
    password: ""
});

// Inicia o servidor
App.listen(3000, () => console.log("Aplicação rodando em http://localhost:3000"));

// Rota principal
App.get("/", (req, res) => {
    res.render("index", {
        nome: "Seja Muito",
        texto: "Bem Vindo"
    });
});

// Rota de gerenciamento de usuários
App.get("/gerenciamento", async (req, res) => {
    try {
        const [usuarios] = await connection.query(`
            SELECT usuarios.id, usuarios.nome, usuarios.email, usuarios.id_grupo, grupos.nome AS grupo_nome
            FROM usuarios
            JOIN grupos ON usuarios.id_grupo = grupos.id
        `);
        res.render("gerenciamento", { usuarios });
    } catch (error) {
        console.error("Erro ao acessar o banco de dados:", error);
        res.status(500).render("error", { mensagem: "Erro ao carregar os dados" });
    }
});

// Rota para carregar a página de edição do usuário
App.get("/edit/:id", async (req, res) => {
    try {
        const [usuario] = await connection.query("SELECT * FROM usuarios WHERE id = ?", [req.params.id]);
        if (usuario.length === 0) return res.status(404).send("Usuário não encontrado");
        res.render("edit", { usuario: usuario[0] });
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        res.status(500).send("Erro interno");
    }
});

// Rota para atualizar os dados do usuário
App.post("/edit/:id", async (req, res) => {
    try {
        const { nome, email, id_grupo } = req.body;
        await connection.query(
            "UPDATE usuarios SET nome = ?, email = ?, id_grupo = ? WHERE id = ?",
            [nome, email, id_grupo, req.params.id]
        );
        res.redirect("/gerenciamento");
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        res.status(500).send("Erro interno");
    }
});

// Rota para excluir usuário
App.post("/delete/:id", async (req, res) => {
    try {
        await connection.query("DELETE FROM usuarios WHERE id = ?", [req.params.id]);
        res.redirect("/gerenciamento");
    } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        res.status(500).send("Erro interno");
    }
});







