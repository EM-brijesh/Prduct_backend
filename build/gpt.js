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
const client_1 = require("@prisma/client");
const genai_1 = require("@google/genai");
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./auth");
dotenv_1.default.config();
const gptRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
//@ts-ignore
gptRouter.post("/generate-plan", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, age, weight, height, trainingLevel, goal, foodPreference } = req.body;
        // Validate required fields.
        if (!userId || !age || !weight || !height || !trainingLevel || !goal || !foodPreference) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Prepare the prompt to instruct the AI to output valid JSON.
        const prompt = `
Generate a simple diet and workout plan for a ${age}-year-old, ${weight}kg, ${height}cm tall individual with a ${trainingLevel} training level. Their goal is ${goal} and they prefer ${foodPreference} food.

Include:
1. **Diet Plan**: List of meals and snacks.
2. **Workout Plan**: List of exercises.


Make it easy to read for later PDF creation and give a valid JSON.
`;
        // Call the AI to generate the plan.
        const response = yield ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });
        // Here we assume the response includes a 'text' property with the generated JSON string.
        const result = response.text;
        if (!result) {
            return res.status(500).json({ error: "No text returned from Gemini API" });
        }
        console.log("Generated AI Response:", result);
        // Clean the result by removing markdown formatting if present.
        let jsonString = result.trim();
        if (jsonString.startsWith("```json")) {
            jsonString = jsonString.substring("```json".length).trim();
        }
        if (jsonString.endsWith("```")) {
            jsonString = jsonString.substring(0, jsonString.length - 3).trim();
        }
        // Parse the cleaned JSON string.
        let parsed;
        try {
            parsed = JSON.parse(jsonString);
        }
        catch (e) {
            console.error("Error parsing JSON:", e);
            return res.status(500).json({ error: "Error parsing AI JSON response" });
        }
        // For Diet, we'll store an array that starts with the important considerations followed by the diet plan lines.
        const combinedMealPlan = [parsed.important, ...parsed.diet];
        // Store the Diet plan.
        const savedDiet = yield prisma.diet.create({
            data: {
                userId,
                meal: combinedMealPlan,
                calories: parsed.calories || 2850,
                date: new Date(),
                pdfurl: ""
            },
        });
        // Store the Exercise plan.
        const savedExercise = yield prisma.exercise.create({
            data: {
                userId,
                type: goal,
                workout: parsed.workout,
                duration: parsed.duration || 60,
                date: new Date(),
                pdfurl: ""
            },
        });
        // Return the parsed JSON plan along with the saved records.
        return res.json({
            message: "Plan saved successfully",
            parsedPlan: parsed,
            diet: savedDiet,
            exercise: savedExercise,
        });
    }
    catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}));
//@ts-ignore
gptRouter.get("/get-plan", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        console.log("GET /get-plan req.user:", req.user); // Debug log
        //@ts-ignore
        const { email } = req.user;
        if (!email || typeof email !== "string") {
            return res.status(400).json({ message: "Missing or invalid email" });
        }
        // Query using the field "userId" (which is the email) from your models.
        //@ts-ignore
        const dietPlans = yield prisma.diet.findMany({ where: { Email: email } });
        //@ts-ignore
        const exercisePlans = yield prisma.exercise.findMany({ where: { Email: email } });
        return res.json({
            message: "Plans fetched successfully",
            diet: dietPlans,
            exercise: exercisePlans,
        });
    }
    catch (error) {
        console.error("Error fetching plans:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}));
//@ts-ignore
gptRouter.get('/diet', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Assuming user info is available in the token payload (email, username)
        //@ts-ignore
        const { email } = req.user;
        // Retrieve the user from the database using email from the token
        //@ts-ignore
        const dietPlans = yield prisma.diet.findMany({ where: { userId: email } });
        //@ts-ignore
        const exercisePlans = yield prisma.exercise.findMany({ where: { userId: email } });
        // Send back the user details (excluding password)
        return res.json({
            message: "Plans fetched successfully",
            diet: dietPlans,
            exercise: exercisePlans,
        });
    }
    catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ error: 'Error fetching user info' });
    }
}));
exports.default = gptRouter;
