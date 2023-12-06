const bcrypt=require('bcrypt')

/***Password encrypt***/
const passwordEncrypt=async(password)=>{
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt)
    return hash
}

module.exports={passwordEncrypt}