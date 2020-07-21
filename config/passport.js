const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const User = require('../models/User.js');

const passportMain = passport => {

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use(new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if(err) {
        return done(err);
      }
      if(!user) {
        return done(null, false, { message: 'Incorrect Username or Password' });
      }
      bcrypt.compare(password, user.password, (err, matches) => {
        if(err) {
          return done(err);
        }
        if(!matches) {
          return done(null, false, { message: 'Incorrect Username or Password' });
        }
        console.log('Logged in');
        return done(null, user);
      });
    });
  }))
};

module.exports = passportMain;