import pool from '../../config/db.js'
import path from 'path'
import JWT from "../../utils/jwt.js"

const PROFILE_IMG = async(req,res,next) =>{
    try {
        let token = req.params.token
        const { userId } = JWT.verify(token)
        let users = await pool.query(`SELECT * FROM users WHERE userid = ${userId}`)
        
        res.sendFile(path.join(process.cwd(),'upload',users.rows[0].profileimg))
    } catch (error) {
        next(error)
    }
}

const PROFILE_NAME = async(req,res,next) =>{
    try {
        let token = req.params.token
        const { userId } = JWT.verify(token)
        let users = await pool.query(`SELECT * FROM users WHERE userid = ${userId}`)
        
        res.status(200).json(users.rows[0].username)
    } catch (error) {
        next(error)
    }
}

const FILE_NAME = async(req,res,next) => {
    try {
        let {fileName} = req.params 
        res.sendFile(path.join(process.cwd(),'upload',fileName))
    } catch (error) {
        next(error)
    }
}

const DOWNLOAD = async(req,res,next) => {
    try {
        let {fileName} = req.params 

        res.download(path.join(process.cwd(),'upload',fileName))
    } catch (error) {
        next(error)
    }
}



export default {
    PROFILE_IMG,
    PROFILE_NAME,
    FILE_NAME,
    DOWNLOAD
}