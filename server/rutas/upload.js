const express = require('express');
const fileUpload = require('express-fileupload');

const app = express();

const Usuario = require('../modelos/usuario');
const Producto = require('../modelos/producto');

const fs = require('fs');
const path = require('path');


app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se han seleccionado archivos'
            }
        });
    }

    let archivoSubido = req.files.archivo;
    let nombreArchivoCortado = archivoSubido.name.split('.');
    let extension = nombreArchivoCortado[nombreArchivoCortado.length - 1]; //Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        //No encontro la extension
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son: ' + extensionesValidas.join(', '),
                extension
            }
        })
    }

    //VALIDAR TIPO
    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        //No lo encontró
        return res.status(400).json({
            ok: false,
            err: {
                message: `Los tipos permitidos son: ${tiposValidos.join(', ')}.`,
                tipo
            }
        });
    }

    //CAMBIAR NOMBRE AL ARCHIVO
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    archivoSubido.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //AQUI, LA IMAGEN SE CARGO
        if (tipo === 'usuarios') imagenUsuario(id, res, nombreArchivo);
        else if (tipo === 'productos') imagenProducto(id, res, nombreArchivo);
        else {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Ops! Ha ocurrido un error.'
                }
            });
        }

    });

});


function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioBD) => {
        if (err) {
            borraArchivo('usuarios', nombreArchivo);
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioBD) {
            borraArchivo('usuarios', nombreArchivo);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario no existe'
                }
            });
        }

        borraArchivo('usuarios', usuarioBD.img);

        usuarioBD.img = nombreArchivo;

        usuarioBD.save((err, usuarioGuardado) => {
            if (err) {
                borraArchivo('usuarios', nombreArchivo);
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        });

    });
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoBD) => {
        if (err) {
            borraArchivo('productos', nombreArchivo);
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoBD) {
            borraArchivo('productos', nombreArchivo);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        borraArchivo('productos', productoBD.img);

        productoBD.img = nombreArchivo;

        productoBD.save((err, productoGuardado) => {
            if (err) {
                borraArchivo('productos', nombreArchivo)
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.status(201).json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });
    });
}

function borraArchivo(tipo, nombreArchivo) {
    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${ nombreArchivo}`);

    if (fs.existsSync(pathImg)) {
        //Borrar imagen
        fs.unlinkSync(pathImg);
    }

}


module.exports = app;