const express = require('express');
const router = express.Router();

const packages = require('../../data/paquetes.json');
const products = require('../../data/productos.json');
const services = require('../../data/servicios.json');

// Returns all items unified so the catalog renders all categories
router.get(['/productos', '/catalogo'], (req, res) => {
    const fullCatalog = [...packages, ...products, ...services];
    return res.status(200).json(fullCatalog);
});

router.get('/paquetes', (req, res) => res.status(200).json(packages));
router.get('/servicios', (req, res) => res.status(200).json(services));

module.exports = router;