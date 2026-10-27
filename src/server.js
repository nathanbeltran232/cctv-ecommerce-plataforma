const express = require('express');
const cors = require('cors');

// Inicializamos la aplicación
const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares (Configuraciones de seguridad y formato)
app.use(cors()); // Permite que el frontend se conecte sin bloqueos
app.use(express.json()); // Permite recibir datos en formato JSON

// Importamos nuestras rutas del catálogo
const catalogRoutes = require('./routes/catalog');
const quotationRoutes = require('./routes/quotation');

app.use('/api', catalogRoutes);
app.use('/api/quotation', quotationRoutes);

// Ruta de prueba para la raíz
app.get('/', (req, res) => {
    res.send('Quote CCTV server running');
});

// Arrancamos el servidor
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});