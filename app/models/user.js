var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var Link = require('./link.js');
var Click = require('./click.js');

var User = db.Model.extend({
  tableName: 'users',

  hasTimestamps: true,

  initialize: function() {
    if (this.get('password') !== '') {
      bcrypt.hash(this.get('password'), null, null, function(err, hash) {
        this.set('password', hash);
        this.save();
      }.bind(this));
    }

  },

  link: function() {
    return this.hasMany(Link);
  },

  click: function() {
    return this.hasMany(Click);
  },

  correctPass: function(password, cb) {
    bcrypt.compare(password, this.get('password'), cb);
  }
});

module.exports = User;
