// require ('dotenv').config({ path:'./env'})
// import dotenv from'dotenv';

import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import express from 'express'
// import connectDB from "../db/index.js;";

// dotenv.config(
//     {
//         path: './env'
//     }
// )

// connectDB();

const app = express();

( async () => {
    try {
        
       await mongoose.connect(`mongodb://localhost:27017//${DB_NAME}`)

       app.listen(process.env.PORT, () => {
        console.log(`App is listening on port ${process.env.PORT}`);
        
       })

    } catch (error) {
        console.log("ERROR",error);
        throw error;
        
    }
})()