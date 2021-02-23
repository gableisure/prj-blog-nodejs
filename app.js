const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const admin = require('./routes/admin');
const usuario = require('./routes/usuario');
const path = require('path');
const mongoose = require('mongoose');
const session = require("express-session");
const flash = require("connect-flash");
require("./models/Postagem");
const Postagem = mongoose.model("postagens");
require("./models/Categoria");
const Categoria = mongoose.model("categorias");
const passport = require("passport");
require("./config/auth")(passport);

const PORT = 8083;


// Configurações
// Sessão
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
});

// Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Handlebars
app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Mongoose
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/blogapp").then(() => {
    console.log("Mongo: Conectado ao Mongo...");
}).catch((err) => {
    console.log("Mongo: Houve um erro ao se conectar: " + err);
});

//Public
app.use(express.static(path.join(__dirname, "public")));

// Rotas
app.get('/', (req, res) => {
    Postagem.find().populate("categoria").sort({ date: "desc" }).then((postagens) => {
        res.render("index", { postagens: postagens.map(postagem => postagem.toJSON()) });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno");
        res.redirect("/404");
    });
});

app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({ slug: req.params.slug }).lean().then((postagem) => {
        if (postagem) {
            res.render("postagem/index", { postagem: postagem });
        } else {
            req.flash("error_msg", "Esta postagem não existe!");
            res.redirect("/");
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno!");
        res.redirect("/");
    });
});

app.get("/categorias", (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("categoria/index", { categorias: categorias });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao listar as categorias");
        res.redirect("/");
    })
});

app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).lean().then((categoria) => {
        if (categoria) {
            Postagem.find({ categoria: categoria._id }).lean().then((postagens) => {
                res.render("categoria/postagens", { categoria: categoria, postagens: postagens });
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao listar as postagens");
                res.redirect("/");
            })
        } else {
            req.flash("error_msg", "Esta categoria não existe");
            res.redirect("/");
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao carregar a página dessa categoria");
        res.redirect("/");
    })
});

app.get("/404", (req, res) => {
    res.send("Erro 404!")
});

app.use('/admin', admin);
app.use('/usuario', usuario);

// Outros
app.listen(PORT, () => console.log(`Server: Server running on port ${PORT}`));