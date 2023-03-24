const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
require("dotenv").config();


const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true
  }));


mongoose.set('strictQuery', false);
mongoose.connect(process.env.mongoURL + "/userDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
})

const User = new mongoose.model("User", userSchema);



app.get("/", function(req, res){
    res.render("home");
})



app.get("/register", function(req, res){
    res.render("register");
})


app.post("/register", function(req, res){
    console.log(req.body);

    const { email, password } = req.body;

    const user = new User({
        email: req.body.email,
        password: req.body.password
    })

    user.save();

    req.session.user = { email };
    res.redirect("/success");
})



app.get("/login", function(req, res){
    res.render("login");
    console.log(process.version);
})



function requireAuth(req, res, next) {
    if (req.session.user) {
      // If the user is authenticated, proceed to the next middleware
      next();
    } else {
      // If the user is not authenticated, redirect to the login page
      res.redirect('/login');
    }
  }
  



app.get('/success', requireAuth, function(req, res) {

    const username = req.session.user.email.split("@")[0];
    res.render("success", { name: username });
});
  


app.post("/login", function(req, res) {

    const { email, password } = req.body;

    User.findOne({ email: email })
    .then(function(foundUser){
        if(foundUser.password === password) {

            req.session.user = { email };
            res.redirect('/success');
        }
    })
    .catch((err) => {
        console.log(err);
    });
    
})


app.get("/logout", function(req, res){
    res.redirect("/login");
})



app.listen(process.env.PORT || 3000, function(){
    console.log("server started on port 3000");
})