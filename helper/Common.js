const bcrypt=require('bcrypt')
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

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

module.exports={passwordEncrypt,sendMail,getTokenData}