// models/user.model.js - COMPLETE FIXED VERSION
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
      index: true,
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

// FIX: Pre-save hook - Async function use karo, 'next' ko optional rakho
userSchema.pre("save", async function (next) {
  console.log("🔄 pre-save hook called");
  
  // Agar password modify nahi hua toh skip karo
  if (!this.isModified("password")) {
    console.log("⏭️ Password not modified, skipping hash");
    return next();
  }
  
  console.log("🔐 Hashing password...");
  try {
    this.password = await bcrypt.hash(this.password, 10);
    console.log("✅ Password hashed successfully");
    next();
  } catch (error) {
    console.log("❌ Error hashing password:", error.message);
    next(error);
  }
});

// OR better - Alternative approach without 'next' (MODERN WAY)
// userSchema.pre("save", async function() {
//   if (!this.isModified("password")) return;
//   this.password = await bcrypt.hash(this.password, 10);
// });

userSchema.methods.isPasswordCorrect = async function (password) {
  console.log("🔍 Checking password...");
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  console.log("🟢 generateAccessToken called for user:", this._id);
  const payload = {
    _id: this._id,
    email: this.email,
    username: this.username,
    fullname: this.fullname,
  };
  console.log("🟢 Payload:", payload);
  
  const secret = process.env.ACCESS_TOKEN_SECRET;
  console.log("🟢 Using secret:", secret ? "Exists" : "MISSING!");
  
  if (!secret) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined in .env file!");
  }

  try {
    const token = jwt.sign(payload, secret, { 
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" 
    });
    console.log("🟢 Token generated successfully");
    return token;
  } catch (error) {
    console.log("🔴 Error in generateAccessToken:", error.message);
    throw error;
  }
};

userSchema.methods.generateRefreshToken = function () {
  console.log("🟢 generateRefreshToken called for user:", this._id);
  const payload = {
    _id: this._id,
  };
  console.log("🟢 Payload:", payload);
  
  const secret = process.env.REFRESH_TOKEN_SECRET;
  console.log("🟢 Using secret:", secret ? "Exists" : "MISSING!");
  
  if (!secret) {
    throw new Error("REFRESH_TOKEN_SECRET is not defined in .env file!");
  }

  try {
    const token = jwt.sign(payload, secret, { 
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d" 
    });
    console.log("🟢 Token generated successfully");
    return token;
  } catch (error) {
    console.log("🔴 Error in generateRefreshToken:", error.message);
    throw error;
  }
};

const User = mongoose.model("User", userSchema);
export { User };