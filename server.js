const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Permite recibir JSON del ESP32

// Servir la carpeta actual (el dashboard HTML) como archivos estáticos
app.use(express.static(path.join(__dirname)));

// Este endpoint luego lo conectaremos a la base de datos de Railway
app.post('/api/telemetria', (req, res) => {
    console.log("==> Datos recibidos del ESP32 en la nube:", req.body);
    
    // Aquí más adelante haremos: database.insert(req.body);

    res.json({ success: true, message: "Datos guardados en la nube temporalmente." });
});

// Endpoint para que el Dashboard pueda leer los datos de la nube
app.get('/api/telemetria/ultima', (req, res) => {
    // Aquí leeremos la base de datos SQL para devolverla al Dashboard
    res.json({ status: "Base de Datos Pendiente de conexión" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`📡 Servidor de Railway-Riego escuchando en el puerto ${PORT}`);
});
