var db = require('../models');
var jwt = require('jsonwebtoken');
var authenticate = (req,res,next)=>{
  var token = req.header('x-auth');
db.User.findByToken(token).then((user)=>{
      if(!user)
      {
        return Promise.reject();
      }
      req.userId = user._id;
      req.user=user;
      req.token=token;
    next();
  }).catch((e)=>{
    res.status(401).send({Error:"Unauthorized"});
  })
//   db.User.findOne({email:req.body.email}).then(function(user){
//       user.comparePassword(req.body.password,function(err,login){
//         if(login)
//         {
//           var token = jwt.sign({userId:user.id},"Hello world secret");
//           req.userId = user.id;
//           req.username = user.username;
//           req.token = token;
//           next();
//         }
//
//         else {
//           res.status(400).send({failed:"invalid email or password"});
//         }
//       })
// }).catch((e)=>{
//   console.log(e);
//   res.status(401).send({Error:"Unauthorized operation"});
// })
}

module.exports = {authenticate};
