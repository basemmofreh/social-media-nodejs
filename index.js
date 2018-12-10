var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const http = require('http');
var app = express();
var socketIO = require('socket.io');
var server = http.createServer(app);
var cors = require('cors');
var bodyParser = require('body-parser');
var db = require('./models');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var {authenticate} = require('./middleware/authenticate');
var _ = require('lodash');


//exposing x-auth for react must be done via corsOptions
const corsOptions = {
  exposedHeaders: 'x-auth'
};
var io = socketIO(server);

const port = process.env.PORT || 8081;
//middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
//don't tell anyone about this secret please :D
app.use(session({secret: "Shh, its a secret!"}));
// io.on('connection',(socket)=>{
//   console.log('user is connected');
// });

//return all msgs
app.get('/api/all',authenticate,async(req,res)=>{
    // if(!req.session.page_view){
    req.session.page_view=1;
    try{
      let msgs = await db.Message.find({})
      .populate({path:'userId',model:'User',select:['profileImageUrl','username']})
      .populate({path:'likes',model:'User',select:["username","_id"]})
      .exec();
const mappedArray = _.map( msgs.likes, 'el' )
      console.log(mappedArray);
      // tempData= msgs;
      res.status(200).send(msgs)
    }catch(e){
      res.status(404).send(e);
    }
      //   }
      // else {
      //       req.session.page_view++;
      //       res.redirect('/');
      //   }
    });
//session handling
app.get('/', function(req, res){
  if(req.session.page_view)
    {
      res.status(203).send(req.session);
    }
  else{
    res.status(401).send("Unauthorized please login first");
  }
});
//=========
//signUp
//========
app.post('/api/auth/signup',function(req,res){
    var acc = new db.User({email:req.body.email,username:req.body.user,password:req.body.password,profileImageUrl:req.body.profileImageUrl});
    acc.save().then((user)=>{
    return user.generateAuthToken();
  }).then((token)=>{
        res.header('x-auth',token).send(acc);
  }).catch((err)=>{
        res.status(400).send(err);
      })
})

app.post('/api/auth/msg/like',authenticate,async(req,res)=>{
  var msgId = req.body.msgId;
  try{
  var updateMsgLikes = await db.Message.findOneAndUpdate({_id:msgId},{$addToSet:{likes:req.userId}},{new:true});
  let lovedBy = await db.Message.findOne({_id:msgId}).populate({path:'likes',model:'User',select:['username']}).exec();
  console.log(lovedBy.likes[0].username);
  res.status(200).send(lovedBy);
  }catch(e){
    console.log(e)
  res.status(400).send(e);
}

})
//signin
app.post('/api/auth/signin',async(req,res)=>{
  try{
      var body = _.pick(req.body,['email','password']);
      let user = await db.User.findbyCrendential(body.email,body.password);
      let token = await user.generateAuthToken();
      res.header('x-auth',token).send(user);
  }catch(e){
    console.log(e);
      res.status(400).send(e);
  }
})
//add new message
app.post('/api/add/message',authenticate,async(req,res)=>{
  try{
    var msg = await new db.Message({text:req.body.text,userId:req.userId});
    var newMsg = await msg.save();
    var updateMsg = await db.User.findOneAndUpdate({username:req.username},{$push:{messages:newMsg._id}},{new:true});
    io.emit('newMessage');
    res.status(200).send(msg);
  }catch(e){
    console.log(e);
    res.status(400).send(e);
  }
})
app.delete('/api/remove/message',async(req,res)=>{
  try{
    var msg = await db.Message.findOneAndDelete({_id:req.body.msgId});
    res.status(200).send(msg);
  }catch(e){
    console.log(e);
    res.status(400).send(e);
  }
})
//get
// //app.get('/api/all',authenticate,function(req,res){
//   db.Message.find({}).populate({path:'userId',model:'User',select:'username'}).exec(function(err,msgs){
//
//     if(msgs)
//     // res.redirect('/');
//       res.status(200).send(msgs);
//     else {
//       res.status(404).send({Error:'not authorized'});
//     }
//     })
//   });

app.delete('/api/auth/logout',authenticate,async(req,res)=>{
  try{
    await   req.user.removeToken(req.token);
    res.status(200).send("logged out succussfuly");
  }catch(e){
      res.status(400).send("unable to logout");
  }
})
server.listen(port,function(){
    console.log(`Server is listening on port ${port}`);
})

module.exports.app= app;
