//this will verify is the user is logged in or not
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js"

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")       //ider hamne access token liye ya to cookie se mil jaye ya header se
        if (!token) {
            throw new ApiError(401, "Unauthorized request")         //ye kam hoga agar token nahi hai 
        }
        //agar token mil gaya
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)   //verify kar rahe hai token ko secret key se
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")      //ider hamne user ko find kiya hai id se aur password aur refresh token ko exclude kiya hai
        if(!user){
            throw new ApiError(401, "Unauthorized request")         //agar user nahi mila to unauthorized request
        }
        req.user = user;
        next()
    }catch (error) {
        throw new ApiError(401, "Unauthorized request")         //agar token verify nahi hua to unauthorized request
    }
})
