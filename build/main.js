"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_1 = __importDefault(require("./users"));
const body_parser_1 = __importDefault(require("body-parser"));
const auth_1 = __importDefault(require("./auth"));
const cors_1 = __importDefault(require("cors"));
const gpt_1 = __importDefault(require("./gpt"));
console.log("Project Initialized");
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.get('/test_route', (req, res) => {
    res.send('Working');
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
app.use('/auth', auth_1.default);
app.use('/gpt', gpt_1.default);
app.use('/users', users_1.default);
