var jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const verifyAuthToken=(req,res,next)=>{
    const TOKEN_KEY = process.env.TOKEN_KEY;

    let token=req.headers['authorization'];
    if(!token){
        res.json({status:false,message:"Auth header is missing"})
    }else{
        let getToken=token.split(' ')
        jwt.verify(getToken[1], TOKEN_KEY,(err,decoded)=>{
            if(err){
                res.json({status:false,message:"Incorrect token"})
            }else{
                if(decoded?.iat<=decoded?.exp){
                    next();
                } else{
                    res.json({status:false,message:"Auth token is expired."})
                }
            }
        });
    }

}


module.exports={verifyAuthToken}