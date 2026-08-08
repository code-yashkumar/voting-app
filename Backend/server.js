import express from "express";
const app = express();
app.use(express.json());
import db from "./db.js";
// import { jwtAuthMiddleware } from "./jwt.js"; 
// import dotenv from "dotenv";
// dotenv.config();

import userRoutes from "./routes/UserRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
app.use('/User', userRoutes);
app.use('/Candidate',candidateRoutes);

import bodyParser from "body-parser";
import { log } from "console";
const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log("Listening to port  3000");
    
})