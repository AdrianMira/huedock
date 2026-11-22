import express from "express";
import { pool } from "./database.js"
import { fileURLToPath } from "node:url";

const app = express();
const PORT = 3000;

// MIDDLEWARES

app.use(express.static(fileURLToPath(new URL("../", import.meta.url))));
app.use(express.json());

// ENDPOINTS 

app.get("/api/health", (req, res) => {
    res.status(200).json({
        message: "HueDock API is working"
    });
})

app.get("/api/palettes", async (req, res) => {
    const palettes = await pool.query("SELECT p.id, p.name, c.hex_code, c.position FROM palettes p LEFT JOIN colors c ON p.id = c.palette_id ORDER BY p.id ASC, c.position ASC");

    const resPalettes = [];
    for (const row of palettes.rows) {

        let currentPalette = resPalettes.find(
            palette => palette.id === row.id
        );

        if (!currentPalette) {
            currentPalette = {
                id: row.id,
                paletteName: row.name,
                colors: []
            };

            resPalettes.push(currentPalette);
        }

        if (row.hex_code !== null) {
            currentPalette.colors.push(row.hex_code);
        }
    }

    res.status(200).json(resPalettes);
})

app.post("/api/palettes", async (req, res) => {
    const reqPalette = req.body;
    let client;

    try {
        client = await pool.connect();
        await client.query("BEGIN");

        const resPalette = await client.query("INSERT INTO palettes (name) VALUES ($1) RETURNING *", [reqPalette.paletteName]);

        const resColors = []
        for (let i = 0; i < reqPalette.colors.length; i++) {
            const color = reqPalette.colors[i];
            await client.query(
                "INSERT INTO colors (palette_id, hex_code, position) VALUES ($1, $2, $3)",
                [resPalette.rows[0].id, color, i + 1]
            );

            resColors.push(color);
        }

        const paletteCreated = {
            id: resPalette.rows[0].id,
            name: resPalette.rows[0].name,
            colors: resColors
        }

        await client.query("COMMIT");

        res.status(201).json(paletteCreated);

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }

        console.error(error);
        res.status(500).json({ message: "Error saving palette" });

    } finally {
        if (client) {
            await client.release();
        }
    }
})

app.delete("/api/palettes/:id", async (req, res) => {
    const paletteId = Number(req.params.id);

    // Eliminar con query
    const deletePalette = await pool.query("DELETE FROM palettes WHERE id = $1 RETURNING *", [paletteId]);

    // Determinar si el elemento existe
    if (deletePalette.rows.length === 0) {
        return res.status(404).json({ message: "Palette not found" });
    }

    // Enviar respuesta
    res.status(200).json({ message: "Palette eliminated" });
})

// ERROR MIDDLEWARE
app.use((error, req, res, next) => {
    console.error(error);

    res.status(500).json({
        message: "Internal server error"
    });
});

// LISTEN
app.listen(PORT, () => {
    console.log(`Connected to PORT: ${PORT}`)
});