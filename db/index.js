import mongoose from "mongoose";
import { DB_NAME } from "../src/constants.js";

const connectDB= async () =>{
    try {
        
       const connectionInstance =  await mongoose.connect('mongodb://localhost:27017/BackendWithChai');

       console.log(` mongoDB connected !! DB HOST :${connectionInstance.connection.host}`);
       
    } catch (error) {
        console.log("ERROR", error);
        process.exit(1)
        
    }
}
export default connectDB