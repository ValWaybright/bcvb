import express from "express";
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

// Configuration du WebSocket pour Neon
neonConfig.webSocketConstructor = ws;

const app = express();
const port = process.env.PORT || 4242;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à la base
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ---- Routes de test ----
app.get("/", (req, res) => {
  res.send("test de démarrage du serveur ☑️");
});

app.get("/api/clients", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as current_time");
    res.json({
      message: "Connexion à la base de données réussie",
      current_time: result.rows[0].current_time,
    });
  } catch (error) {
    console.error("Erreur lors de la connexion à la base de données:", error);
    res.status(500).json({ message: "Erreur lors de la connexion à la base de données" });
  }
});

// ---- Routes CRUD pour les cartes ----

// GET toutes les cartes
app.get("/api/cartes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cartes_yugioh ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des cartes:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des cartes" });
  }
});

// GET une carte par ID
app.get("/api/cartes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM cartes_yugioh WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Carte non trouvée" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération de la carte:", error);
    res.status(500).json({ message: "Erreur lors de la récupération de la carte" });
  }
});

// POST ajouter une carte (avec description et effet)
app.post("/api/cartes", async (req, res) => {
  const {
    nom,
    attribut,
    type1,
    type2,
    type3,
    type4,
    niveau,
    rang,
    lien,
    reference,
    image_url,
    description,
    effet,
    quantite,
  } = req.body;

  // Validation des champs obligatoires
  if (!nom || !type1 || !reference) {
    return res.status(400).json({ message: "Nom, type1 et référence sont obligatoires" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO cartes_yugioh 
       (nom, attribut, type1, type2, type3, type4, niveau, rang, lien, reference, image_url, description, effet, quantite) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
       RETURNING *`,
      [
        nom,
        attribut || null,
        type1,
        type2 || null,
        type3 || null,
        type4 || null,
        niveau || null,
        rang || null,
        lien || null,
        reference,
        image_url || null,
        description || null,
        effet || null,
        quantite || 1,
      ]
    );
    res.status(201).json({
      message: "Carte ajoutée avec succès ☑️",
      carte: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la carte:", error);
    res.status(500).json({ message: "Erreur lors de l'ajout de la carte" });
  }
});

// PUT modifier une carte
app.put("/api/cartes/:id", async (req, res) => {
  const { id } = req.params;
  const {
    nom,
    attribut,
    type1,
    type2,
    type3,
    type4,
    niveau,
    rang,
    lien,
    reference,
    image_url,
    description,
    effet,
    quantite,
  } = req.body;

  if (!nom || !type1 || !reference) {
    return res.status(400).json({ message: "Nom, type1 et référence sont obligatoires" });
  }

  try {
    const result = await pool.query(
      `UPDATE cartes_yugioh 
       SET nom = $1, attribut = $2, type1 = $3, type2 = $4, type3 = $5, type4 = $6, 
           niveau = $7, rang = $8, lien = $9, reference = $10, image_url = $11, 
           description = $12, effet = $13, quantite = $14
       WHERE id = $15 
       RETURNING *`,
      [
        nom,
        attribut || null,
        type1,
        type2 || null,
        type3 || null,
        type4 || null,
        niveau || null,
        rang || null,
        lien || null,
        reference,
        image_url || null,
        description || null,
        effet || null,
        quantite || 1,
        id,
      ]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Carte non trouvée" });
    }
    res.json({
      message: "Carte modifiée avec succès ☑️",
      carte: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur lors de la modification de la carte:", error);
    res.status(500).json({ message: "Erreur lors de la modification de la carte" });
  }
});

// DELETE supprimer une carte
app.delete("/api/cartes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM cartes_yugioh WHERE id = $1 RETURNING *", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Carte non trouvée" });
    }
    res.json({
      message: "Carte supprimée avec succès ☑️",
      carte: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la carte:", error);
    res.status(500).json({ message: "Erreur lors de la suppression de la carte" });
  }
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port} 🌐`);
});

app.get("/api/cartes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM cartes_yugioh WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Carte non trouvée" });
    }
    res.json({
      message: "Carte trouvée avec succès ☑️",
      carte: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la carte:", error);
    res.status(500).json({ message: "Erreur lors de la récupération de la carte" });
  }
});

app.put("/api/cartes/:id", async (req, res) => {
  const { id } = req.params;
  const { nom, attribut, type1, type2, type3, type4, niveau, rang, lien, reference, image_url, description, effet, quantite } = req.body;
 if (!nom || !type1 || !reference) {
    return res.status(400).json({ message: "Nom, type1 et référence sont obligatoires" });
  };
  try {
    const result = await pool.query(
      `UPDATE cartes_yugioh 
       SET nom = $1, attribut = $2, type1 = $3, type2 = $4, type3 = $5, type4 = $6,
           niveau = $7, rang = $8, lien = $9, reference = $10, image_url = $11, 
           description = $12, effet = $13, quantite = $14
       WHERE id = $15 
       RETURNING *`,
      [
        nom,
        attribut || null,
        type1,
        type2 || null,
        type3 || null,
        type4 || null,
        niveau || null,
        rang || null,
        lien || null,
        reference,
        image_url || null,
        description || null,
        effet || null,
        quantite || 1,
        id,
      ]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Carte non trouvée" });
    }
    res.json({
      message: "Carte modifiée avec succès ☑️",
      carte: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur lors de la modification de la carte:", error);
    res.status(500).json({ message: "Erreur lors de la modification de la carte" });
  }
});
