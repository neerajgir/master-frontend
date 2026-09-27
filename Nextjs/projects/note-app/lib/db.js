import mongoose from "mongoose";
import "dotenv/config"

export async function connectDB(){
   try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to MongoDB")
        return mongoose.connection
   }catch(error){
    console.error("Database connection failed:", error);
   }
}