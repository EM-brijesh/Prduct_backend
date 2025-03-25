import express from 'express';
import axios from 'axios'

const gptRouter = express.Router();

// server.js
require('dotenv').config(); // Load environment variables from .env







/**
 * POST /api/generate-plan
 * Expects JSON body with:
 *   - planType: "diet" or "workout"
 *   - prompt: (optional) extra instructions for the plan
 */
//@ts-ignore
gptRouter.post('/api/generate-plan', async (req, res) => {
  const { planType, prompt } = req.body;

  // Choose preset based on plan type
  let preset;
  if (planType === 'diet') {
    preset = 'diet-plan-generator'; // replace with actual preset name if different
  } else if (planType === 'workout') {
    preset = 'workout-plan-generator'; // replace with actual preset name if different
  } else {
    return res.status(400).json({ error: 'Invalid plan type. Use "diet" or "workout".' });
  }

  const payload = {
    preset: preset,
    prompt: prompt || "", // you can include additional instructions if needed
  };

  try {
    const response = await axios.post('https://easy-peasy.ai/api/generate', payload, {
      headers: {
        "accept": "application/json",
        "x-api-key": process.env.EASY_PEEASY_API_KEY,
        "Content-Type": "application/json"
      }
    });
    res.status(200).json(response.data);
  } catch (error) {
    //@ts-ignore
    console.error('Error generating plan:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to generate plan' });
  }
});






export default gptRouter