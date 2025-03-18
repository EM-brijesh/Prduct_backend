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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const authRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const SECRET_KEY = 'bRJEsH'; // Replace with your secret key (consider storing it in environment variables)
//@ts-ignore
const authenticateToken = (req, res, next) => {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
authRouter.get('/test', authenticateToken, (req, res) => {
    res.json({ message: 'Test route' });
});
// Sign Up Route
//@ts-ignore
authRouter.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, name, age, height, weight, bodytype, traininglevel, goal, email, // Email should be provided for each user
    refcode, // Optional refcode
     } = req.body;
    try {
        // Check if the user already exists
        const existingUser = yield prisma.user.findUnique({
            where: { username: username },
        });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }
        // Ensure the email is provided
        if (!email) {
            return res.status(400).send('Email is required');
        }
        // Hash the password before saving
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create new user in the database
        const newUser = yield prisma.user.create({
            data: {
                Email: email, // Include the Email here
                username: username,
                Password: hashedPassword, // Store the hashed password
                name: name || '', // Optional field
                age: age || null, // Optional field
                height: height || null, // Optional field
                weight: weight || null, // Optional field
                bodytype: bodytype || '', // Optional field
                traininglevel: traininglevel || '', // Optional field
                goal: goal || '', // Optional field
                JoinDate: new Date(), // Automatically set to the current date
                //@ts-ignore
                refcode: refcode || null, // Optional field (refcode can be null if not provided)
            },
        });
        // Generate JWT token for the new user
        const token = jsonwebtoken_1.default.sign({ userId: newUser.Email }, SECRET_KEY, { expiresIn: '1h' });
        res.status(201).json({ message: 'User created successfully', token });
    }
    catch (error) {
        // Log the detailed error for debugging purposes
        console.error('Error creating user:', error);
        // General error handling
        res.status(500).send('Error creating user');
    }
}));
// Sign In Route
//@ts-ignore
authRouter.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    // Allow dummy credentials (admin/admin)
    if (username === 'admin' && password === 'admin') {
        const token = jsonwebtoken_1.default.sign({ userId: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
        return res.status(200).json({ message: 'Logged in successfully', token });
    }
    try {
        // Find the user in the database by username
        const user = yield prisma.user.findUnique({
            where: { username: username },
        });
        if (!user) {
            return res.status(400).send('User not found');
        }
        // Compare the entered password with the hashed password in the database
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.Password);
        if (!isPasswordValid) {
            return res.status(400).send('Invalid credentials');
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.Email }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ message: 'Logged in successfully', token });
    }
    catch (error) {
        res.status(500).send('Error logging in');
    }
}));
exports.default = authRouter;
