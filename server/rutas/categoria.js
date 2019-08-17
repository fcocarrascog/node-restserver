const express = require('express');
const _ = require('underscore');

let { verificaToken, verificaAdmin_role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../modelos/categoria');

/* Mostrar todas las categorias */
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre role correo')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias
            });
        });

});

/* Mostrar una categorias por ID */
app.get('/categoria/:categID', verificaToken, (req, res) => {
    let categoriaID = req.params.categID;

    Categoria.findById(categoriaID, (err, categoriaBD) => {
        if (err) {
            return res.status(403).json({
                ok: false,
                err
            });
        }

        if (!categoriaBD) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoría no encontrada'
                },
            });

        } else {
            res.status(200).json({
                ok: true,
                categoria: categoriaBD
            });
        }
    });

});

/* Crear nuevas categorias */
app.post('/categoria', verificaToken, (req, res) => {
    //Regresa la nueva categoria
    let desc = req.body.descripcion;

    let categoria = new Categoria({
        descripcion: desc,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaBD) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBD
        })
    });

});

/* Actualizar una categoria */
app.put('/categoria/:categID', verificaToken, (req, res) => {
    let categoriaID = req.params.categID;

    Categoria.findByIdAndUpdate(categoriaID, { descripcion: req.body.descripcion }, { new: true }, (err, actualizado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!actualizado) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.status(200).json({
            ok: true,
            categoria: actualizado
        });

    });

});


/* Elimina una categoria */
app.delete('/categoria/:categID', [verificaToken, verificaAdmin_role], (req, res) => {
    //Solo un administrador puede eliminar una categoria

    let categoriaID = req.params.categID;

    Categoria.findByIdAndRemove(categoriaID, (err, categoriaBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaBD) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoría no existe'
                }
            });
        }

        res.status(200).json({
            ok: true,
            message: 'Categoria borrada'
        })
    });

});



module.exports = app;