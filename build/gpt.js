"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const gptRouter = express_1.default.Router();
// server.js
require('dotenv').config(); // Load environment variables from .env
/**
 * POST /api/generate-plan
 * Expects JSON body with:
 *   - planType: "diet" or "workout"
 *   - prompt: (optional) extra instructions for the plan
 */
//@ts-ignore
gptRouter.post('/api/generate-plan', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { planType, prompt } = req.body;
    // Choose preset based on plan type
    let preset;
    if (planType === 'diet') {
        preset = 'diet-plan-generator'; // replace with actual preset name if different
    }
    else if (planType === 'workout') {
        preset = 'workout-plan-generator'; // replace with actual preset name if different
    }
    else {
        return res.status(400).json({ error: 'Invalid plan type. Use "diet" or "workout".' });
    }
    const payload = {
        preset: preset,
        prompt: prompt || "", // you can include additional instructions if needed
    };
    try {
        const response = yield axios_1.default.post('https://easy-peasy.ai/api/generate', payload, {
            headers: {
                "accept": "application/json",
                "x-api-key": process.env.EASY_PEEASY_API_KEY,
                "Content-Type": "application/json"
            }
        });
        res.status(200).json(response.data);
    }
    catch (error) {
        //@ts-ignore
        console.error('Error generating plan:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to generate plan' });
    }
}));
exports.default = gptRouter;
