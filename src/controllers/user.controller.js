import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
//user route se ye wala controller function call hoga registerUser k liye

const registerUser = asyncHandler(async (req, res) => {     //user registration k liye controller function banaya hai asyncHandler k sath takay error handle ho jaye
    //1 get user details from frontend
    //2 validation
    //3 check if user is registered: username    email
    //4 check for images , check for avatar
    //5 upload them to cloudinary , avatar
    //6 create user object , create entry in db 
    //7 remove password and refresh token feild from response 
    //8 check for user creation 
    //9 return response 


    //1
    const { username, email, fullname, password} = req.body;
    console.log("email: ", email);

    //2
    if(
        [fullname, email, username, password].some((field)=>
        feild?.trim() === "")
    ){
        throw new ApiError(400, "All feilds are required")
    } 

    //3
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser) {
        throw new ApiError(409, "User with email or username already exists.")
    }

     //4
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    //5
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    //6
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })

    //7
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //8
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    //9
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
    })

export { registerUser };