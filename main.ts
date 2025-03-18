import express from 'express';
import userRouter from './users';
import authRouter from '../backend/auth';
import bodyParser from 'body-parser';

console.log("Project Initialized");
const app = express();
const port = 3000;
app.use(bodyParser.json());

app.get('/test_route', (req, res) => {
    res.send('Working');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

app.use('/auth' , authRouter)

app.use('/users', userRouter);