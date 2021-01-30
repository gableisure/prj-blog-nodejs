const express = require("express");
const mongoose = require("mongoose");
const router = require("./admin");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
const bcrypt = require("bcryptjs");

router.get("/registro", (req, res) => {
    res.render("usuario/registro");
});

router.post("/registro", (req, res) => {
    var erros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido" });
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "Email inválido" });
    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "Senha inválido" });
    }
    if (req.body.senha.length < 4) {
        erros.push({ texto: "Senha muito curta" });
    }
    if (req.body.senha != req.body.senha1) {
        erros.push({ texto: "Senhas não coincidem" });
    }

    if (erros.length > 0) {
        res.render("usuario/registro", { erros: erros });
    } else {
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "Já existe uma conta cadastrada com esse email");
                res.redirect("/usuario/registro");
            } else {
                const novoUsuario = {
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                }

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (err, hash) => {
                        if (err) {
                            req.flash("error_msg", "Houve um erro ao salvar o usuário");
                            res.redirect("/");
                        }
                        novoUsuario.senha = hash;
                        new Usuario(novoUsuario).save().then(() => {
                            req.flash("success_msg", "Usuário salvo com sucesso");
                            res.redirect("/");
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao salvar o usuário");
                            res.redirect("/usuario/registro");
                        })
                    });
                });
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno");
            res.redirect("/");
        });
    }
});

router.get("/login", (req, res) => {
    res.render("usuario/login");
});

module.exports = router;