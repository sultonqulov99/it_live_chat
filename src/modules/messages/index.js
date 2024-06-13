import express from "express"
const { Router } = express
import CT from "./controller.js"
import messageVolidation from "../../middlewares/volidations.js"
import checkToken from "../../middlewares/checkToken.js"
const router = Router()


router.get("/messages/:userId",messageVolidation,checkToken,CT.GET_MESSAGES)

router.post("/messages",messageVolidation,checkToken,CT.POST_MESSAGE)

router.put("/messages/:messageId",messageVolidation,checkToken,CT.UPDATE_MESSAGE)

router.delete("/messages/:messageId",messageVolidation,checkToken,CT.DELETE_MESSAGE)



export default router