import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, //agar searching kerni hai kisi user ko to index lagana padega
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

//password ko hash karne ke liye pre save hook ka use kar rahe hai
userSchema.pre("save", async function (next) {
  //ye function save hone se pehle chalega
  if (!this.isModified("password")) return next(); //agar password modify hua hai to hi hash karna hai
  this.password = await bcrypt.hash(this.password, 10); //is line me password ko hash kar rahe hai
  // next();
});

//ye function save hone ke baad chalega
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); //ye function password ko compare karega
};

userSchema.methods.generateAccessToken = function () {
  //ye function access token generate karega
  return jwt.sign(
    {
      _id: this._id, //short lived token generate karne ke liye user ka id, email, username aur fullname ko sign kar rahe hai
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      //ye function refresh token generate karega long term cookie ke liye
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);
