import { InternalServerError, BadRequestError, AuthenticationError, NotFoundError } from "../../utils/error.js";
import pool from "../../config/db.js";
import path from 'path'
import fs from 'fs'

const GET_MESSAGES = async (req, res, next) => {
  try {
    let { userId } = req.params;
    let messages = await pool.query(`SELECT * FROM messages where 
        useridfrom =${req.userId} AND useridto=${userId} OR 
        useridfrom=${userId} AND useridto=${req.userId}`);

    return res.status(200).json({
      status: 200,
      message: "All message",
      data: messages.rows,
    });
  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
};

const POST_MESSAGE = async(req, res, next) => {
  try {
    let { messageBody, userId } = req.body;
    
    let user = await pool.query(`SELECT * FROM users WHERE userid = ${userId}`)
    let userTo = await pool.query(`SELECT * FROM users WHERE userid = ${req.userId}`)
    if (req.files) {
        let { file } = req.files;

        const [, expends] = file.mimetype.split("/");
        let fileName = Date.now() + "." + expends;
      if (file.size > 1024 * 1024 * 5) {
        return res.status(403).json({
          status: 403,
          message: "File large to 5mb",
        });
      }    
      file.mv(path.join(process.cwd(), "upload", fileName));

      let f = await pool.query(
        `INSERT INTO messages(userIdFrom,userIdTo,messageType,messageBody,createAt) VALUES($1,$2,$3,$4,$5) RETURNING *
            `,
        [req.userId, userId, "plain/mp4", fileName, '2024-05-17T19:00:00.000Z']
      );           
      return res.status(201).json({
        status:201,
        message:"message add",
        data:f.rows
      })
    } 
      let f = await pool.query(
        `INSERT INTO messages(userIdFrom,userIdTo,messageType,messageBody,createAt) VALUES($1,$2,$3,$4,$5) RETURNING *
            `,
        [req.userId, userId, 'plain/text', messageBody, '2024-05-17T19:00:00.000Z']
      );
      
      let message = f.rows[0]
      message.user = userTo.rows[0]
      process.io.to(user.rows[0].socketid).emit("new message",{message:message})
    
      return res.status(201).json({
        status:201,   
        message:"message add",     
        data:f.rows   
      })
    
  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
};

const UPDATE_MESSAGE = async(req,res,next) =>{
  try {
    let {messageId} = req.params
    let {messageBody} = req.body 

    let message = await pool.query(`SELECT * FROM messages WHERE messageid=${messageId}`)
    message = message.rows
    if(!message.length){
      return next(new NotFoundError(404,"Message not found"))
    }

    if(message[0].useridfrom !=req.userId){    
      return next(new BadRequestError(400,"you can't change this message"))
    }
    if(message[0].messagetype != 'plain/text'){
      return next(new BadRequestError(400,"you can't change this message"))
    }

    let m = await pool.query(`UPDATE messages SET messagebody='${messageBody}' WHERE messageid = ${messageId} RETURNING *`)
    
    //socet message update
    let userId = m.rows[0].useridto
    let user = await pool.query(`SELECT * FROM users WHERE userid=${userId}`)
    
    process.io.to(user.rows[0].socketid).emit("messages:update",m.rows[0])
    return res.status(201).json({
      status:201,
      message:"Update message",
      data:m.rows
    })

  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
}

const DELETE_MESSAGE = async(req,res,next) => {
  try {
    let {messageId} = req.params

    let message = await pool.query(`SELECT * FROM messages WHERE messageid=${messageId}`)
    message = message.rows
    if(!message.length){
      return next(new NotFoundError(404,"Message not found"))
    }

    if(message[0].useridfrom !=req.userId){
      return next(new BadRequestError(400,"you can't delete this message"))
    }
    

    let messageDelete = await pool.query(`DELETE FROM messages WHERE messageid = ${messageId} RETURNING *`)
    
    if(message[0].messagetype == 'plain/video'){
      fs.unlink(path.join(process.cwd(),"upload",message.messagebody))
    }

    let userId = message[0].useridto
    let user = await pool.query(`SELECT * FROM users WHERE userid=${userId}`)
    
    process.io.to(user.rows[0].socketid).emit("message:delete",{messageFrom:message[0]})
    return res.status(200).json({
      status:200,
      message:"delete message",
      data:messageDelete.rows
    })
  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
}
export default {
  GET_MESSAGES,
  POST_MESSAGE,
  UPDATE_MESSAGE,
  DELETE_MESSAGE
};
