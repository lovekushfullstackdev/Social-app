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


/************User logged in*************/
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
            let user_id=rows[0].id;
            if(password){
                bcrypt.compare(password,correct_password,(err,isMatch)=>{
                    if(err){
                        result({status:false,message:err.message},null)
                    }else if(isMatch){
                        const token = jwt.sign(rows[0],TOKEN_KEY,{ expiresIn: 60*60*24 });
                        conn.query("update users set is_logged_in=1 where id=?",user_id,(err,response)=>{
                            if(err){
                                result(err,null)
                            }else{
                                result(null,{status:true,message:"You are logged in now.",body:rows[0],token:token})
                            }
                        })
                    }else{
                        result({status:false,message:"Password does not match."},null)
                    }
                })
            }
        }
    })
}


/**************Logout account update status is_logged_in************/
const logout_user=(user_id,result)=>{
    try{
        conn.query("update users set is_logged_in=0 where id=?",user_id,(err,response)=>{
            if(err){

            }else{
                result(null,response)
            }
        })
    }catch(error){

    }
}

const getAllUsers=(user_data,result)=>{
    try{
        let query = `SELECT users.*, messages.timestamp FROM users LEFT JOIN messages on users.id=messages.receiver_id and (messages.sender_id=${user_data.id} or messages.receiver_id=${user_data.id}) where users.id!=${user_data.id} GROUP BY users.id order by messages.timestamp DESC`;

        conn.query(query,(err,rows)=>{
            if(err){
                result(err,null)
                return;
            }else{
                result(null,rows)
                return ;
            }
        })
    }catch(error){

    }

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

const get_all_posts=(user_id,result)=>{
    try{
        conn.query("SELECT *, posts.id as p_id, (select count(id) from post_likes where post_id=posts.id and is_like=1) as total_likes, (select count(id) from comments where post_id=posts.id) as total_comments FROM posts LEFT JOIN post_likes ON posts.id = post_likes.post_id and post_likes.user_id=? LEFT JOIN users on posts.user_id=users.id ORDER BY posts.id DESC ",user_id,(err,rows)=>{
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

const post_like=(post_id,user_id,result)=>{
    try{
        let current_date=new Date();
        let data={
            post_id:post_id,
            user_id:user_id,
            is_like:1,
            // created_at:current_date,
            updated_at:current_date
        }
        conn.query("select is_like,id from post_likes where user_id=? and post_id=?",[user_id,post_id],(err,rows)=>{

            if(rows.length){
                data.is_like=!rows[0].is_like;
                let message="The post has been liked."
                if(!data.is_like){
                    message="The post has been removed from like."
                }
                conn.query("update post_likes set ? where post_id=? and user_id=?",[data,post_id,user_id],(err,res)=>{
                    if(err){
                        result(err,null)
                    }else{
                        result(null,message)
                    }
                })
            }else{
                data.created_at=current_date;
                conn.query("insert into post_likes set ?",data,(err,res)=>{
                    if(err){
                        result(err,null)
                    }else{
                        result(null,"The post has been liked.")
                    }
                })
            }
        })
    }catch(error){
        result(error,null)
    }
}

const post_comment=(new_comment,result)=>{
    try{
        let current_date=new Date();
        new_comment.commented_at=current_date;
        new_comment.created_at=current_date;
        new_comment.updated_at=current_date;
        conn.query("select count(id) as count from posts where id=?",new_comment.post_id,(err,res)=>{
            if(err){
                result(err,null)
            }else{
                if(res[0].count>0){
                    console.log("new_comment",new_comment);
                    conn.query("insert into comments set ?",new_comment,(err,rows)=>{
                        if(err){
                            result(err,null)
                        }else{
                            result(null,rows)
                        }
                    })
                }else{
                    let err_message={
                        message:"The post that you are looking for does not exist."
                    }
                    result(err_message,null)
                }
            }
        })

    }catch(error){
        console.log("error",error);
    }
}
const get_post_comments=(post_id,result)=>{
    try{
        conn.query("select *,comments.id as comment_id  from comments INNER JOIN users on comments.commented_user_id=users.id where post_id=? order by comments.commented_at DESC",post_id,(err,rows)=>{
            if(err){
                result(err,null)
            }else{
                result(null,rows)
            }
        })
    }catch(error){

    }
}
const delete_post_comments=(comment_id,result)=>{
    try{
        conn.query("Delete from comments where id=?",comment_id,(err,rows)=>{
            if(err){
                result(err,null)
            }else{
                result(null,rows)
            }
        })
    }catch(error){

    }
}

const get_messages=(user_id,receiver_id,result)=>{
    try{
        conn.query("select * from messages where sender_id=? and receiver_id=? or receiver_id=? and sender_id=?",[user_id,receiver_id,user_id,receiver_id],(err,rows)=>{
            if(err){
                result(err,null);
            }else{
                result(null,rows);
            }
        })
    }catch(error){

    }
}

const allUsers=(user_id,result)=>{
    try{
        conn.query("select * from users where id!=?",user_id,(err,response)=>{
            if(err){
                result(err,null)
            }else{
                result(null,response)
            }
        })
    }catch(error){
        result(error,null)
    }
}

const createGroup=async(admin_id,user_ids,group,admin_msg,result)=>{
    try{
            let group_ids=[];
            if(user_ids){
                group_ids=user_ids.split(",").map(Number);
                group_ids.unshift(admin_id);
            }else{
                group_ids.push(admin_id)
            }
            let add_users;
            conn.query("insert into chat_groups set ?",group,async(err,response)=>{
                if(err){
                    result(err,null)
                }else{
                    let insertId=response?.insertId;
                    admin_msg.group_id=insertId;
                    conn.query("insert into messages set ?",admin_msg,async(err,res)=>{
                        if(err){
                            result(err,null)
                        }else{
                            add_users=group_ids.map((id,index)=>{
                                return new Promise((resolve,reject)=>{
                                    let current_date=new Date();
                                    let new_user={
                                        group_id : insertId,
                                        user_id : id,
                                        is_admin : (index==0)?1:0,
                                        created_at : current_date,
                                        updated_at : current_date
                                    }
                                    conn.query("insert into group_users set ?",new_user,(err,rows)=>{
                                        if(err){
                                            reject(err)
                                        }else{
                                            resolve(rows)
                                        }
                                    })
                                })
                            })
        
                            let results = await Promise.all(add_users);
                            result(null,results)
                        }

                    })

                }
            })

    }catch(error){
        result(error,null)
    }
}

const get_group_list=(user_id,result)=>{
    try{
        conn.query("select chat_groups.*,group_users.* from group_users left join chat_groups on group_users.group_id=chat_groups.id where user_id=?",user_id,(err,response)=>{
            if(err){
                result(err,null)
            }else{
                result(null,response)
            }
        })
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
    post_like,
    post_comment,
    get_post_comments,
    delete_post_comments,
    get_messages,
    logout_user,
    allUsers,
    createGroup,
    get_group_list,
}