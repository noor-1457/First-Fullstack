import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
//app.use hamesha middleware ya configurations k liye kerte hain

app.use(express.json({ limit: "50mb" })); //iska matlab frontend se json accept hoga ab object me limit lagayen gay takay server crash na ho zyada data na ajaye
app.use(express.urlencoded({ limit: "50mb", extended: true })); //extended ka matlab hai object me b object use ho sakta hai zaroorat nahi just for info
app.use(express.static("public"));     //yeh static folder ka kaam karta hai jahan hum images ya files store karte hain
app.use(cookieParser()); //yeh cookies ko parse karke req.cookies me dalta hai   || ham user k browser me cookies k sath crud operations ker sakte hain 

export { app };
