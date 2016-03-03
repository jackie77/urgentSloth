var Q = require('q');
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  fbId : String,
  token: String,
  name: String,
  picture: String,
  events: [],
  friends: [],
  accessToken: String,
  email : String
});

userSchema.methods.compareIds = function (id) {
  var savedId = this.fbId;
  return Q.Promise(function (resolve, reject) {
    if (id === savedId) {
      resolve(true);
    } else {
      reject(false);
    }
  });
};

module.exports = mongoose.model('User', userSchema);

