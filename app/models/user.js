var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',

  hasTimestamps: true,

  initialize: function() {
    console.log('initializing model', this);
    bcrypt.hash(this.get('password'), null, null, function(err, hash) {
      console.log('passwordset', hash, this);
      this.set('password', hash);
      console.log('AFTER passwordset', this.get('password'), this);
      this.save();
    }.bind(this));

  },

  correctPass: function(password, cb) {
    bcrypt.compare(password, this.get('password'), cb);
  }
});

module.exports = User;
