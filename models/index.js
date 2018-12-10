var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/glance',{ useNewUrlParser: true }).catch((e)=>{
  console.log("Couldnt connect to database");
})

module.exports.User = require('./user');
module.exports.Message = require('./message');
