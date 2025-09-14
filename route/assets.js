const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authenticateToken } = require("../middleware/auth");

// Get all assets in a campaign
router.get("/campaign/:campaignId", authenticateToken, async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      where: { campaignId: req.params.campaignId },
      include: { versions: true }
    });
    res.render("assets",{assets});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create asset
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { campaignId, type, title, content, status } = req.body;
    const asset = await prisma.asset.create({
      data: { campaignId, type, title, content, status }
    });
    res.json(asset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update asset
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { type, title, content, status } = req.body;
    const asset = await prisma.asset.update({
      where: { id: req.params.id },
      data: { type, title, content, status }
    });
    res.json(asset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete asset
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await prisma.asset.delete({ where: { id: req.params.id } });
    res.json({ message: "Asset deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
