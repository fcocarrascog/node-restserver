const express = require('express');
const _ = require('underscore');

const { verificaToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../modelos/producto');


/* OBTENER TODOS LOS PRODUCTOS */
app.get('/productos', (req, res) => {
    //Trae todos los productos
    //populate: usuario categoria
    //paginado
    let desde = req.query.desde;
    desde = Number(desde);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(10)
        .sort('nombre')
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre correo')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.countDocuments({ disponible: true }, (err, total) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                if (total <= 0) {
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'No hay productos registrados'
                        }
                    });
                }

                res.json({
                    ok: true,
                    total,
                    productos
                })
            })


        });
});

/* OBTENER PRODUCTO POR ID */
app.get('/productos/:prodID', verificaToken, (req, res) => {
    //populate: usuario categoria
    let productoID = req.params.prodID;

    Producto.findById(productoID)
        .populate('usuario', 'correo nombre')
        .populate('categoria', 'descripcion')
        .exec((err, productoBD) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoBD) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El producto no existe'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoBD
            });
        });

});


/* BUSCA PRODUCTOS */
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.status(200).json({
                ok: true,
                productos
            });
        });
});


/* CREAR PRODUCTO */
app.post('/productos', verificaToken, (req, res) => {
    //grabar el usuario
    //grabar categoria del listado
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible || true,
        categoria: body.categoria,
        usuario: body.usuario._id
    });

    producto.save((err, productoBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoBD
        });
    });


});


/* ACTUALIZAR PRODUCTO POR ID */
app.put('/productos/:produID', verificaToken, (req, res) => {
    //grabar el usuario
    //grabar categoria del listado
    let productoID = req.params.produID;

    let body = _.pick(req.body, ['disponible', 'nombre', 'precioUni', 'descripcion', 'categoria']);

    Producto.findByIdAndUpdate(productoID, body, { new: true }, (err, productoActualizado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!productoActualizado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto ingresado no existe'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoActualizado
        });
    });
});


/* BORRAR PRODUCTO POR ID */
app.delete('/productos/:prodID', verificaToken, (req, res) => {
    //grabar el usuario
    //grabar categoria del listado
    //estado de Disponible a falso
    let productoID = req.params.prodID;
    let usuarioID = req.usuario._id;

    let updateDisponibilidad = {
        disponible: false,
        usuario: usuarioID
    };

    Producto.findByIdAndUpdate(productoID, updateDisponibilidad, { new: true }, (err, productoEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoEliminado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto ingresado no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Producto eliminado',
            producto: productoEliminado
        })
    });
});



module.exports = app;