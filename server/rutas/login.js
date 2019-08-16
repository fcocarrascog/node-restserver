const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Usuario = require('../modelos/usuario');
const app = express();


app.post('/login', (req, res) => {
    let body = req.body;

    Usuario.findOne({ correo: body.correo }, (err, usuarioBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioBD
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });


        res.json({
            ok: true,
            usuarioBD,
            token
        });

    });

});


module.exports = app;