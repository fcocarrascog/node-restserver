const express = require('express');
const bcrypt = require('bcryptjs');
const _ = require('underscore');

const Usuario = require('../modelos/usuario');
const { verificaToken, verificaAdmin_role } = require('../middlewares/autenticacion');
const app = express();


app.get('/usuario', verificaToken, (req, res) => {
    //res.json('get usuario Local');


    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.countDocuments({ estado: true }, (err, contador) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    totalUsuarios: contador,
                    usuarios
                });
            });
        });

});

app.post('/usuario', [verificaToken, verificaAdmin_role], function(req, res) {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        correo: body.correo,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

app.put('/usuario/:id', [verificaToken, verificaAdmin_role], function(req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'correo', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

app.delete('/usuario/:id', [verificaToken, verificaAdmin_role], function(req, res) {
    let id = req.params.id;

    /* Modificación del estado del documento en la BD a false */
    let cambiaEstado = {
        estado: false
    };

    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioEliminado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!usuarioEliminado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        return res.json({
            ok: true,
            usuarioEliminado
        });


    });



    // /* Eliminación física de la BD */
    // Usuario.findByIdAndDelete(id, (err, usuarioBorrado) => {
    //     if (err) {
    //         return res.status(400), json({
    //             ok: false,
    //             err
    //         })
    //     }
    //     if (!usuarioBorrado) {
    //         return res.status(400).json({
    //             ok: false,
    //             err: {
    //                 message: 'Usuario no encontrado'
    //             }
    //         });
    //     }
    //     res.json({
    //         ok: true,
    //         usuarioBorrado
    //     });
    // });

});

module.exports = app;