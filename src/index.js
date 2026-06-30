import dotenv from "dotenv"; 
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'        //to load environment variables as soon as the server starts
})

connectDB()