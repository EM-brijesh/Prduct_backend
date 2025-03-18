import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import authenticateToken  from './auth'

const userRouter = express.Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

// Routes for Profile Creation basic info
userRouter.post('/basicinfo',authenticateToken , async (req, res) => {
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
userRouter.get('/profile',authenticateToken , async (req, res) => {
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
userRouter.get('/leaderboard', authenticateToken ,async (req, res) => {
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
userRouter.get('/list',authenticateToken , async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving users");
    }
});

// Routes to get Personal Records
userRouter.get('/personalrecords',authenticateToken , async (req, res) => {
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
userRouter.put('/update_basicinfo',authenticateToken , async (req, res) => {
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

//pdf_routes for diet & Exercise
userRouter.post('/upload/diet:userId',authenticateToken , upload.single('file'), async (req, res) => {
    const { userId } = req.params;
    //@ts-ignore
    const pdfPath = path.join(__dirname, 'uploads', req.file.filename);

    try {
        const diet = await prisma.diet.create({
            //@ts-ignore
            data: {
                userId: userId,
                pdfurl: pdfPath
            }
        })
        res.status(200).json(diet);
        console.log("Diet uploaded successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error in uploading the data");
    }
})

userRouter.post('/upload/exercise:userId',authenticateToken , upload.single('file'), async (req, res) => {
    const {userId} = req.params;
    //@ts-ignore
    const pdfPath = path.join(__dirname, 'uploads', req.file.filename);
    try{
        const exercise = await prisma.exercise.create({
            //@ts-ignore
            data: {
                userId: userId,
                pdfurl: pdfPath
            }
        })
        res.status(200).json(exercise);
        console.log("Exercise uploaded successfully");
    }catch(error){
        console.log(error); 
        res.status(500).send("Error in uploading the data");
    }
})

userRouter.get('/download/diet:userId',authenticateToken , async (req, res) => {
    const {userId} = req.params;
    try{
        const diet = await prisma.diet.findUnique({
            //@ts-ignore
            where: {
                userId: userId
            }
        })
        const pdfPath = diet?.pdfurl;
        //@ts-ignore
        res.download(pdfPath);
    }catch(error){
        console.log(error);
        res.status(500).send("Error in downloading the data");
    }               
});

userRouter.get('/download/exercise:userId',authenticateToken , async (req, res) => {
    const {userId} = req.params;
    try{
        const exercise = await prisma.exercise.findUnique({
            //@ts-ignore
            where: {
                userId: userId
            }
        })
        const pdfPath = exercise?.pdfurl;
        //@ts-ignore
        res.download(pdfPath);
    }catch(error){
        console.log(error);
        res.status(500).send("Error in downloading the data");
    }               
});

export default userRouter;

