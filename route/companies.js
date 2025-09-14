const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET all companies (render view)
router.get("/", async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: "asc" }, // optional: sort alphabetically
    });

    // Always pass `companies` (even if it's an empty array)
    res.render("companies", { companies });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).send("Server Error");
  }
});

// Example: GET all companies (API style, JSON response)
router.get("/api", async (req, res) => {
  try {
    const companies = await prisma.company.findMany();
    res.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
