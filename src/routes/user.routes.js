import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js';

const router = Router();

router.route("/register").post(registerUser);   //ab app.js me /api/v1/users/register route kaam karega aur registerUser controller function ko call karega

export default router;