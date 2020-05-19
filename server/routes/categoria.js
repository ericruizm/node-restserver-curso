const express = require("express");

const {
    verificaToken,
    verificaAdmin_Role,
} = require("../middlewares/autenticacion");

let app = express();

let Categoria = require("../models/categoria");

// ===================
// Mostrar todas las categorias
// ==================

app.get("/categoria", verificaToken, (req, res) => {
    Categoria.find({})
        .sort("descripcion")
        .populate("usuario", "nombre email")
        .exec((err, categorias) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    err,
                });
            } else {
                res.json({
                    ok: true,
                    categorias,
                });
            }
        });
});

// ===================
// Mostrar una categoría por ID
// ==================

app.get("/categoria/:id", verificaToken, (req, res) => {
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err,
            });
        }

        if (!categoriaDB) {
            res.status(400).json({
                ok: false,
                err: {
                    message: "El id no es correcto",
                },
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB,
        });
    });
});

// ===================
// Crear nueva categoría
// ==================

app.post("/categoria", verificaToken, (req, res) => {
    //regresa la nueva categoría
    //req.usuario._id
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id,
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err,
            });
        }

        if (!categoriaDB) {
            res.status(400).json({
                ok: false,
                err,
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB,
        });
    });
});

// ===================
// Actualizar categoría por ID
// ==================

app.put("/categoria/:id", verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion,
    };

    Categoria.findByIdAndUpdate(
        id,
        descCategoria, { new: true, runValidators: true },
        (err, categoriaDB) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    err,
                });
            }

            if (!categoriaDB) {
                res.status(400).json({
                    ok: false,
                    err,
                });
            }

            res.json({
                ok: true,
                categoria: categoriaDB,
            });
        }
    );
});

// ===================
// Eliminar categoría
// ==================

app.delete(
    "/categoria/:id", [verificaToken, verificaAdmin_Role],
    (req, res) => {
        //Solo un admin puede borrar las categorías
        //Categoria.findByIdAndRemove

        let id = req.params.id;
        //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    err,
                });
            }

            if (!categoriaDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: "El id no existe",
                    },
                });
            }
            res.json({
                ok: true,
                message: "Categoría borrada",
            });
        });
    }
);

module.exports = app;