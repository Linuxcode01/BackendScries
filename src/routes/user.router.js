import { Router } from "express";
import {loginUser, logOutUser, refreshAccessToken, registerUser} from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJwt } from "../middlewares/Auth.midleware.js";

const router = Router()

router.route("/register").post(
    upload.fields(
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ),
    registerUser
    )
router.route("/login").post(loginUser)

//secured routes

router.route("/logout").post(verifyJwt ,logOutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router;

