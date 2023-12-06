const conn=require("./../config/Config")
var jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const bcrypt=require('bcrypt')
const common=require('./../helper/Common')
const createUser=(newUser,result)=>{
    let email=newUser?.email;
    conn.query("Select count(id) as count from users where email=?",email,(err,res)=>{
        if(err){
            result(err,null)
        }else{
            if(res[0].count>=1){
                result({status:false,message:"Email already exist"},null)
            }else{
                conn.query("INSERT INTO users SET ?",newUser,(err,res)=>{
                    if(err){
                        result(err,null)
                        return;
                    }else{
                        console.log("res",res);
                        let body="Thanks for Sign Up";
                        common.sendMail(email,"Registration",body);
                        
                        result(null,{ id: res.insertId, ...newUser })
                    }
                })
            }
        }
    })
}

const userLogin=(userCred,result)=>{
    let email=userCred?.email;
    let password=userCred?.password;
    conn.query("select * from users where email=? limit 1",email,(err,rows)=>{
        // server.js
        const TOKEN_KEY = process.env.TOKEN_KEY;
        if(rows.length==0){
            result({status:false,message:"We cannot find an account with this email address."},null)
        }else{
            let correct_password=rows[0].password;
            if(password){
                bcrypt.compare(password,correct_password,(err,isMatch)=>{
                    if(err){
                        result({status:false,message:err.message},null)
                    }else if(isMatch){
                        const token = jwt.sign(rows[0],TOKEN_KEY,{ expiresIn: 60*60*24 });
                        result(null,{status:true,message:"You are logged in now.",body:rows[0],token:token})
                    }else{
                        result({status:false,message:"Password does not match."},null)
                    }
                })
            }
        }
    })
}

const getAllUsers=(result)=>{
    conn.query("select * from users",(err,rows)=>{
        if(err){
            result(err,null)
            return;
        }else{
            result(null,rows)
            return ;
        }
    })
}


module.exports={createUser,userLogin,getAllUsers}