const axios = require('axios');

/*{"success":{"user":{"code":"USER000005","name":"egoavara"},
"auth":{"code":"AUTH000003","name":"admin","level":999}}} */

const user_auth = (req,res,next)=>{
    const state = req.cookies['state'];
    axios.get(`/auth/session/${state}`)
        .then((response)=>{
            if(response.data.success !== undefined){
                req.auth = response.data.auth;
                req.user = response.data.user;
                next();
            }else{
                res.json({success:false});
            }
        })
}
//학생만 통과
const isStudent = (req,res,next)=>{
    if(req.auth.level === 1){
        next();
    }
    else{

        res.json({success:false});
    }
}

//교수만 통과
const isProf = (req,res,next)=>{
    if(req.auth.level === 2){
        next();
    }
    else{
       res.json({success:false});
    }
}


/**
 * {"fail":{"causes":"","message":"not login"}}
 */
module.exports = {
    user_auth,
    isStudent,
    isProf
};