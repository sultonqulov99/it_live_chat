import express from "express"
const { Router } = express
import CT from "./controller.js"
const router = Router()

router.get("/",CT.HOME)

export default router