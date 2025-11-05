const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- DEBUGGING ---
console.log("Attempting to use Google API Key:", process.env.GOOGLE_API_KEY);
// --- END DEBUGGING ---

// Initialize the Google Generative AI client with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * Lists all available models for the current API key
 * @returns {Promise<Array>} List of available models
 */
async function listAvailableModels() {
  try {
    const models = await genAI.listModels();
    return models;
  } catch (error) {
    console.error("Error listing models:", error);
    throw error;
  }
}

/**
 * Generates a response from the AI Dungeon Master.
 * @param {string} prompt - The prompt to send to the AI.
 * @returns {Promise<string>} The AI-generated text.
 */
async function getAIResponse(prompt) {
  try {
    // Use Gemini 2.0 Flash (experimental but fast and capable)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      systemInstruction: "You are an experienced Dungeon Master for a D&D-style fantasy RPG. Your role is to narrate the story, describe environments, control NPCs, and respond to player actions with engaging, immersive descriptions. Keep responses concise (2-4 sentences) but vivid. Create challenging situations, interesting characters, and dramatic moments. Always move the story forward."
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('AI DM Response generated:', text.substring(0, 100) + '...');
    return text;
  } catch (error) {
    console.error("Error communicating with Google AI:", error);
    throw new Error("Failed to get a response from the AI Dungeon Master.");
  }
}

module.exports = {
  getAIResponse,
  listAvailableModels,
};