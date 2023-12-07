const bcrypt=require('bcrypt')
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


const fs = require('fs');
const AWS = require('aws-sdk');

// Configure AWS credentials
AWS.config.update({
  accessKeyId: 'AKIAQN6QN5FKDLFL2AOZ',
  secretAccessKey: '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',
  region: 'us-east-2',
});


/***Password encrypt***/
const passwordEncrypt=async(password)=>{
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt)
    return hash
}

/***Send Mail****/
const sendMail=async(to,subject,message)=>{
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'socialapp',
            pass: 'yhnduamtohvpqxlt'
        }
    });
    const mailOptions = {
        from: 'love.kush.it.fullstack@gmail.com',
        to: to,
        subject: subject,
        // text: message,
        html:message
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent:'+ info.response);
        }
    });
}

const getTokenData=(token)=>{
    const TOKEN_KEY = process.env.TOKEN_KEY;
    let getToken=token.split(' ')
    var decoded = jwt.verify(getToken[1], TOKEN_KEY);
    if(decoded)
    {
        return decoded;
    }else{
        return "Incorrect token";
    }
}

const upload_post=async(file)=>{
    try{
        if(file){
            // Create an S3 service object
            const s3 = new AWS.S3();

            // Specify the bucket name and file path
            const bucketName = 'weclea-bucket';

            // Set up the parameters for the S3 upload
            const params = {
                Bucket: bucketName,
                Key:Date.now()+"_"+"profile_pic"+"_"+file.name,
                Body: file.data,
                ACL: 'public-read', // Set access control level
            };

            await s3.upload(params, (err, data) => {
                if (err) {
                  console.error(err);
                  return false;
                }
                console.log('File uploaded successfully. URL:', data.Location);
                return data.Location;
            });

        }
    }catch(error){
        return false;
    }
}

module.exports={
    passwordEncrypt,
    sendMail,
    getTokenData,
    upload_post,
}