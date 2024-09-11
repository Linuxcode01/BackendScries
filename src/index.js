import mongoose, { connect } from "mongoose";
import { DB_NAME } from "./constants.js";
import express from 'express'
import dotenv from 'dotenv';
import connectDB from '../db/index.js'
const app = express();
dotenv.config({
    path:'./env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, ()=>{
        console.log();
        
    })
}).catch((err) => {
    console.log("MOngo db connection failed", err);
    
});