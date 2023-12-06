const conne=require('./../config/Config')
const usersModel=require('./../Models/UsersModel')
const common = require('./../helper/Common')

const createUser=async(req,res)=>{
    let params=req.body;
    if(!params.name || !params.email || !params.mobile || !params.password || !params.address){
        res.json({success:false,message:"All fields are required."});
    }else{
        let encryptedPassword=await common.passwordEncrypt(params?.password)
        let current_date=new Date();
        let newUser={
            name:params?.name,
            email:params?.email,
            password:encryptedPassword,
            address:params?.address,
            mobile:Number(params?.mobile),
            created_at:current_date,
            updated_at:current_date
        }
        usersModel.createUser(newUser,(err,data)=>{
            if(err){
                res.json({
                    status:false,message:err.message || "Some error occurred while creating the Employee."
                })
            }else{
                res.json({status:true,message:"Thanks to sign Up.",body:data});
            }
        })
    }
    // res.json({message:"Created user successfully"});
}

const getAllUsers=(req,res)=>{
    usersModel.getAllUsers((err,data)=>{
        if(err){
            res.json({status:false,message:err.message || "Error while fetching records!"})
        }else{
            res.json({
                status:true,
                message:"Records have been fetched.",
                body:data
            })
        }
    })
}

const deleteUser=(req,res)=>{
    res.send("deleteUser");
}

const userLogin=(req,res)=>{
    let params=req.body;
    // let token=req.headers['authorization'];
    let userCred={
        email:params?.email,
        password:params?.password
    }
    usersModel.userLogin(userCred,(err,data)=>{
        if(err){
            res.json({status:false,message:err.message || "Some error occurred while login"})
        }else{
            res.json(data)
        }
    })
}

module.exports={
    createUser,
    getAllUsers,
    deleteUser,
    userLogin
}