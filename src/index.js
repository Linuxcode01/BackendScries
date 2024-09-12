import mongoose, { connect } from "mongoose";
import { DB_NAME } from "./constants.js";
import express from 'express'
import dotenv from 'dotenv';
import connectDB from './db/index.js'
const app = express();
dotenv.config({
    path:'./env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, ()=>{
        console.log("server is running ");
        console.log(process.env.PORT);
        console.log(process.env.MONGODB_URL);
 
    })
}).catch((err) => {
    console.log("Mongo db connection failed", err);
    
});