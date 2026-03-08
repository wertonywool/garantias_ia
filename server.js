const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Gemini AI (Backend seguro)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "TU_API_KEY_AQUI");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Actualizado a 2.0 Flash

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

// --- API ENDPOINT: CONSULTA IA (Cerebro IA) ---
app.post('/api/ia/consultar', async (req, res) => {
    const { objeto } = req.body;
    if (!objeto) return res.status(400).json({ error: "Objeto requerido" });

    const hoy = new Date().toISOString().split('T')[0];
    const prompt = `Actúa como experto en mantenimiento técnico para 'The Workers'. 
    Analiza este activo: "${objeto}".
    Responde ÚNICAMENTE con un objeto JSON válido con esta estructura:
    {
      "nombre_objeto": "nombre normalizado",
      "categoria_sugerida": "Tecnología|Vehículos|Herramientas|Electrodomésticos",
      "sugerencias": [
        {
          "tarea": "nombre de la tarea",
          "frecuencia_dias": 30,
          "importancia": "Alta|Media|Baja",
          "descripcion": "explicación breve"
        }
      ]
    }
    Fecha de referencia: ${hoy}.`;

    try {
        const result = await model.generateContent(prompt);
        const text = (await result.response).text();
        // Limpiar el texto para asegurar que solo haya JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("La IA no devolvió un JSON válido.");
        const data = JSON.parse(jsonMatch[0]);
        res.json(data);
    } catch (error) {
        console.error("Error Gemini:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- API ENDPOINT: BUSCAR IMAGEN (Mega-Buscador Realista) ---
app.post('/api/ia/buscar-imagen', async (req, res) => {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: "Nombre requerido" });

    try {
        // 1. Usar Gemini para obtener mejores términos de búsqueda
        const prompt = `Para el producto "${nombre}", responde solo con un JSON: {"query": "nombre comercial exacto para buscar en google images"}`;
        const result = await model.generateContent(prompt);
        const text = (await result.response).text();
        const keywords = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);

        // 2. Intento con Google Custom Search (si hay llaves)
        const googleKey = process.env.GOOGLE_SEARCH_KEY;
        const googleCx = process.env.GOOGLE_CX;
        
        if (googleKey && googleCx) {
            const url = `https://www.googleapis.com/customsearch/v1?key=${googleKey}&cx=${googleCx}&q=${encodeURIComponent(keywords.query)}&searchType=image&num=1&imgSize=medium`;
            const resp = await fetch(url);
            const data = await resp.json();
            if (data.items && data.items.length > 0) {
                return res.json({ image_url: data.items[0].link, source: 'Google' });
            }
        }

        // 3. Fallback: LoremFlickr (basado en keywords de la IA)
        const fallbackUrl = `https://loremflickr.com/800/600/${encodeURIComponent(keywords.query.split(' ')[0])}?lock=${Math.random()}`;
        res.json({ image_url: fallbackUrl, source: 'AI Keywords Fallback' });
    } catch (error) {
        console.error("Error buscando imagen:", error);
        res.status(500).json({ error: error.message });
    }
});

// Servir el frontend para cualquier otra ruta (SPA fallback opcional)
app.get('/:path*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Gemini 12 Server corriendo en puerto ${PORT}`);
    console.log(`🔗 Ecosistema 'The Workers' activo`);
});