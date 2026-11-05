const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 1. Servir los archivos estáticos de tu Frontend (carpeta public/)
app.use(express.static(path.join(__dirname, '../public')));

// Base de datos en memoria (Patrón Repository / Singleton en memoria)
const catalogo = [
  { id: 'PAQ-01', nombre: 'Kit Hogar Seguro (4 Cámaras 1080p)', categoria: 'paquete', tipo: 'producto', precio: 3850, descripcion: '4 cámaras bala exterior, DVR 4 canales, fuentes y 80m cable UTP.' },
  { id: 'PAQ-02', nombre: 'Paquete PyME Blindada (8 Cámaras 2K + Instalación)', categoria: 'paquete', tipo: 'ambos', precio: 11200, descripcion: '8 cámaras QHD visión nocturna, NVR, HDD 1TB e instalación norma ISO.' },
  { id: 'PROD-01', nombre: 'Cámara Domo IP WiFi 2K Audio Bidireccional', categoria: 'producto', tipo: 'producto', precio: 1250, descripcion: 'Detección de movimiento, visión 360° y monitoreo en app móvil.' },
  { id: 'SERV-01', nombre: 'Instalación Profesional Certificada (1 a 4 Cámaras)', categoria: 'servicio', tipo: 'servicio', precio: 1600, descripcion: 'Montaje estético bajo norma ISO, configuración móvil y capacitación.' }
];

const pedidos = [];
const citasOcupadas = ['2026-11-10_09:00', '2026-11-12_13:00'];

// 2. Endpoint GET Catálogo (compatible con /api/productos y /api/v1/productos)
app.get(['/api/productos', '/api/v1/productos'], (req, res) => {
  res.json(catalogo);
});

// 3. Endpoint POST Cotizador Dinámico (Patrón Strategy para reglas de precio)
app.post(['/api/cotizar', '/api/v1/cotizar'], (req, res) => {
  const { numCamaras = 4, precioCamara = 850, costoCableado = 350, inmueble = 'Hogar', hdd = true, ups = false, appMovil = true } = req.body;
  const grabadorBase = numCamaras <= 4 ? 1400 : numCamaras <= 8 ? 2400 : 4200;
  const factorInmueble = inmueble === 'PyME' ? 1.10 : 1.0;

  const subtotalEquipo = (numCamaras * precioCamara) + grabadorBase;
  const subtotalInstalacion = Math.round((numCamaras * costoCableado) * factorInmueble);
  const subtotalAccesorios = (hdd ? 1100 : 0) + (ups ? 1450 : 0) + (appMovil ? 400 : 0);

  const subtotal = subtotalEquipo + subtotalInstalacion + subtotalAccesorios;
  const iva = +(subtotal * 0.16).toFixed(2);
  const total = +(subtotal + iva).toFixed(2);

  res.json({ subtotalEquipo, subtotalInstalacion, subtotalAccesorios, subtotal, iva, total });
});

// 4. Endpoint POST Checkout y Agenda con Idempotencia
app.post(['/api/pedidos', '/api/v1/pedidos'], (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];
  if (idempotencyKey && pedidos.some(p => p.folio === idempotencyKey)) {
    return res.status(200).json({ mensaje: 'Pedido ya procesado (Idempotente)', pedido: pedidos.find(p => p.folio === idempotencyKey) });
  }

  const nuevoPedido = req.body;
  if (nuevoPedido.citaInstalacion) {
    const claveCita = nuevoPedido.citaInstalacion.slice(0, 16).replace('T', '_');
    if (citasOcupadas.includes(claveCita)) {
      return res.status(409).json({ error: 'El horario seleccionado ya está ocupado.' });
    }
    citasOcupadas.push(claveCita);
  }

  pedidos.unshift(nuevoPedido);
  res.status(201).json({ mensaje: 'Pedido confirmado', pedido: nuevoPedido });
});

app.listen(PORT, () => {
  console.log(`Servidor CCTV activo en http://localhost:${PORT}`);
});