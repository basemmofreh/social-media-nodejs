var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/warbler',{ useNewUrlParser: true }).catch((e)=>{
  console.log("Couldnt connect to database");
})

module.exports.User = require('./user');
module.exports.Message = require('./message');
