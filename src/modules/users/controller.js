import sha256 from 'sha256'
import db from '../../config/db.js'
import { AuthenticationError, AuthorizationError, InternalServerError } from '../../utils/error.js'
import JWT from '../../utils/jwt.js'
import path from 'path'
import pool from '../../config/db.js'
const GET_REGISTER = (req,res,next) => {
    try {
        res.render("register")
    } catch (error) {
        console.log(error)
    }
}
const GET_LOGIN = (req,res,next) => {
    try {
        res.render("login")
    } catch (error) {
        console.log(error)
    }
}

const POST_LOGIN = async(req,res,next) => {
    try {
        const {userName,password} = req.body

        let user = await pool.query(`select * from users where username='${userName}' and password ='${sha256(password)}'`)
        if(!user.rows.length){
            return next(new AuthorizationError(401,"userName or password wrong!"))
        }
        
        return res.status(200).json({
            status:200,
            message:"Login succasseflly",
            data:user.rows,
            token:JWT.sign({userId:user.rows[0].userid,agent:req.headers['user-agent']})
        })
    } catch (error) {
        return next(new InternalServerError(500,error.message))
    }
}

const POST_REGISTER = async(req,res,next) => {
    try {
        
        let { userName, password } = req.body

        const { profileImg } = req.files
        
        let [q,name] = profileImg.mimetype.split("/")

        let u = await pool.query(`SELECT * FROM users where username ='${userName}'`)
        if(u.rows.length){
            return next(new AuthorizationError(400,"User alredy exists!"))
        }
        
        if(!["jpg",'png','jpeg'].includes(name)){
            return next(new AuthenticationError(403,"Only jpg|png|jpeg allowd"))
        }

        let fileName = userName + "." + name
        password = sha256(password)
        profileImg.mv(path.join(process.cwd(),'upload',fileName))
        let user = await pool.query(`INSERT INTO users(username,password,profileimg) VALUES($1,$2,$3) RETURNING *`,[
            userName,
            password,  
            fileName
        ])
        return res.status(201).json({
            status:201,
            message:"user succasse added",
            data:user.rows,
            token:JWT.sign({userId:user.rows[0].userid,agent:req.headers['user-agent']})
        })
    } catch (error) {
        return next(new InternalServerError(500,error.message))
    }
}

const USERS = async(req,res,next) =>{
    try {
        let users = await pool.query(`SELECT * FROM users WHERE userid != ${req.userId}`)
        
        return res.status(200).json({
            status:200,
            message:"All users",
            data:users.rows
        })
    } catch (error) {
        next(error)
    }
}

export default {
    GET_REGISTER,
    GET_LOGIN,
    POST_LOGIN,
    POST_REGISTER,
    USERS
}