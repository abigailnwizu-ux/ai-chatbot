const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authenticateToken } = require("../middleware/auth");

// Get all calendar entries in a campaign
router.get("/campaign/:campaignId",async (req, res) => {
  try {
    const entries = await prisma.calendarEntry.findMany({
      where: { campaignId: req.params.campaignId },
      include: { asset: true }
    });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create calendar entry
router.post("/", async (req, res) => {
  try {
    const { campaignId, assetId, scheduledAt, status } = req.body;
    const entry = await prisma.calendarEntry.create({
      data: { campaignId, assetId, scheduledAt, status }
    });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
