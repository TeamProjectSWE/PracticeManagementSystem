const axios = require('axios');

const user_auth = (req,res,next)=>{
    //const state = req.cookies['state'];
    console.log('in test');
    next();
    // axios.get(`/auth/session/${state}`)
    //     .then((response)=>{
    //         if(response.data.success !== undefined){
    //             req.auth = response.data.auth;
    //             req.user = response.data.user;
    //             next();
    //         }else{
    //             res.json({success:false});
    //         }
    //     })
}
//학생만 통과
const isStudent = (req,res,next)=>{
    console.log('check student');
    next();
    // if(req.auth.level === 1){
    //     next();
    // }
    // else{//일단 테스트 중에는 통과시키자.

    //     res.json({success:false});
    // }
}

//교수만 통과
const isProf = (req,res,next)=>{
    console.log('check professor');
    next();
    // if(req.auth.level === 2){
    //     next();
    // }
    // else{
    //    res.json({success:false});
    // }
}
/*{"success":{"user":{"code":"USER000005","name":"egoavara"},
"auth":{"code":"AUTH000003","name":"admin","level":999}}} */

/**
 * {"fail":{"causes":"","message":"not login"}}
 */
module.exports = {
    user_auth,
    isStudent,
    isProf
};