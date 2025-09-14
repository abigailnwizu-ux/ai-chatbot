require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

console.log("Testing API key...");
console.log("API Key:", process.env.GEMINI_API_KEY ? "Exists" : "MISSING");

if (!process.env.GEMINI_API_KEY) {
    console.log("❌ ERROR: GEMINI_API_KEY not found in .env file");
    process.exit(1);
}

// Test if API key can authenticate
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Simple test - try to create a model instance
try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log("✅ Model instance created successfully");
    console.log("✅ API key appears valid");
} catch (error) {
    console.log("❌ API key validation failed:", error.message);
}
