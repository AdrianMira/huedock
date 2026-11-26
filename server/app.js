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

app.get("/api/palettes", async (req, res, next) => {
    try {
        const palettes = await pool.query(
            "SELECT p.id, p.name, c.hex_code, c.position FROM palettes p LEFT JOIN colors c ON p.id = c.palette_id ORDER BY p.id ASC, c.position ASC"
        );

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

    } catch (error) {
        console.error(error);
        next(error);
    }
});

app.post("/api/palettes", async (req, res, next) => {
    const reqPalette = req.body;
    let client;

    // Validate request body
    if (!reqPalette || !isValidPaletteName(reqPalette.paletteName)) {
        return res.status(400).json({ message: "Palette name must contain between 1 and 50 characters" });
    }

    if (!Array.isArray(reqPalette.colors) || reqPalette.colors.length < 3 || reqPalette.colors.length > 5) {
        return res.status(400).json({ message: "Palette must contain between 3 and 5 colors" });
    }

    for (const color of reqPalette.colors) {
        if (!isValidHex(color)) {
            return res.status(400).json({ message: "All colors must be valid HEX codes" });
        }
    }

    try {
        client = await pool.connect();
        await client.query("BEGIN");

        const resPalette = await client.query(
            "INSERT INTO palettes (name) VALUES ($1) RETURNING *",
            [reqPalette.paletteName.trim()]
        );

        const resColors = [];

        for (let i = 0; i < reqPalette.colors.length; i++) {
            const color = reqPalette.colors[i].toUpperCase();

            await client.query(
                "INSERT INTO colors (palette_id, hex_code, position) VALUES ($1, $2, $3)",
                [resPalette.rows[0].id, color, i + 1]
            );

            resColors.push(color);
        }

        const paletteCreated = {
            id: resPalette.rows[0].id,
            paletteName: resPalette.rows[0].name,
            colors: resColors
        };

        await client.query("COMMIT");

        res.status(201).json(paletteCreated);

    } catch (error) {
        if (client) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Rollback error:", rollbackError);
            }
        }

        console.error(error);
        next(error);

    } finally {
        if (client) {
            client.release();
        }
    }
});

app.delete("/api/palettes/:id", async (req, res, next) => {
    const paletteId = Number(req.params.id);

    if (!Number.isSafeInteger(paletteId) || paletteId <= 0 || !/^[0-9]+$/.test(req.params.id)) {
        return res.status(400).json({ message: "Invalid palette ID" });
    }

    try {
        const deletePalette = await pool.query(
            "DELETE FROM palettes WHERE id = $1 RETURNING *",
            [paletteId]
        );

        if (deletePalette.rows.length === 0) {
            return res.status(404).json({ message: "Palette not found" });
        }

        res.status(200).json({ message: "Palette eliminated" });

    } catch (error) {
        console.error(error);
        next(error);
    }
});


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

//// VALIDATION

function isValidHex(hex) {
    return typeof hex === "string" && /^#[0-9a-fA-F]{6}$/.test(hex);
}

function isValidPaletteName(name) {
    return typeof name === "string" && name.trim().length > 0 && name.trim().length <= 50;
}
