// ============================================
// server.js - Main backend server
// Nutrition Checker App
// ============================================

// Load environment variables dari file .env
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Parse JSON body dari request
app.use(express.json());

// Sajikan folder frontend sebagai static files
// Ini supaya Express bisa serve HTML/CSS/JS kita
const path = require("path");
app.use(express.static(path.join(__dirname, "../frontend")));

// Routes

app.get("/api/nutrition", async (req, res) => {
  const { ingredient, quantity } = req.query;

  // Validasi Input
  if (!ingredient || ingredient.trim() === "") {
    return res.status(400).json({
      error: "Ingredient name is required.",
    });
  }

  // Bangun Query String untuk API Ninja
  // Contoh hasil: "2 lbs Organic Chia Seeds"
  // Jika quantity tidak diisi, kirim ingredient saja
  const queryString = quantity
    ? `${quantity.trim()} ${ingredient.trim()}`
    : ingredient.trim();

  try {
    // Panggil API Ninja
    const response = await axios.get(
      "https://api.api-ninjas.com/v1/nutrition",
      {
        params: { query: queryString },
        headers: {
          "X-Api-Key": process.env.API_NINJA_KEY,
        },
      },
    );

    const data = response.data;

    // Cek apakah API mengembalikan hasil
    if (!data || data.length === 0) {
      return res.status(404).json({
        error: `No nutritional data found for "${ingredient}". Please check the ingredient name and try again.`,
      });
    }

    // Kirim data kembali ke frontend
    return res.status(200).json(data);
  } catch (error) {
    // Error Handling
    console.error("API call failed:", error.message);

    // Jika error dari API Ninja (mis. API key salah)
    if (error.response) {
      return res.status(error.response.status).json({
        error:
          "Failed to fetch data from nutrition API. Please try again later.",
      });
    }

    // Error lainnya (network, dll)
    return res.status(500).json({
      error: "Internal server error. Please try again later.",
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
