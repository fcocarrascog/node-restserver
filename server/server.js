require('./config/config');

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(require('./rutas/usuario'));


mongoose.connect(process.env.URLDB, { useNewUrlParser: true }, (err) => {
    if (err)
        console.log(`Error: ${err.name}`);
    else {
        console.log("BD iniciada");
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Escuchando el puerto: `, process.env.PORT);
});