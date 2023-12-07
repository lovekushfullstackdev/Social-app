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
            mobile:params?.mobile,
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
    let token=req.headers['authorization'];
    
    let users_data = common.getTokenData(token);
    console.log("users_data",users_data);
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
    if(!params?.email || !params?.password){
        res.json({status:false,message:"All fields are requied!"})
    }else{
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

}

const updateProfile=async(req,res)=>{
    try{
        let params=req.body;
        let files=req.files;

        let sampleFile;
        let uploadPath;

        if(!params.name || !params.mobile || !params.address){
            res.json({success:false,message:"All fields are required."});
        }else{

            // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
            // if(req.files && req.files.profile_pic){
            //     sampleFile = req.files.profile_pic;
            //     uploadPath = './uploads/' +Date.now()+sampleFile.name;
    
            //     // Use the mv() method to place the file somewhere on your server
            //     await sampleFile.mv(uploadPath, function(err) {
            //         if (err)
            //         return res.status(500).send(err);
            //     });
    
            // }
            let file_status=false;
            if(files && files.profile_pic){
                file_status=await common.upload_post(files.profile_pic);
            }
            console.log("file_status",file_status);
            let token=req.headers['authorization'];
            let user={
                name:params?.name,
                mobile:params?.mobile,
                address:params?.address,
                updated_at:new Date()
            }
            
            if(files && files.profile_pic){
                user.profile_pic=file_status;
            }

            usersModel.updateProfile(user,token,(err,result)=>{
                if(err){
                    res.json({status:false,message:err.message || "Some error occured."})
                }else{
                    res.json({status:true,message:"Your profile has been updated.",body:result})
                }
            })
        }
    }catch(error){
        res.json({status:false,message:error.message})
    }
}

const upload_post=async(req,res)=>{
    try{
        let params=req.body;
        let file=req.files;
        if(!params.title || !params.description || !file.post_img){
            res.json({status:false,message:"All fields are required."})
        }else{
            // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
            let sampleFile = req.files.post_img;
            let uploadPath = './uploads/' +Date.now()+sampleFile.name;

            // Use the mv() method to place the file somewhere on your server
            let post_img='';
            await sampleFile.mv(uploadPath, function(err) {
                if (err)
                return res.status(500).send(err);
            });
            let token=req.headers['authorization'];
            let post={
                title:params?.title,
                description:params?.description,
                post_img:uploadPath,
                uploaded_at:new Date(),
                created_at:new Date(),
                updated_at:new Date()
            } 
            usersModel.upload_post(post,token,(err,result)=>{
                if(err){
                    res.json({status:false,message:err.message || "Something wrong."})
                }else{
                    res.json({status:true,message:"Your post has been uploaded.",body:result})
                }
            })
            
        }
    }catch(error){
        res.json({status:false,message:error})
    }
}

module.exports={
    createUser,
    getAllUsers,
    deleteUser,
    userLogin,
    updateProfile,
    upload_post
}