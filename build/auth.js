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
exports.authenticateToken = void 0;
// src/index.ts
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const authRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const SALT_ROUNDS = 10;
const trainingLevels = {
    sedentary: 1.2,
    lightlyActive: 1.375,
    moderatelyActive: 1.55,
    veryActive: 1.725,
    extraActive: 1.9,
};
//@ts-ignore
authRouter.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, username, password, name, age, height, weight, bodytype, traininglevel, goal, } = req.body;
    try {
        // Check if user already exists
        const existingUser = yield prisma.user.findUnique({
            where: { Email: email },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
        // Calculate BMR (Basal Metabolic Rate)
        const BMR = 10 * weight + 6.25 * height - 5 * age + 5;
        // Get activity multiplier
        const activityLevelMultiplier = trainingLevels[traininglevel.toLowerCase()];
        if (!activityLevelMultiplier) {
            return res.status(400).json({ error: 'Invalid training level provided' });
        }
        // Calculate daily calorie needs
        const calories = Math.round(BMR * activityLevelMultiplier);
        // Create a new user in the database
        const user = yield prisma.user.create({
            data: {
                Email: email, // Primary key
                username,
                Password: hashedPassword,
                name,
                age,
                height,
                weight,
                bodytype,
                traininglevel,
                goal,
                calories, // Save calculated calories
            },
        });
        res.status(201).json({ message: 'User created successfully', user });
    }
    catch (error) {
        console.error('Error during signup:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email or username already exists' });
        }
        res.status(500).json({ error: 'Error creating user' });
    }
}));
/**
 * Sign-in Endpoint
 * Authenticates a user and returns a JWT token.
 */
//@ts-ignore
authRouter.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Retrieve the user by email
        const user = yield prisma.user.findUnique({
            where: { Email: email },
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Compare the provided password with the stored hashed password
        const isMatch = yield bcrypt_1.default.compare(password, user.Password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Generate a JWT token with the user's email and username as payload
        const token = jsonwebtoken_1.default.sign({ email: user.Email, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Signin successful', token });
    }
    catch (error) {
        console.error('Error during signin:', error);
        res.status(500).json({ error: 'Error signing in' });
    }
}));
/**
 * Middleware to Protect Routes
 * Verifies JWT token passed in the Authorization header.
 */
const authenticateToken = (req, res, next) => {
    // Expecting header: "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token missing' });
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
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
exports.authenticateToken = authenticateToken;
/**
 * Example Protected Route
 */
// New Protected Route to Get User Info
//@ts-ignore
authRouter.get('/userinfo', [], exports.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Assuming user info is available in the token payload (email, username)
        //@ts-ignore
        const { email } = req.user;
        // Retrieve the user from the database using email from the token
        const user = yield prisma.user.findUnique({
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
    }
    catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ error: 'Error fetching user info' });
    }
}));
//@ts-ignore
authRouter.get('/protected', exports.authenticateToken, (req, res) => {
    //@ts-ignore
    res.json({ message: 'This is a protected route', user: req.user });
});
// test Route
exports.default = authRouter;
