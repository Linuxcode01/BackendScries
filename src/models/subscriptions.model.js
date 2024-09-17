import mongoose, { Schema } from "mongoose";
const subscriptionSchema = new Schema({
    subscriber:{
        types:Schema.types.ObjectId, // one how is subscribing
        ref:"User"
    },
    channel:{
        types:Schema.types.ObjectId,
        ref:"User"
    }
}, {timestamps:true})

export const Subscription=mongoose.model("Subscription", subscriptionSchema) 