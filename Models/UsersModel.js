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
                        // let body="Thanks for Sign Up";
                        // common.sendMail(email,"Registration",body);
                        
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

const updateProfile=(user,token,result)=>{
    try{
        let token_data=common.getTokenData(token)

        conn.query("update users set ? where id=?",[user,token_data?.id],(err,updated_user)=>{
            if(err){
                result(err,null)
            }else{
                result(null,user)
            }
        })
    }catch(error){

    }
}

const upload_post=(post,token,result)=>{
    try{
        let data=common.getTokenData(token)
        if(data){
            let user_id=data.id;
            post.user_id=user_id;
            conn.query("insert into posts set ?",post,(err,row)=>{
                if(err){
                    result(err,null)
                }else{
                    result(null,row)
                }
            })
        }
    }catch(error){
        result(error,null)
    }
}
const get_user_profile=(user_id,result)=>{
    try{
        conn.query("select * from users where id=?",user_id,(err,row)=>{
            if(err){
                result(err,row);
            }else{
                result(null,row);
            }
        })
    }catch(error){
        result(error,null)
    }
}

const get_user_posts=(user_id,result)=>{
    try{
        conn.query("select * from posts where user_id=?",user_id,(err,rows)=>{
            if(err){
                result(err,rows);
            }else{
                result(null,rows);
            }
        })
    }catch(error){
        result(error,null);
    }
}

const get_all_posts=(result)=>{
    try{
        conn.query("select * from posts where isDeleted=0 and status=1 order by uploaded_at desc ",(err,rows)=>{
            if(err){
                result(err,rows);
            }else{
                result(null,rows);
            }
        })
    }catch(error){
        result(error,null);
    }
}

const delete_post=(user_id,post_id,result)=>{
    try{
        if(post_id){
            console.log("post_id",post_id);
            console.log("user_id",user_id);
            conn.query("update posts set isDeleted=1 where id=? and user_id=?",[post_id,user_id],(err,row)=>{
                if(err){
                    result(err,null)
                }else{
                    if(row.affectedRows){
                        result(null,row)
                    }else{
                        result({message:"You are trying to access wrong data."},null)
                    }
                }
            })
        }
    }catch(error){
        result(error,null)
    }
}

module.exports={
    createUser,
    userLogin,
    getAllUsers,
    updateProfile,
    upload_post,
    get_user_profile,
    get_user_posts,
    get_all_posts,
    delete_post,
}