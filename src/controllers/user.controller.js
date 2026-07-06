import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"; // jahan b error asakta hai uder ye use hoga
import { User } from "../models/user.model.js"; // User db se baat karega or data save karega
import { uploadOnCloudinary } from "../utils/cloudinary.js"; //images ko local db se cloudinary pe post karega
import { ApiResponse } from "../utils/ApiResponse.js"; //Api response bataye ga register hua k nahi

//user route se ye wala controller function call hoga registerUser k liye

const registerUser = asyncHandler(async (req, res) => {
  //user registration k liye controller function banaya hai asyncHandler k sath takay error handle ho jaye
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
  const { username, email, fullname, password } = req.body; //HTML body se data aya
  console.log("email: ", email);

  //2
  if (
    [fullname, email, username, password].some(
      (
        field //agara ak b feild miss ho to error
      ) => feild?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All feilds are required");
  }

  //3
  const existedUser = User.findOne({
    //ider user find hoga email ya username ka agar wo pehle se hai to error ayga
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists.");
  }

  //4
  const avatarLocalPath = req.files?.avatar[0]?.path; //ider user ki image or avatar dekho local db me hai to uska path variable me store hoga
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required"); //agar avatar ni hai to error
  }

  //5
  const avatar = await uploadOnCloudinary(avatarLocalPath); //yahan pe local wali file cloudinary pe upload hogi
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required"); //agar avatar ni hai to error
  }

  //6
  const user = await User.create({
    //ab db me user ka aik instance banay ga jisme ye feilds hongi jo dikhi
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", //ider logic lagaya k cover hai to upload ni to no tension
    email,
    password,
    username: username.toLowerCase(),
  });

  //7
  const createdUser = await User.findById(user._id).select(
    //ider user k usi instance me password or refresh token ko del kerna hai
    "-password -refreshToken"
  );

  //8
  if (!createdUser) {
    //ider agar user wala instance nahi bana to error
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  //9
  return res.status(201).json(
    //agar ban gaya to api response
    new ApiResponse(200, createdUser, "User registered successfully")
  );
});

export { registerUser };
