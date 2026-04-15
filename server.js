const express = require('express');
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg');
const http = require('http');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configurar conexión a la Base de Datos PostgreSQL en Railway
let pool;
if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    pool.query(`
        CREATE TABLE IF NOT EXISTS historial_riego (
            id SERIAL PRIMARY KEY,
            temperatura DECIMAL,
            humedad_ambiente DECIMAL,
            humedad_suelo DECIMAL,
            bomba_estado BOOLEAN,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `).then(() => console.log("✅ Tabla 'historial_riego' lista."))
      .catch(err => console.error("❌ Error creando tabla:", err));
} else {
    console.warn("⚠️ Advertencia: No se detectó DATABASE_URL.");
}

// ── PROXY DE CÁMARA (SNAPSHOT) ──────────────────────────────────────────
// GET /proxy-cam?url=https://tu-pinggy-url.com
// Actúa como puente: Railway descarga el /shot.jpg y lo entrega al navegador
// El navegador solo habla con Railway → sin restricciones CORS ni bloqueos
app.get('/proxy-cam', (req, res) => {
    const camBaseUrl = req.query.url;
    if (!camBaseUrl) return res.status(400).send('Falta parámetro url');

    const snapshotUrl = camBaseUrl.replace(/\/$/, '') + '/shot.jpg';
    const client = snapshotUrl.startsWith('https') ? https : http;

    const proxyReq = client.get(snapshotUrl, (proxyRes) => {
        res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/jpeg');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-store');
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.warn('Error proxy cámara:', err.message);
        res.status(502).send('No se pudo conectar a la cámara');
    });
    proxyReq.setTimeout(5000, () => {
        proxyReq.destroy();
        res.status(504).send('Timeout cámara');
    });
});

// ── TELEMETRÍA ──────────────────────────────────────────────────────────
app.post('/api/telemetria', async (req, res) => {
    console.log("==> Recibido del ESP32:", req.body);
    if (pool) {
        try {
            const { temperatura, humedad_ambiente, humedad_suelo, bomba } = req.body;
            await pool.query(
                `INSERT INTO historial_riego (temperatura, humedad_ambiente, humedad_suelo, bomba_estado) VALUES ($1, $2, $3, $4)`,
                [temperatura, humedad_ambiente, humedad_suelo, bomba]
            );
            res.json({ success: true, message: "Datos guardados en PostgreSQL exitosamente." });
        } catch (error) {
            console.error("Error BD:", error);
            res.status(500).json({ error: "Error al guardar en la base de datos." });
        }
    } else {
        res.json({ success: false, message: "BD no configurada." });
    }
});

app.get('/api/telemetria/historial', async (req, res) => {
    if (pool) {
        try {
            const result = await pool.query('SELECT * FROM historial_riego ORDER BY id DESC LIMIT 30');
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: "No se pudo obtener el historial." });
        }
    } else {
        res.json([]);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`📡 Servidor Railway-Riego activo en el puerto ${PORT}`);
});
