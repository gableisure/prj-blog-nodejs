const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const admin = require('./routes/admin');
const path = require('path');
const mongoose = require('mongoose');

const PORT = 8083;


// Configurações
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
app.get('/', (req, res) => res.send("Página principal"));
app.use('/admin', admin);

// Outros
app.listen(PORT, () => console.log(`Server: Server running on port ${PORT}`));