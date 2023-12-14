const usersModel=require('./../Models/UsersModel')
const common = require('./../helper/Common')
const stripe = require('stripe')("sk_test_51OMPOYSIa9B2WEB5Khp2CY01ZHSHziw53DnFL0l2OqyEWVlWBaTYQSUEEAT61zysrByjshBAjWTxtUTXCm4V4Sa900pEDTj5aT");

/*******User Sign-Up*****/
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
}

/*******Fetched all the users*****/
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

/*******User's login*****/
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

/*******update user's profile*****/
const updateProfile=async(req,res)=>{
    try{
        let params=req.body;
        let files=req.files;

        if(!params.name || !params.mobile || !params.address){
            res.json({success:false,message:"All fields are required."});
        }else{
            // let sampleFile;
            // let uploadPath;
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
            
            let token=req.headers['authorization'];
            let user={
                name:params?.name,
                mobile:params?.mobile,
                address:params?.address,
                updated_at:new Date()
            }
            
            if(files && files.profile_pic){
                await common.upload_image(files.profile_pic,(err,result)=>{
                    user.profile_pic=result;
                    usersModel.updateProfile(user,token,(err,result)=>{
                        if(err){
                            res.json({status:false,message:err.message || "Some error occured."})
                        }else{
                            res.json({status:true,message:"Your profile has been updated.",body:result})
                        }
                    })
                });
            }else{
                usersModel.updateProfile(user,token,(err,result)=>{
                    if(err){
                        res.json({status:false,message:err.message || "Some error occured."})
                    }else{
                        res.json({status:true,message:"Your profile has been updated.",body:result})
                    }
                })
            }
           

            
        }
    }catch(error){
        res.json({status:false,message:error.message})
    }
}

/*******Upload a post*****/

const upload_post=async(req,res)=>{
    try{
        let params=req.body;
        let files=req.files;
        if(!params.title || !params.description || !files.post_img){
            res.json({status:false,message:"All fields are required."})
        }else{
            let token=req.headers['authorization'];
            let status=1;
            if(params.status!=undefined){
                status=params.status;
            }
            let post={
                title:params?.title,
                description:params?.description,
                status:status,
                uploaded_at:new Date(),
                created_at:new Date(),
                updated_at:new Date()
            } 

            if(files && files.post_img){
                common.upload_image(files.post_img,(err,result)=>{
                    if(err){
                        res.json({status:false,message:err.message || "Something wrong."})
                    }else{
                        post.post_img=result;
                        usersModel.upload_post(post,token,(err,result)=>{
                            if(err){
                                res.json({status:false,message:err.message || "Something wrong."})
                            }else{
                                res.json({status:true,message:"Your post has been uploaded.",body:result})
                            }
                        })
                    }
                })
            }

            
        }
    }catch(error){
        res.json({status:false,message:error})
    }
}

/*******Fetching logged in user's details*****/
const get_user_profile=(req,res)=>{
    try{
        let token=req.headers['authorization'];
            let data=common.getTokenData(token)
            if(data){
                usersModel.get_user_profile(data.id,(err,result)=>{
                    if(err){
                        res.json({status:false,message:err.message});
                    }else{
                        res.json({status:true,message:"Record has been fetched!",data:result})
                    }
                })
            }
    }catch(error){

    }
}

/*******Fetching logged in user's posts*****/
const get_user_posts=(req,res)=>{
    try{
        let token=req.headers['authorization'];
        let data=common.getTokenData(token)
        if(data){
            usersModel.get_user_posts(data.id,(err,result)=>{
                if(err){
                    res.json({status:false,message:err.message});
                }else{
                    res.json({status:true,message:"Your posts have been fetched.",data:result})
                }
            })
        }
    }catch(error){
        res.json({status:false,message:error})
    }
}
/*******Fetching all posts*****/
const get_all_posts=(req,res)=>{
    try{
        usersModel.get_all_posts((err,result)=>{
            if(err){
                res.json({status:false,message:err.message});
            }else{
                res.json({status:true,message:"Posts have been fetched.",data:result})
            }
        })
    }catch(error){
        res.json({status:false,message:error})
    }
}

const delete_post=(req,res)=>{
    try{
        let params=req.body;
        if(!params.post_id){
            res.json({status:false,message:"Post id is missing."})
        }else{
            let post_id=params.post_id;
            let token=req.headers['authorization']
            let data=common.getTokenData(token)
            if(data){
                usersModel.delete_post(data.id,post_id,(err,result)=>{

                    if(err){
                        res.json({status:false,message:err.message})
                    }else{
                        res.json({status:true,message:"Post has been deleted."})
                    }
                })
            }
        }
    }catch(error){
        res.json({status:false,message:error.message})
    }
}

const createPaymentIntent=async(req,res)=>{
    try {
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types:["card"],
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/cancel',
            line_items: [
              {
                price_data:{
                    currency:'inr',
                    product_data:{
                        name:"T-shirt"
                    },
                    unit_amount:20*100,
                },
                quantity: 2
              },
            ],
            mode: 'payment',
          });
        
        console.log("sessions-->>",session);
        res.json({ success: true,message:"Session created successfully.",id:session.id});

        // Create a PaymentIntent with returnUrl
        // const paymentIntent = await stripe.paymentIntents.create({
        //   amount,
        //   currency,
        //   payment_method: paymentMethodId,
        //   confirmation_method: 'manual',
        //   confirm: true,
        //   return_url: returnUrl, // Set the return_url
        // });

        // // Handle the result of the PaymentIntent confirmation
        // if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_source_action') {
        //   // Additional action required, you may need to handle this on the client
        //   res.json({ success: true, requiresAction: true, paymentIntentClientSecret: paymentIntent.client_secret });
        // } else if (paymentIntent.status === 'succeeded') {
        //   // Payment succeeded
        //   res.json({ success: true, message: 'Payment succeeded!' });
        // } else {
        //   // Payment failed
        //   res.json({ success: false, message: 'Payment failed.' });
        // }
      } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Error confirming payment.' });
      }
      
}

module.exports={
    createUser,
    getAllUsers,
    deleteUser,
    userLogin,
    updateProfile,
    upload_post,
    get_user_profile,
    get_user_posts,
    get_all_posts,
    delete_post,
    createPaymentIntent,
}