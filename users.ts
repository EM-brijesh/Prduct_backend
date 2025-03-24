import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import authenticateToken from './auth'
const userRouter = express.Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

// Routes for Profile Creation basic info
userRouter.post('/basicinfo',authenticateToken , async (req, res) => {
    const { age, height, weight, bodytype, Traininglevel, goal,  } = req.body;
    try {
        const user = await prisma.user.create({
            //@ts-ignore
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
        console.log("User created successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error in saving the data");
    }
});

// Get my profile route
//@ts-ignore
userRouter.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Assuming user info is available in the token payload (email, username)
    //@ts-ignore
    const { email } = req.user;

    // Retrieve the user from the database using email from the token
    const user = await prisma.user.findUnique({
      where: { Email: email },
    });

    if (!user) {
        //@ts-ignore
      return res.status(404).json({ error: 'User not found' });
    }

    // Send back the user details (excluding password)
    //@ts-ignore
    res.json({
      email: user.Email,
      username: user.username,
      name: user.name,
      age: user.age,
      height: user.height,
      weight: user.weight,
      bodytype: user.bodytype,
      traininglevel: user.traininglevel,
      goal: user.goal,
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    //@ts-ignore
    res.status(500).json({ error: 'Error fetching user info' });
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
//@ts-ignore
userRouter.put('/update_basicinfo', authenticateToken, async (req, res) => {
    const { age, height, weight, bodytype, traininglevel, goal } = req.body;
//@ts-ignore
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    // Validate input
    if (age !== undefined && isNaN(age)) return res.status(400).json({ message: 'Age must be a number' });
    if (height !== undefined && isNaN(height)) return res.status(400).json({ message: 'Height must be a number' });
    if (weight !== undefined && isNaN(weight)) return res.status(400).json({ message: 'Weight must be a number' });

    try {
        const updatedUser = await prisma.user.update({
            //@ts-ignore
            where: { Email: req.user.userId },  // Use `Email` as per schema
            data: {
                ...(age !== undefined && { age }),
                ...(height !== undefined && { height }),
                ...(weight !== undefined && { weight }),
                ...(bodytype !== undefined && { bodytype }),
                ...(traininglevel !== undefined && { traininglevel }),
                ...(goal !== undefined && { goal }),
            },
        });

        console.log("User updated successfully:", updatedUser);
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
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
 
