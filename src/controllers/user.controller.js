import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"; // jahan b error asakta hai uder ye use hoga
import { User } from "../models/user.model.js"; // User db se baat karega or data save karega
import uploadOnCloudinary from "../utils/cloudinary.js"; //images ko local db se cloudinary pe post karega
import { ApiResponse } from "../utils/ApiResponse.js"; //Api response bataye ga register hua k nahi

//user route se ye wala controller function call hoga registerUser k liye

// Complete working controller
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    console.log("🔄 Generating tokens for user:", userId);

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    console.log("📝 Generating access token...");
    const accessToken = user.generateAccessToken();

    console.log("📝 Generating refresh token...");
    const refreshToken = user.generateRefreshToken();

    // ✅ BEST FIX: updateOne use karo - pre-save hook trigger nahi hoga
    console.log("💾 Saving refresh token to database...");
    await User.updateOne(
      { _id: userId },
      { $set: { refreshToken: refreshToken } }
    );
    console.log("✅ Refresh token saved successfully");

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("❌ Error:", error.message);
    throw new ApiError(500, "Error generating tokens: " + error.message);
  }
};

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
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All feilds are required");
  }

  //3
  const existedUser = await User.findOne({
    //ider user find hoga email ya username ka agar wo pehle se hai to error ayga
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists.");
  }

  //4
  const avatarLocalPath = req.files?.avatar[0]?.path; //ider user ki image or avatar dekho local db me hai to uska path variable me store hoga
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required"); //agar avatar ni hai to error
  }

  //5
  const avatar = await uploadOnCloudinary(avatarLocalPath); //yahan pe local wali file cloudinary pe upload hogi
  console.log("Avatar Path:", avatarLocalPath);
  console.log("Cloudinary Response:", avatar);

  // FIX: Improved coverImage upload logic - agar coverImage hai to upload karo nahi to null rakho
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

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

// 10 login user
const loginUser = asyncHandler(async (req, res) => {
  //user body -> data
  //username or email or password
  //find user
  //paswword check
  //access and refresh token generate
  //send cookie

  const { email, username, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({ $or: [{ username }, { email }] }); //ider ham db operator or se user(email ya username) ko find kar rahe hai

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password); //ider user ka password check kar rahe hai
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true, //sirf server modify ker sakta hi
    secure: true, //koi b modify nahi ker sakta
    // FIX: Added sameSite option for better security - cross-origin requests ke liye
    sameSite: "none",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    {
      new: true,
    }
  ); //ider user ka refresh token null kar rahe hai

  const options = {
    httpOnly: true, //sirf server modify ker sakta hi
    secure: true, //koi b modify nahi ker sakta
    // FIX: Added sameSite option for consistency
    sameSite: "none",
  };

  // FIX: Changed 'clearcookie' to 'clearCookie' - ye method sahi spelling hai
  // Pehle 'clearcookie' tha jo galat tha, ab sahi kiya gaya
  return res
    .status(200)
    .clearCookie("accessToken", options) // FIX: clearCookie (small 'c', capital 'C')
    .clearCookie("refreshToken", options) // FIX: clearCookie (small 'c', capital 'C')
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };

//User mongoose model me methods banay hain or user controller me un methods ko call kar rahe hain. yaar ye check karo
