const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authenticateToken } = require("../middleware/auth");

// Get all campaigns in a workspace
router.get("/:workspaceId", authenticateToken, async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { workspaceId: parseInt(req.params.workspaceId) },
      include: { strategies: true, assets: true, calendar: true }
    });
    console.log("Nanami")
    res.render("campaign",{campaigns});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create campaign
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { workspaceId, name, description, startDate, endDate } = req.body;
    const campaign = await prisma.campaign.create({
      data: { workspaceId, name, description, startDate, endDate }
    });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update campaign
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body;
    const campaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: { name, description, startDate, endDate }
    });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete campaign
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await prisma.campaign.delete({ where: { id: req.params.id } });
    res.json({ message: "Campaign deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
