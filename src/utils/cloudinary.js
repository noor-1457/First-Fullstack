//yahan pe ham local file ka url leke cloudinary k server pe upload karengay ye code reusable hai jahan marzi use karo or websites pe
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

//localFilePath is the path of the file which we want to upload on cloudinary server (replace with your local file path)
const uplaodOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //ab ham file uplaod karengay cloudinary k server pe
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //console.log("file uploaded to cloudinary successfully:", uploadResult.url);
    fs.unlinkSync(localFilePath)
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(localFilePath); // Delete the local file after upload
    return null;
  }
};

export default uplaodOnCloudinary;
