var request = require('request');
var db = require('../app/config');
var Users = require('../app/collections/users');
var User = require('../app/models/user');
var Links = require('../app/collections/links');
var Link = require('../app/models/link');
var Click = require('../app/models/click');

exports.getUrlTitle = function(url, cb) {
  request(url, function(err, res, html) {
    if (err) {
      console.log('Error reading url heading: ', err);
      return cb(err);
    } else {
      var tag = /<title>(.*)<\/title>/;
      var match = html.match(tag);
      var title = match ? match[1] : url;
      return cb(err, title);
    }
  });
};

var rValidUrl = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;

exports.isValidUrl = function(url) {
  console.log('does get here');
  return url.match(rValidUrl);
};

/************************************************************/
// Add additional utility functions below
/************************************************************/

exports.checkUser = function(req, res, next) {
  if (req.session.user) {
    console.log('user is validated', req.session.user);
    next();
  } else {
    req.session.error = 'Access denied';
    res.redirect('/login');
  }
};

exports.login = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  new User({username: username})
    .fetch().then(function(found) {
      if (found) {
        found.correctPass(password, function(err, results) {
          if (results) {
            req.session.regenerate(function() {
              req.session.user = username;
              res.redirect('/');
            });
          } else {
            res.redirect('/login?loginCase=badPass');
          }
        });
      } else {
        res.redirect('/login?loginCase=noUser');
      }
    });
};

exports.signUpUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  db.knex('users').where({username: username}).then(function(resp) {
    if (resp.length > 0) {
      res.redirect('/signup?taken=true');
    } else {
      var user = new User({
        username: username,
        password: password
      });
      res.redirect('/login');
    }
  });
};

exports.logOutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/');
  });
};

exports.getLinksList = function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
};

exports.createShortLink = function(req, res) {
  var uri = req.body.url;

  if (!exports.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      this.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  }.bind(exports));
};

exports.handleWildcard = function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
};

