const express = require('express');
require('dotenv').config();
const handlebars = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const passportMain = require('./config/passport.js');

const app = express();

const PORT = process.env.PORT;// || 3000;

// db config
const db = require('./config/keys.js').mongoUri;

mongoose.connect(db, {
  useUnifiedTopology: true,
  useNewUrlParser: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const User = require('./models/User.js');
const Post = require('./models/Post.js');

passportMain(passport);
app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', async (req, res) => {
  let activeUser = false;
  if(req.user) {
    activeUser = true;
  }
  res.render('home', {
    activeUser: activeUser,
  });
});

app.get('/all_posts', async (req, res) => {
  const posts = await Post.find({});
  res.send(posts);
});

app.get('/login', (req, res) => {
  res.render('login_register', { message: req.flash('message') });
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.post('/register', async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  let errors = [];
  if(password !== confirmPassword) {
    errors.push('Passwords do not match');
  }
  if(errors.length > 0) {
    return res.render('login_register', {
      message: errors[0],
      username,
      password,
      confirmPassword
    });
  }
  // mongoose stuff
  // async await version
  try {
    const existingUser = await User.findOne({ username: username }); // possible error
    if(existingUser) {
      errors.push('Username already in use');
      return res.render('login_register', {
        message: errors[0],
        username,
        password,
        confirmPassword
      });
    }
    const newUser = new User({
      username,
      password
    });
    const hash = await bcrypt.hash(newUser.password, saltRounds); // possible error
    newUser.password = hash;
    await newUser.save(); // possible error
    req.flash('message', 'You are now registered and can login');
    res.redirect('/login');
  } catch (err) {
    console.log(err);
    res.render('login_register', { message: 'There was an error on the server' });
  }
});

app.post('/create_post', async (req, res) => {
  const { postBody } = req.body;

  const newPost = new Post({
    author: req.user.username,
    body: postBody
  });
  try {
    await newPost.save();
    res.redirect('/');
  } catch (error) {
    console.log(err);
    res.render('home', { message: 'There was an error on the server' });
  }
});

app.get('/logout', (req, res) => {
  req.logout();
  console.log('Logged out');
  res.redirect('/');
});


app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});