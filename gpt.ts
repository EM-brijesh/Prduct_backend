import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {authenticateToken} from './auth'

dotenv.config();
const gptRouter = express.Router();
const prisma = new PrismaClient();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//@ts-ignore
gptRouter.post("/generate-plan", async (req, res) => {
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
    const response = await ai.models.generateContent({
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
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return res.status(500).json({ error: "Error parsing AI JSON response" });
    }

    // For Diet, we'll store an array that starts with the important considerations followed by the diet plan lines.
    const combinedMealPlan = [parsed.important, ...parsed.diet];

    // Store the Diet plan.
    const savedDiet = await prisma.diet.create({
      data: { 
        userId, 
        meal: combinedMealPlan, 
        calories: parsed.calories || 2850, 
        date: new Date(), 
        pdfurl: "" 
      },
    });

    // Store the Exercise plan.
    const savedExercise = await prisma.exercise.create({
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
  } catch (error: any) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});
//@ts-ignore
gptRouter.get("/get-plan", authenticateToken, async (req, res) => {
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
    const dietPlans = await prisma.diet.findMany({ where: {Email: email } });
    //@ts-ignore
    const exercisePlans = await prisma.exercise.findMany({ where: { Email: email } });

    return res.json({
      message: "Plans fetched successfully",
      diet: dietPlans,
      exercise: exercisePlans,
    });
  } catch (error: any) {
    console.error("Error fetching plans:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

//@ts-ignore
gptRouter.get('/diet',authenticateToken, async (req: Request, res: Response) => {
  try {
    // Assuming user info is available in the token payload (email, username)
    //@ts-ignore
    const { email } = req.user;

    // Retrieve the user from the database using email from the token
    //@ts-ignore
    const dietPlans = await prisma.diet.findMany({ where: {userId: email } });
    //@ts-ignore
    const exercisePlans = await prisma.exercise.findMany({ where: { userId: email } });


    // Send back the user details (excluding password)
    return res.json({
      message: "Plans fetched successfully",
      diet: dietPlans,
      exercise: exercisePlans,
    })
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Error fetching user info' });
  }
});








export default gptRouter