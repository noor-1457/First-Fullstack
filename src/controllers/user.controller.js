import asyncHandler from '../utils/asyncHandler.js';
//user route se ye wala controller function call hoga registerUser k liye

const registerUser = asyncHandler(async (req, res) => {     //user registration k liye controller function banaya hai asyncHandler k sath takay error handle ho jaye
    //get user details from frontend
    //validation
    //check if user is registered: username    email
    // check for images , check for avatar
    //upload them to cloudinary , avatar
    // create user object , create entry in db 
    //remove password and refresh token feild from response 
    //check for user creation 
    //return response
})

export { registerUser };