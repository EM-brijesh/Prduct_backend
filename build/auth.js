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
/**
 * Sign-up Endpoint
 * Creates a new user with hashed password.
 */
authRouter.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, username, password, name, age, height, weight, bodytype, traininglevel, goal, } = req.body;
    try {
        // Hash the provided password
        const hashedPassword = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
        // Create a new user in the database
        const user = yield prisma.user.create({
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
    }
    catch (error) {
        console.error('Error during signup:', error);
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
//@ts-ignore
authRouter.get('/protected', authenticateToken, (req, res) => {
    //@ts-ignore
    res.json({ message: 'This is a protected route', user: req.user });
});
exports.default = authRouter;
