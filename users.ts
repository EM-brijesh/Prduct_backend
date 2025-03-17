import express from 'express';
import { PrismaClient } from '@prisma/client';

const userRouter = express.Router();
const prisma = new PrismaClient();

// Routes for Profile Creation basic info
userRouter.post('/basicinfo', async (req, res) => {
    const { Email, Password, Name, age, height, weight, bodytype, Traininglevel, goal, username } = req.body;
    try {
        const user = await prisma.user.create({
            data: {
                Email: Email,
                Password: Password,
                username: username,
                name: Name,
                age: age,
                height: height,
                weight: weight,
                bodytype: bodytype,
                traininglevel: Traininglevel,
                goal: goal,
            },
        });

        res.status(200).json(user);
        console.log("User created successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error in saving the data");
    }
});

// Get my profile route
userRouter.get('/profile', async (req, res) => {
    const { username } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving user");
    }
});

// Get leaderboard route
userRouter.get('/leaderboard', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        const usernames = users.map(user => user.username);
        res.json(usernames);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving users");
    }
});

// Get all users route
userRouter.get('/list', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving users");
    }
});

// Routes to get Personal Records
userRouter.get('/personalrecords', async (req, res) => {
    const { username } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        });
        res.json(user?.Journey);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving personal records");
    }
});

// Routes to update basic info (age, height, weight, bodytype, Traininglevel, goal)
userRouter.put('/update_basicinfo', async (req, res) => {
    const { Email, age, height, weight, bodytype, Traininglevel, goal, username } = req.body;
    try {
        const user = await prisma.user.update({
            where: {
                username: username
            },
            data: {
                age: age,
                height: height,
                weight: weight,
                bodytype: bodytype,
                traininglevel: Traininglevel,
                goal: goal,
            },
        });
        res.status(200).json(user);
        console.log("User updated successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error in updating the data");
    }
});

// Route to add Diet
userRouter.post('add_diet' ,async (req , res) => {
    const {username , meal , calories } = req.body;
    try{
        const user = await prisma.user.update({
            where: {
                username: username
            },
            select: {Email: true},
            data: {
                Diet: {
                    create: {
                        meal: meal,
                        calories: calories
                    }
                }
            }
        });
    }catch(error){  
        console.log(error);
    }
})

// Route to add Workout Plan


export default userRouter;

