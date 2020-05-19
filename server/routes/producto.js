const express = require("express");

const { verificaToken } = require("../middlewares/autenticacion");

let app = express();

let Producto = require("../models/producto");

//===================
// Obtener todos los productos
//===================

app.get("/productos", verificaToken, (req, res) => {
  let desde = req.query.desde || 0;
  desde = Number(desde); //se transforma en numero porque es un string

  Producto.find({ disponible: true })
    .skip(desde)
    .limit(5)
    .populate("usuario", "nombre email")
    .populate("categoria", "descripción")
    .exec((err, productos) => {
      if (err) {
        res.status(500).json({
          ok: false,
          err,
        });
      } else {
        res.json({
          ok: true,
          productos,
        });
      }
    });
  //trae todos los productos
  //populate: usuario categoria
  //paginado
});

//===================
// Obtener un producto por ID
//===================

app.get("/productos/:id", verificaToken, (req, res) => {
  let id = req.params.id;

  Producto.findById(id)
    .populate("usuario", "nombre email")
    .populate("categoria", "descripcion")
    .exec((err, productoDB) => {
      if (err) {
        res.status(500).json({
          ok: false,
          err,
        });
      }

      if (!productoDB) {
        res.status(400).json({
          ok: false,
          err: {
            message: "El id no es correcto",
          },
        });
      }

      res.json({
        ok: true,
        producto: productoDB,
      });
    });
  //populate: usuario categoria
  //paginado
});

//===================
// Buscar productos
//===================

app.get("/productos/buscar/:termino", verificaToken, (req, res) => {
  let termino = req.params.termino;
  let regex = new RegExp(termino, "i");

  Producto.find({ nombre: regex })
    .populate("categoria", "nombre")
    .exec((err, productos) => {
      if (err) {
        res.status(500).json({
          ok: false,
          err,
        });
      }
      res.json({
        ok: true,
        productos,
      });
    });
});

//===================
// Crear un nuevo producto
//===================

app.post("/productos", verificaToken, (req, res) => {
  let body = req.body;

  let producto = new Producto({
    usuario: req.usuario._id,
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    disponible: body.disponible,
    categoria: body.categoria,
  });

  producto.save((err, productoDB) => {
    if (err) {
      res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!productoDB) {
      res.status(400).json({
        ok: false,
        err,
      });
    }

    res.status(201).json({
      ok: true,
      producto: productoDB,
    });
  });
  // Grabar el usuario
  // Grabar una categoria
});

//===================
// Actualizar un nuevo producto
//===================

app.put("/productos/:id", verificaToken, (req, res) => {
  let id = req.params.id;
  let body = req.body;

  Producto.findById(id, (err, productoDB) => {
    if (err) {
      res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!productoDB) {
      res.status(400).json({
        ok: false,
        err,
      });
    }

    productoDB.nombre = body.nombre;
    productoDB.precioUni = body.precioUni;
    productoDB.descripcion = body.descripcion;
    productoDB.categoria = body.categoria;
    productoDB.disponible = body.disponible;

    productoDB.save((err, productoGuardado) => {
      if (err) {
        res.status(500).json({
          ok: false,
          err,
        });
      }
      res.json({
        ok: true,
        producto: productoGuardado,
      });
    });
  });
  // Grabar el usuario
  // Grabar una categoria
});

//===================
// Borrar un producto
//===================

app.delete("/productos/:id", verificaToken, (req, res) => {
  let id = req.params.id;
  let body = req.body;
  //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

  let cambioEstado = {
    disponible: false,
  };
  Producto.findByIdAndUpdate(
    id,
    cambioEstado,
    { new: true },
    (err, productoBorrado) => {
      if (err) {
        res.status(400).json({
          ok: false,
          err,
        });
      }

      if (!productoBorrado) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Producto no encontrado",
          },
        });
      }
      res.json({
        ok: true,
        producto: productoBorrado,
        message: "Producto Borrado",
      });
    }
  );
  // El disponible pasa a falso
});

module.exports = app;
