import { Router } from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/user.controller.js';
import { upload, verifyJWT  } from "../middlewares/multer.middleware.js"; //ye registerUser se pehle run hoga q k ye middleware hai ipehle ye upload check hoga phir register chalay ga 

const router = Router();

router.route("/register").post(
    upload.fields([             //ye uplaod middleware tab kaam kare ga agar images uplaod hongay
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
    ]),
    registerUser
);   //ab app.js me /api/v1/users/register route kaam karega aur registerUser controller function ko call karega

router.route("/login").post(loginUser)

//secured routes 
router.route("/logout").post(verifyJWT, logoutUser)
export default router;