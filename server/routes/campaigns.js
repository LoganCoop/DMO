const express = require('express');
const router = express.Router();
const { getAIResponse, listAvailableModels } = require('../services/ai-dm-google');

// GET /api/campaigns - Get campaigns
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Get all campaigns placeholder' });
});

// POST /api/campaigns - Create new campaign
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Create campaign placeholder' });
});

// GET /api/campaigns/list-models - List available AI models
router.get('/list-models', async (req, res) => {
    try {
        const models = await listAvailableModels();
        res.status(200).json({ models });
    } catch (error) {
        console.error('Error in /list-models route:', error);
        res.status(500).json({ error: 'Failed to list models' });
    }
});

// GET /api/campaigns/:roomId/messages - Get chat history for a room
router.get('/:roomId/messages', async (req, res) => {
    const { roomId } = req.params;
    const db = require('../database/connection');

    try {
        const [messages] = await db.query(
            'SELECT * FROM chat_messages WHERE room_id = ? ORDER BY created_at ASC',
            [roomId]
        );
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// POST /api/campaigns/dm-action - Get a response from the AI DM
router.post('/dm-action', async (req, res) => {
    const { prompt, action, context } = req.body;
    const finalPrompt = prompt || action;

    console.log('DM Action received:', { action, prompt, finalPrompt, hasContext: !!context });

    if (!finalPrompt) {
        console.log('ERROR: No prompt or action provided');
        return res.status(400).json({ error: 'Prompt or action is required' });
    }

    try {
        // Combine action with context if provided
        const fullPrompt = context ? `Context: ${context}\n\nPlayer Action: ${finalPrompt}` : finalPrompt;
        console.log('Sending to AI:', fullPrompt.substring(0, 200) + '...');
        const aiResponse = await getAIResponse(fullPrompt);
        console.log('AI Response received, length:', aiResponse.length);
        res.status(200).json({ response: aiResponse });
    } catch (error) {
        console.error('Error in /dm-action route:', error);
        res.status(500).json({ error: 'Failed to get response from AI DM' });
    }
});

module.exports = router;
