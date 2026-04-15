# 🌿 HydroSmart - Sistema de Riego Hidropónico IoT

Plataforma integral para el monitoreo y control de cultivos hidropónicos en tiempo real, con visualización 3D y streaming de video en vivo.

## 🚀 Arquitectura del Sistema

El proyecto utiliza una arquitectura de 4 capas para garantizar escalabilidad y robustez:

1.  **Hardware (ESP32):** Encargado de capturar telemetría (Humedad Suelo, Humedad Ambiente, Temperatura) y controlar actuadores (Bomba de riego).
2.  **Backend (Node.js + Express):** Servidor alojado en **Railway** que actúa como puente de datos y proxy de video.
3.  **Base de Datos (PostgreSQL):** Persistencia de datos históricos para análisis predictivo.
4.  **Frontend (HTML5/CSS3/JS):** Dashboard profesional con visualización 3D (Three.js) e indicadores dinámicos.

---

## 📸 Sistema de Video en Tiempo Real

Para superar las restricciones de seguridad (CORS) y latencia, el sistema implementa un **Túnel de Proxy Híbrido**:

- **Origen:** El celular utiliza la app *IP Webcam* para generar un stream MJPEG local.
- **Túnel:** Se utiliza *Pinggy* o *Ngrok* (vía Termux) para exponer el puerto local a una URL pública.
- **Proxy Railway:** El servidor Node.js incluye un endpoint `/proxy-stream` que descarga el video y lo retransmite al Dashboard. Esto permite que el video se vea en cualquier lugar del mundo sin configurar puertos en el router.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** HTML Vanila, Three.js (Motor 3D), FontAwesome, Google Fonts (Outfit/Inter).
- **Backend:** Node.js, Express.js.
- **Base de Datos:** PostgreSQL (pg pool).
- **IoT:** ESP32, C++, Protocolo HTTP POST para telemetría.
- **Despliegue:** Railway (CI/CD desde GitHub).

---

## 📡 Endpoints de la API

| Endpoint | Método | Descripción |
| :--- | :--- | :--- |
| `/api/telemetria` | `POST` | Recibe datos del ESP32 y los guarda en la BD. |
| `/api/telemetria/historial` | `GET` | Devuelve los últimos 30 registros para gráficas. |
| `/proxy-stream` | `GET` | Proxy de video MJPEG fluido. |
| `/proxy-cam` | `GET` | Proxy de snapshots (shot.jpg). |

---

## 📋 Configuración para Futuros Desarrolladores

Para continuar el desarrollo, ten en cuenta:

1.  **Sincronización:** El archivo `index.html` en este repo debe ser una copia fiel de la versión de desarrollo.
2.  **Variables de Entorno:** Railway gestiona `DATABASE_URL` automáticamente.
3.  **Modos del Dashboard:**
    - `Modo Demo:` Usa un simulador interno en JS (ideal para pruebas sin hardware).
    - `Modo Real:` Consulta la API de Railway en vivo.

---

**Desarrollado por:** Roberto Guillot
**Desplegado en:** [Railway App](https://railway.app)
