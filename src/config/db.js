import pkg from 'pg'
import dotenv from 'dotenv'
const { Pool } = pkg
dotenv.config()

const pool = new Pool({
    user:process.env.PG_USERNAME,
    port:process.env.PG_PORT,
    host:process.env.PG_HOST,
    password:process.env.PG_PASSWORD,
    database:process.env.PG_DB
})

export default pool
