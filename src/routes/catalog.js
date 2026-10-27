const express = require('express');
const router = express.Router();

// Importamos los datos (JSON)
const paquetes = require('../../data/paquetes.json');
const productos = require('../../data/productos.json');
const servicios = require('../../data/servicios.json');

// Rutas GET (Para leer información)
router.get('/paquetes', (req, res) => {
    res.json(paquetes);
});

router.get('/productos', (req, res) => {
    res.json(productos);
});

router.get('/servicios', (req, res) => {
    res.json(servicios);
});

module.exports = router;