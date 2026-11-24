const express = require('express');
const path = require('path');
const cors = require('cors');

const catalogRoutes = require('./routes/catalog');
const quotationRoutes = require('./routes/quotation');
const authRoutes = require('./routes/auth');
const { processOrder, cancelOrder, requestReturn, getBookedAppointments, getOrders } = require('./controllers/orderController');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Sirve la interfaz grafica
app.use(express.static(path.join(__dirname, '../public')));

// Rutas de API
app.use('/api', catalogRoutes);
app.use('/api/quotation', quotationRoutes);
app.use('/api/auth', authRoutes);

// Rutas de Pedidos y Logistica
app.post(['/api/pedidos', '/api/v1/pedidos'], processOrder);
app.patch('/api/pedidos/:folio/cancelar', cancelOrder);
app.patch('/api/pedidos/:folio/devolucion', requestReturn);
app.get('/api/calendario', getBookedAppointments);
app.get('/api/pedidos', getOrders);


app.listen(PORT, () => {
    console.log(`Servidor CCTV activo en http://localhost:${PORT}`);
});