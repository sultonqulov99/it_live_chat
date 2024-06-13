import express from "express"
const { Router } = express
import CT from "./controller.js"
import UserVolidation from "../../middlewares/volidations.js"
import checkToken from "../../middlewares/checkToken.js"
const router = Router()

router.get("/register",CT.GET_REGISTER)
router.get("/login",CT.GET_LOGIN)
router.get("/users",checkToken,CT.USERS)

router.post("/login",UserVolidation,CT.POST_LOGIN)
router.post("/register",UserVolidation,CT.POST_REGISTER)

export default router