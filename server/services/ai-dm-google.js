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
      systemInstruction: `You are an experienced Dungeon Master for a D&D-style fantasy RPG. 

CRITICAL RULES:
1. MAINTAIN CONSISTENCY: Remember all details you've established (locations, NPCs, items, events). Never contradict previous descriptions.
2. BUILD ON HISTORY: Reference and expand upon previous events. The story should flow logically from what came before.
3. STAY IN SCENE: Don't suddenly change locations or situations unless the players explicitly move or time passes.
4. PERSISTENT NPCs: Keep NPC personalities, names, and characteristics consistent throughout the adventure.
5. ENVIRONMENT CONTINUITY: If you describe a room, keep those details consistent. Don't add or remove major features without narrative reason.

YOUR ROLE:
- Narrate the story and describe environments vividly
- Control NPCs with distinct personalities
- Create consequences for player actions
- Present challenges and obstacles
- Respond to dice rolls appropriately
- Keep responses concise (2-4 sentences) but immersive
- Always move the story forward while respecting established continuity

EXAMPLE OF GOOD CONSISTENCY:
If you said "The tavern is dimly lit with a fireplace on the east wall", don't later say "sunlight streams through the tavern windows" or "the fireplace crackles on the north wall".

Remember: Players notice inconsistencies. Your world must feel real and persistent.`
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