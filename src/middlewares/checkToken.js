import { AuthorizationError } from '../utils/error.js'
import JWT from '../utils/jwt.js'
import pool from "../config/db.js"

export default async (req, res, next) => {
    try {
        let token = req.headers.token
        if (!token) token = req.params.token
        
        if (!token) {
            throw new AuthorizationError("token is required!")
        }

        const { userId, agent } = JWT.verify(token)
        if (req.headers['user-agent'] !== agent) {
            throw new AuthorizationError("token is sent from wrong device!")
        }

        let user = await pool.query(`SELECT * FROM users WHERE userid = ${userId}`)

        if (!user.rows.length) {
            throw new AuthorizationError("invalid token")
        }

        req.userId = userId
        next()
    } catch (error) {
        next(error)
    }
}