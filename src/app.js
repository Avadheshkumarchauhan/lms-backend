import { config } from 'dotenv';
import express from'express';
import cors from'cors';
import morgan from 'morgan';
import cookieParser from'cookie-parser';
import userRoutes  from './routes/user.routers.js';
import courseRoutes from "./routes/course.routes.js"
import paymentRoutes from "./routes/payment.routes.js"
import errorMiddleware from './middlewares/error.middleware.js';
import otherRoutes from './routes/other.routes.js'
config({
    path:"./.env",
    quiet:true
})
const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));
app.use(cors({
    origin:[process.env.FRONTEND_URL,process.env.FRONTEND_URLS],
    credentials:true
}));
app.use(cookieParser());
app.use(morgan('dev'));
app.get('/',(req,res)=>{
    res.send('<h1>Hello </h1>')
});
// app.use(express.static("dist"));
app.use('/pong',(req,res)=>{
    res.send('<h1>Pong </h1>')
});

app.use('/api/v1/user',userRoutes);
app.use('/api/v1/courses',courseRoutes);
app.use('/api/v1/payment',paymentRoutes);
app.use('/api/v1',otherRoutes);

app.use((req,res)=>{
    res.status(400).send('OPPS !! 404 page not found')
});

app.use(errorMiddleware);


export default app;