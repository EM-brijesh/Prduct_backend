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
const userRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
// Routes for Profile Creation basic info
userRouter.post('/basicinfo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Email, Password, Name, age, height, weight, bodytype, Traininglevel, goal, username } = req.body;
    try {
        const user = yield prisma.user.create({
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
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Error in saving the data");
    }
}));
// Get my profile route
userRouter.get('/profile', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    try {
        const user = yield prisma.user.findUnique({
            where: {
                username: username
            }
        });
        res.json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving user");
    }
}));
// Get leaderboard route
userRouter.get('/leaderboard', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
userRouter.get('/list', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
userRouter.get('/personalrecords', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
userRouter.put('/update_basicinfo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Email, age, height, weight, bodytype, Traininglevel, goal, username } = req.body;
    try {
        const user = yield prisma.user.update({
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
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Error in updating the data");
    }
}));
//pdf_routes for diet & Exercise
userRouter.post('/upload/diet:userId', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
userRouter.post('/upload/exercise:userId', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
userRouter.get('/download/diet:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
userRouter.get('/download/exercise:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
