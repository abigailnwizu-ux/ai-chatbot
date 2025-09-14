const express = require("express");
const router = express.Router();
const { z } = require("zod");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authenticateToken } = require("../middleware/auth");
const logger = require("../lib/logger"); // ✅ fixed path
const { generateStrategyWithGemini, generateFallbackStrategy } = require("../utilis/ai");

// --- Validation Schemas ---
const GenerateStrategyRequest = z.object({
  goalId: z.string().uuid({ message: "Valid goal ID is required" }),
  campaignId: z.string().uuid().optional(), // ✅ added
  industry: z.string().min(1).max(100).optional(),
  region: z.string().min(1).max(100).optional(),
  businessType: z.enum(["B2B", "B2C"]).optional().default("B2B")
});

const UpdateStrategyRequest = z.object({
  title: z.string().max(200).optional(),
  description: z.string().optional(),
  pillars: z.any().optional(),
  channelMix: z.any().optional(),
  cadenceRules: z.any().optional(),
  topicClusters: z.any().optional(),
  campaignId: z.string().uuid().optional(), // ✅ allow update
  status: z.enum(["draft", "active", "archived"]).optional()
});

// --- Routes ---

// Generate Strategy (AI-powered)
router.post("/generate", authenticateToken, async (req, res) => {
  try {
    const validationResult = GenerateStrategyRequest.parse(req.body);
    const { goalId, campaignId, industry, region, businessType } = validationResult;

    // Try Gemini first, fallback if fails
    let generatedData, generationMethod;
    try {
      generatedData = await generateStrategyWithGemini({ industry, region, businessType });
      generationMethod = "gemini";
    } catch (aiErr) {
      logger.warn(`Gemini failed, using fallback: ${aiErr.message}`);
      generatedData = await generateFallbackStrategy({ industry, region, businessType });
      generationMethod = "fallback";
    }

    const strategy = await prisma.strategy.create({
      data: {
        workspaceId: req.user.workspaceId,
        goalId,
        campaignId: campaignId || null, // ✅ connect to campaign if provided
        title: generatedData.title || "Untitled Strategy",
        description: generatedData.description || null,
        pillars: generatedData.pillars,
        channelMix: generatedData.channelMix,
        cadenceRules: generatedData.cadenceRules,
        topicClusters: generatedData.topicClusters,
        status: "draft",
        generationMethod
      }
    });

    res.json(strategy);
  } catch (err) {
    logger.error(`Strategy generation failed: ${err.message}`);
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors });
    } else {
      res.status(500).json({ error: "Failed to generate strategy" });
    }
  }
});

// Get strategies for a Goal
router.get("/goal/:goalId", authenticateToken, async (req, res) => {
  try {
    const strategies = await prisma.strategy.findMany({
      where: { goalId: req.params.goalId },
      select: {
        id: true,
        campaignId: true, // ✅ show campaign link
        title: true,
        description: true,
        pillars: true,
        channelMix: true,
        cadenceRules: true,
        topicClusters: true,
        status: true,
        generationMethod: true,
        createdAt: true
      }
    });

    res.json(strategies);
  } catch (err) {
    logger.error(`Failed to fetch strategies: ${err.message}`);
    res.status(500).json({ error: "Failed to fetch strategies" });
  }
});

// Get a single strategy
router.get("/:strategyId", authenticateToken, async (req, res) => {
  try {
    const strategy = await prisma.strategy.findUnique({
      where: { id: req.params.strategyId },
      include: {
        goal: true,
        campaign: true // ✅ include campaign info
      }
    });

    if (!strategy) {
      return res.status(404).json({ error: "Strategy not found" });
    }

    res.json(strategy);
  } catch (err) {
    logger.error(`Failed to fetch strategy: ${err.message}`);
    res.status(500).json({ error: "Failed to fetch strategy" });
  }
});

// Update a strategy
router.patch("/:strategyId", authenticateToken, async (req, res) => {
  try {
    const updates = UpdateStrategyRequest.parse(req.body);

    const existingStrategy = await prisma.strategy.findUnique({
      where: { id: req.params.strategyId }
    });

    if (!existingStrategy) {
      return res.status(404).json({ error: "Strategy not found" });
    }

    const updatedStrategy = await prisma.strategy.update({
      where: { id: req.params.strategyId },
      data: {
        ...updates,
        campaignId: updates.campaignId || existingStrategy.campaignId
      }
    });

    res.json(updatedStrategy);
  } catch (err) {
    logger.error(`Failed to update strategy: ${err.message}`);
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors });
    } else {
      res.status(500).json({ error: "Failed to update strategy" });
    }
  }
});

// Delete a strategy
router.delete("/:strategyId", authenticateToken, async (req, res) => {
  try {
    await prisma.strategy.delete({
      where: { id: req.params.strategyId }
    });
    res.json({ message: "Strategy deleted" });
  } catch (err) {
    logger.error(`Failed to delete strategy: ${err.message}`);
    res.status(500).json({ error: "Failed to delete strategy" });
  }
});

module.exports = router;
