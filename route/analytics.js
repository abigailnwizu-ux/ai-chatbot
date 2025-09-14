const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authenticateToken } = require("../middleware/auth");

// Get analytics events for a workspace
router.get("/", async(req,res) =>{
  res.render("analytics");
});
router.get("/:workspaceId", authenticateToken, async (req, res) => {
  try {
    const events = await prisma.analyticsEvent.findMany({
      where: { workspaceId: req.params.workspaceId }
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add analytics event
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { workspaceId, accountId, assetId, type, value } = req.body;
    const event = await prisma.analyticsEvent.create({
      data: { workspaceId, accountId, assetId, type, value }
    });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
