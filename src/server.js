import express from "express"
import ejs from "ejs"
import path from "path"
import modules from "./modules/index.js" 
import dotenv from "dotenv"
import errorHandler from "./middlewares/errorHandler.js"
import logger from "./middlewares/logger.js"
import fileUpload from "express-fileupload"
import http from "http";
import { Server } from "socket.io";
import JWT from "./utils/jwt.js"
import pool from './config/db.js'
dotenv.config()

const app = express()
const httpServer = http.createServer(app);
const io = new Server(httpServer);

app.use(express.json())
app.engine("html",ejs.renderFile)
app.set("view engine","html")

app.set("views",path.join(process.cwd(),"src","views"))
app.use(express.static(path.join(process.cwd(),"src","public")))
app.use(express.static(path.join(process.cwd(),"upload")))
app.use(fileUpload())

app.use(modules)

app.use(errorHandler)
app.use(logger)


io.on("connection", async (socket) => {
    try {
        process.io = io 
        process.socket = socket
        let token = socket.handshake.auth.headers
        if(!token){
            socket.emit("user:exit")
        }
        const { userId, agent } = JWT.verify(token)
        let user = await pool.query(`SELECT * FROM users WHERE userid=${userId}`)
        user = user.rows
        if(!user){
            socket.emit("user:exit")
        }

        await pool.query(`UPDATE users SET socketid='${socket.id}' WHERE userid=${userId}`)
        socket.broadcast.emit("user:connected",user)

        socket.on("disconnect",async() =>{
            await pool.query(`UPDATE users SET socketid='${null}' WHERE userid=${userId}`)
            socket.broadcast.emit("user:disconnected",user)
        })

        socket.on("message:typing",async({to}) => {
            let user =await pool.query(`SELECT * FROM users WHERE userid=${to}`)
            io.to(user.rows[0].socketid).emit("message:typing",{from:userId})
        }) 

        socket.on("message:stop",async({to}) => {
            let user =await pool.query(`SELECT * FROM users WHERE userid=${to}`)
            io.to(user.rows[0].socketid).emit("message:stop",{from:userId})
        })

    } catch (error) {
        console.log(error);
        socket.emit("user:exit")
    }
}); 

httpServer.listen(process.env.PORT,()=>console.log("server is run..."))
