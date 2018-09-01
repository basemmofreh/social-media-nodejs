var mongoose = require('mongoose');
var schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;
var bcrypt = require('bcryptjs');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var user = new schema({
  username:{
    type:String,
    required:true,
    unique:true
  },
    email:{
      type:String,
      required:true,
      unique:true
    },

    password:{
      type:String,
      required:true
    },
    profileImageUrl:{
      type:String
    },
    messages:[{
      type:ObjectId,
      ref:'Message'
    }],
    tokens:[{
      access:{
        type:String,
        require:true,
      },
      token:{
        type:String,
        required:true
      }
    }]
})
//
// overrides the return value from creating new user
user.methods.toJSON=function(){
  var self = this;
  var accObj = self.toObject();
  return _.pick(accObj,['_id','password','email','username','profileImageUrl','tokens']);
}
user.pre('save',function(next){
    var user = this;
    if(!user.isModified('password'))return next();
    else {
      bcrypt.hash(user.password,10).then(function(hashedPassword){
        user.password = hashedPassword;
        next();
      },function(err){
        return next(err);
      })
    }
})
user.methods.comparePassword = function(candidatePassword,next){
    bcrypt.compare(candidatePassword,this.password,function(err,isMatch){
        if(err){
           return next(err);
          }
      next(null,isMatch);
    });
};

user.methods.generateAuthToken = function(){
  var self = this;
  var access = 'auth';
  var token = jwt.sign({_id:self._id.toHexString(),access},'hello world');
  self.tokens.push({access,token});
  return self.save().then(()=>{
    return token;
  })

}
user.statics.findbyCrendential = function(email,password){
  var self = this;
return  self.findOne({email}).then((user)=>{
      if(!user)
        {
          return Promise.reject();
        }
      return new Promise((resolve,reject)=>{
        bcrypt.compare(password,user.password,(err,res)=>{
          if(res)
            resolve(user);
          else {
            reject()
          }
        })
      })
  })
}

user.statics.findByToken = function(token){
  var user = this;
  var decoded;
  try{
    decoded = jwt.verify(token,"hello world");
  }
  catch(e)
  {
  return Promise.reject();
  }

  return user.findOne({'_id':decoded._id,
  'tokens.token':token,
  'tokens.access':'auth'
})
}
module.exports = mongoose.model('User',user);
