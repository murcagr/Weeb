const path = require('path');
var passport = require('passport');
var User = require('./models/user');

module.exports = function(app) {

// Register User
app.post('/register', function(req, res){
  var password = req.body.password;
  var password2 = req.body.password2;

  if (password == password2){
    var newUser = new User({
      username: req.body.username,
      password: req.body.password
    });
    User.createUser(newUser, function(err, user){
      if(err) throw err;
      res.redirect("http://localhost:3000/")
    });
  } 
  else{    
    res.status(500).send("{errors: \"Passwords don't match\"}").end()
  }
});

app.get('/home', checkAuthentication, function(req, res){
  res.sendFile(__dirname + '/index.html');
});

function checkAuthentication(req,res,next){
  if(req.isAuthenticated()){
      next();
  } else{
      res.redirect("/");
  }
}

var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err, user){
      if(err) throw err;
      
      if(!user){        
        return done(null, false, {message: 'Unknown User'});
      }      
      User.comparePassword(password, user.password, function(err, isMatch)
      {
        if(err) throw err;
        if(isMatch)
        {
          return done(null, user);
        } 
        else 
        {
     	    return done(null, false, {message: 'Invalid password'});
     	  }
     });
   });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

// Endpoint to login
app.post('/login',  passport.authenticate('local'),  
function(req, res) {
    console.log('Произошёл логин')
    res.redirect("http://localhost:3000/home");
  }
);

// Endpoint to get current user
app.get('/user', function(req, res){
  res.send(req.user.username);
});

// Endpoint to logout
app.post('/logout', function(req, res){
  req.logout();
  res.redirect("http://localhost:3000/login")
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/login_form.html')
});

app.get('/register', function(req, res){
  res.sendFile(__dirname + '/signup_form.html')
});

}