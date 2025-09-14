// routes/goals.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/",(req,res) =>{
    res.send('Goals page');
});
router.get("/:workspaceId", async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const goals = await prisma.goal.findMany({
      where: { workspaceId: parseInt(workspaceId) },
      include: {
        workspace: true, // if you want workspace info
      },
    });

    res.render("goals", { goals });
  } catch (err) {
    console.error("Error fetching goals:", err);
    res.status(500).send("Error loading goals");
  }
});

// ===== API-style GET all goals (JSON) =====
router.get("/:workspaceId", async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const goals = await prisma.goal.findMany({
      where: { workspaceId: parseInt(workspaceId) },
    });

    res.json(goals);
  } catch (err) {
    console.error("Error fetching goals:", err);
    res.status(500).json({ error: "Error loading goals" });
  }
});

// ===== CREATE a new goal =====
router.post("/", async (req, res) => {
  try {
    const { title, description, workspaceId } = req.body;

    const goal = await prisma.goal.create({
      data: {
        title,
        description,
        workspaceId: parseInt(workspaceId),
      },
    });

    res.json(goal);
  } catch (err) {
    console.error("Error creating goal:", err);
    res.status(500).json({ error: "Error creating goal" });
  }
});

// ===== UPDATE a goal =====
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const goal = await prisma.goal.update({
      where: { id: parseInt(id) },
      data: { title, description },
    });

    res.json(goal);
  } catch (err) {
    console.error("Error updating goal:", err);
    res.status(500).json({ error: "Error updating goal" });
  }
});

// ===== DELETE a goal =====
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.goal.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Goal deleted" });
  } catch (err) {
    console.error("Error deleting goal:", err);
    res.status(500).json({ error: "Error deleting goal" });
  }
});

module.exports = router;
