// src/index.ts
import express, { Request, Response, NextFunction, Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';




const authRouter = express.Router()
const prisma = new PrismaClient();
const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const SALT_ROUNDS = 10;

/**
 * Sign-up Endpoint
 * Creates a new user with hashed password.
 */
authRouter.post('/signup', async (req: Request, res: Response) => {
  const {
    email,
    username,
    password,
    name,
    age,
    height,
    weight,
    bodytype,
    traininglevel,
    goal,
  } = req.body;

  try {
    // Hash the provided password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create a new user in the database
    const user = await prisma.user.create({
      data: {
        Email: email, // primary key field
        username: username,
        Password: hashedPassword,
        name: name,
        age: age,
        height: height,
        weight: weight,
        bodytype: bodytype,
        traininglevel: traininglevel,
        goal: goal,
      },
    });

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

/**
 * Sign-in Endpoint
 * Authenticates a user and returns a JWT token.
 */
//@ts-ignore
authRouter.post('/signin', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    // Retrieve the user by email
    const user = await prisma.user.findUnique({
      where: { Email: email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate a JWT token with the user's email and username as payload
    const token = jwt.sign(
      { email: user.Email, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Signin successful', token });
  } catch (error) {
    console.error('Error during signin:', error);
    res.status(500).json({ error: 'Error signing in' });
  }
});






/**
 * Middleware to Protect Routes
 * Verifies JWT token passed in the Authorization header.
 */
const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Expecting header: "Authorization: Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    console.log(user, token, JWT_SECRET);
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    // Attach the user payload to the request for downstream use
    //@ts-ignore
    req.user = user;
    next();
  });
};

/**
 * Example Protected Route
 */
// New Protected Route to Get User Info
//@ts-ignore
authRouter.get('/userinfo',[] ,authenticateToken, async (req: Request, res: Response) => {
  try {
    // Assuming user info is available in the token payload (email, username)
    //@ts-ignore
    const { email } = req.user;

    // Retrieve the user from the database using email from the token
    const user = await prisma.user.findUnique({
      where: { Email: email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send back the user details (excluding password)
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
      memberSince: user.JoinDate,
      currentbadge: user.CurrentBadge
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Error fetching user info' });
  }
});





//@ts-ignore
authRouter.get('/protected', authenticateToken, (req: Request, res: Response) => {
  //@ts-ignore
  res.json({ message: 'This is a protected route', user: req.user });
});

// test Route


export default authRouter;

