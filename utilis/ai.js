require("dotenv").config();
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();

// GET route - renders AI page
router.get("/", (req, res) => {
  res.render("ai", {
    question: null,
    answer: null,
    title: "AI",
    user: req.session.user || null,
  });
});

// POST route - handles AI questions
router.post("/ask", async (req, res) => {
  const question = req.body.q;

  if (!question || question.trim() === "") {
    return res.render("ai", {
      question,
      answer: "Please provide a valid question",
      title: "AI",
      user: req.session.user || null,
    });
  }

  try {
    let answer = null;

    // 1. Try Gemini
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(question.trim());
      answer = await result.response.text();
    } catch (e) {
      console.warn("Gemini failed, trying Hugging Face...");
    }

    // 2. If Gemini fails, try Hugging Face
    if (!answer) {
      try {
        const hfResponse = await fetch("https://api-inference.huggingface.co/models/gpt2", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: question.trim() }),
        });
        const data = await hfResponse.json();
        answer = data[0]?.generated_text || "No response from Hugging Face";
      } catch (e) {
        console.warn("Hugging Face failed, trying Mistral...");
      }
    }

    // 3. If Hugging Face fails, try Mistral
    if (!answer) {
      try {
        const mistralResponse = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mistral-tiny",
            messages: [{ role: "user", content: question.trim() }],
          }),
        });
        const mistralData = await mistralResponse.json();
        answer = mistralData.choices?.[0]?.message?.content || "No response from Mistral";
      } catch (e) {
        console.warn("Mistral also failed.");
      }
    }

    // Render final response
    res.render("ai", {
      question,
      answer: answer || "All AI providers failed 😢",
      title: "AI",
      user: req.session.user || null,
    });

  } catch (error) {
    console.error(error);
    res.render("ai", {
      question,
      answer: "Error: Could not generate response",
      title: "AI",
      user: req.session.user || null,
    });
  }
});

module.exports = router;
