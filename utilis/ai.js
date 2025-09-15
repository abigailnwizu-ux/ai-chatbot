require("dotenv").config();
const express = require("express");
const router = express.Router();

const { GoogleGenerativeAI } = require("@google/generative-ai");

router.get("/", (req, res) => {
  res.render("ai", { question: null, answer: null });
});
  router.post("/ask", async (req, res) => {
  try {
    const question = req.body.q;
    console.log("Question received:", question); // Debug log
    
    if (!question || question.trim() === "") {
      return res.render("ai", { 
        question: question,
        answer: "Please provide a valid question",
        title: "AI",
        user: req.session.user || null
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
    
    console.log("Sending request to Gemini..."); // Debug log
    const result = await model.generateContent(question.trim());
    console.log("Received response from Gemini"); // Debug log
    
    const answer = await result.response.text();
    
    res.render("ai", {
      question: question, 
      answer: answer,
      title: "AI",
      user: req.session.user || null
    });  
    
  } catch (error) {
    // More detailed error logging
    console.error("Full error object:", error);
    console.error("Error message:", error.message);
    console.error("Error status:", error.status);
    
    res.render("ai", { 
      question: req.body.q,
      answer: `Error: ${error.message}`,
      title: "AI",
      user: req.session.user || null
    });
  }
});

module.exports = router;