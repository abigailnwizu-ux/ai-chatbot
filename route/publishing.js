const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authenticateToken } = require("../middleware/auth");

// Get publishing accounts
router.get("/accounts/:workspaceId", authenticateToken, async (req, res) => {
  try {
    const accounts = await prisma.publishingAccount.findMany({
      where: { workspaceId: req.params.workspaceId }
    });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add publishing account
router.post("/accounts", authenticateToken, async (req, res) => {
  try {
    const { workspaceId, provider, accountName, accessToken, refreshToken, expiresAt } = req.body;
    const account = await prisma.publishingAccount.create({
      data: { workspaceId, provider, accountName, accessToken, refreshToken, expiresAt }
    });
    res.json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Schedule publishing job
router.post("/jobs", authenticateToken, async (req, res) => {
  try {
    const { assetId, accountId, scheduledAt } = req.body;
    const job = await prisma.publishingJob.create({
      data: { assetId, accountId, scheduledAt, status: "pending" }
    });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
