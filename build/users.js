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
const userRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
//get leaderboard route
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
//get all users route
userRouter.get('/list', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany();
        res.json(users);
    }
    catch (_a) {
        console.error(Error);
        res.status(500).send("Error retrieving users");
    }
}));
//get my profile route
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
    catch (_a) {
        console.error(Error);
        res.status(500).send("Error retrieving user");
    }
}));
//routes for Profile Creation basic info
userRouter.post('/basicinfo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Email, Password, Name, age, height, weight, bodytype, Traininglevel, goal, username } = req.body;
    try {
        const user = yield prisma.user.create({
            data: {
                Email: Email,
                Password: Password,
                username: username, // Added the missing 'username' property
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
//Routes to update basic info (age , height , weight , bodytype ,Traininglevel , goal)
userRouter.put('/update_basicinfo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Email, age, height, weight, bodytype, Traininglevel, goal, username } = req.body;
    try {
        const user = yield prisma.user.update({
            where: {
                username: username // Added the missing 'username' property
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
exports.default = userRouter;
