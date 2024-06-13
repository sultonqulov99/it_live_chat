import express from "express"
const { Router } = express
import CT from "./controller.js"
import checkToken from "../../middlewares/checkToken.js"
const router = Router()

router.get("/profileImg/:token",CT.PROFILE_IMG)
router.get("/profileName/:token",CT.PROFILE_NAME)
router.get("/file/:token/:fileName",CT.FILE_NAME)    
router.get("/download/:token/:fileName",checkToken,CT.DOWNLOAD)    

export default router 