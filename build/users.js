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
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./auth"));
const userRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
// Routes for Profile Creation basic info
userRouter.post('/basicinfo', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { age, height, weight, bodytype, Traininglevel, goal, } = req.body;
    try {
        const user = yield prisma.user.create({
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
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Error in saving the data");
    }
}));
// Get my profile route
//@ts-ignore
userRouter.get('/profile', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Assuming user info is available in the token payload (email, username)
        //@ts-ignore
        const { email } = req.user;
        // Retrieve the user from the database using email from the token
        const user = yield prisma.user.findUnique({
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
            calories: user.calories,
        });
    }
    catch (error) {
        console.error('Error fetching user info:', error);
        //@ts-ignore
        res.status(500).json({ error: 'Error fetching user info' });
    }
}));
// Get leaderboard route
userRouter.get('/leaderboard', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany();
        const usernames = users.map(user => user.username);
        res.json(usernames);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving users");
    }
}));
// Get all users route
userRouter.get('/list', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany();
        res.json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving users");
    }
}));
// Routes to get Personal Records
userRouter.get('/personalrecords', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    try {
        const user = yield prisma.user.findUnique({
            where: {
                username: username
            }
        });
        res.json(user === null || user === void 0 ? void 0 : user.Journey);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving personal records");
    }
}));
// Routes to update basic info (age, height, weight, bodytype, Traininglevel, goal)
//@ts-ignore
userRouter.put('/update_basicinfo', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { age, height, weight, bodytype, traininglevel, goal } = req.body;
    //@ts-ignore
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }
    // Validate input
    if (age !== undefined && isNaN(age))
        return res.status(400).json({ message: 'Age must be a number' });
    if (height !== undefined && isNaN(height))
        return res.status(400).json({ message: 'Height must be a number' });
    if (weight !== undefined && isNaN(weight))
        return res.status(400).json({ message: 'Weight must be a number' });
    try {
        const updatedUser = yield prisma.user.update({
            //@ts-ignore
            where: { Email: req.user.userId }, // Use `Email` as per schema
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (age !== undefined && { age })), (height !== undefined && { height })), (weight !== undefined && { weight })), (bodytype !== undefined && { bodytype })), (traininglevel !== undefined && { traininglevel })), (goal !== undefined && { goal })),
        });
        console.log("User updated successfully:", updatedUser);
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
}));
//pdf_routes for diet & Exercise
userRouter.post('/upload/diet:userId', auth_1.default, upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    //@ts-ignore
    const pdfPath = path_1.default.join(__dirname, 'uploads', req.file.filename);
    try {
        const diet = yield prisma.diet.create({
            //@ts-ignore
            data: {
                userId: userId,
                pdfurl: pdfPath
            }
        });
        res.status(200).json(diet);
        console.log("Diet uploaded successfully");
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Error in uploading the data");
    }
}));
userRouter.post('/upload/exercise:userId', auth_1.default, upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    //@ts-ignore
    const pdfPath = path_1.default.join(__dirname, 'uploads', req.file.filename);
    try {
        const exercise = yield prisma.exercise.create({
            //@ts-ignore
            data: {
                userId: userId,
                pdfurl: pdfPath
            }
        });
        res.status(200).json(exercise);
        console.log("Exercise uploaded successfully");
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Error in uploading the data");
    }
}));
userRouter.get('/download/diet:userId', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const diet = yield prisma.diet.findUnique({
            //@ts-ignore
            where: {
                userId: userId
            }
        });
        const pdfPath = diet === null || diet === void 0 ? void 0 : diet.pdfurl;
        //@ts-ignore
        res.download(pdfPath);
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Error in downloading the data");
    }
}));
userRouter.get('/download/exercise:userId', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const exercise = yield prisma.exercise.findUnique({
            //@ts-ignore
            where: {
                userId: userId
            }
        });
        const pdfPath = exercise === null || exercise === void 0 ? void 0 : exercise.pdfurl;
        //@ts-ignore
        res.download(pdfPath);
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Error in downloading the data");
    }
}));
exports.default = userRouter;
