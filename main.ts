import express from 'express';
import userRouter from './users';
import bodyParser from 'body-parser';
import authRouter from './auth';

import cors from 'cors';
import gptRouter from './gpt';

console.log("Project Initialized");
const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.json());

app.get('/test_route', (req, res) => {
    res.send('Working');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

app.use('/auth' , authRouter)
app.use('/gpt' , gptRouter)
app.use('/users', userRouter);