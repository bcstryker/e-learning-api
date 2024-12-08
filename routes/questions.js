const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

// Get all questions
router.get("/", async (req, res) => {
  try {
    console.log("Fetching all questions from the database...");
    const questions = await Question.find();
    console.log("Questions fetched:", questions);
    res.json(questions);
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// Get questions by section ID
router.get("/section/:sectionId", async (req, res) => {
  try {
    const questions = await Question.find({ sectionId: req.params.sectionId });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// Get question by ID
router.get("/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: "Question not found" });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch question" });
  }
});

module.exports = router;