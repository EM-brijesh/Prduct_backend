import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const authRouter = express.Router();
const prisma = new PrismaClient();
const SECRET_KEY = 'bRJEsH';  // Replace with your secret key (consider storing it in environment variables)

// Sign Up Route
//@ts-ignore
authRouter.post('/signup', async (req, res) => {
  const { username, password, refcode } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: username },
    });

    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username: username,
        Password: hashedPassword,
        //@ts-ignore
        refcode: refcode || null,  // refcode is optional
      },
    });

    // Generate JWT token for the new user
    const token = jwt.sign({ userId: newUser.Email }, SECRET_KEY, { expiresIn: '1h' });

    res.status(201).json({ message: 'User created successfully', token });
  } catch (error) {
    res.status(500).send('Error creating user');
  }
});

// Sign In Route
//@ts-ignore
authRouter.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  // Allow dummy credentials (admin/admin)
  if (username === 'admin' && password === 'admin') {
    const token = jwt.sign({ userId: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
    return res.status(200).json({ message: 'Logged in successfully', token });
  }

  try {
    // Find the user in the database by username
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!user) {
      return res.status(400).send('User not found');
    }

    // Compare the entered password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (!isPasswordValid) {
      return res.status(400).send('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.Email }, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ message: 'Logged in successfully', token });
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

export default authRouter;
