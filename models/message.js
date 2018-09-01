var mongoose = require('mongoose');
var schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;
var User = require('./user');

var message = new schema ({
  text:{
    type:String,
    required:true,
    maxLength:160
  },
  userId:{
    type:ObjectId,
    ref:"User"
  }
},{timestamps:true
});

module.exports = mongoose.model('Message',message);
