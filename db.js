import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// const mongoURL='mongodb://localhost:27017/person'
// const mongoURL=process.env.DB_URL;
const mongoURL=process.env.MONGODB_URL_LOCAL;

mongoose.connect(mongoURL)

const db=mongoose.connection;

db.on('connected',()=>{
    console.log("db connect ho gya h");
})
db.on('disconnected',()=>{
    console.log("db disconnect ho gya h");
})
db.on('error',()=>{
    console.log("error connecting");
})

export default db;
