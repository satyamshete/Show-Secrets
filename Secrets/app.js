//jshint esversion:6
require('dotenv').config()
const express = require("express")
const bodyParser = require("body-Parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
// const encrypt = require("mongoose-encryption")
// const md5 = require("md5")
// const bcrypt = require("bcrypt")
// const saltRouds = 10
const passport = require("passport")
const passportLocalMongoose = require('passport-local-mongoose')
const session = require('express-session')

const app = express()
app.use(bodyParser.urlencoded({extended:"True"}))
app.use(express.static("public"))
app.set("view engine", "ejs")
app.use(session({
    secret: "our little secret",
    resave:false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
mongoose.connect("mongodb://localhost:27017/userDB")
const userSchema = new mongoose.Schema({
    email: String,
    password: String
})
userSchema.plugin(passportLocalMongoose)

// userSchema.plugin(encrypt, {secret:process.env.SECRET, encryptedFields:['password']})
const User = new mongoose.model("User",userSchema)
// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



////routes for /
app.route("/")
    .get(function (req, res) {
        res.render("home.ejs")
    });


///routes for /login
app.route("/login")
    .get(function (req, res) {
        res.render("login")
    })

    .post(function (req,res) {
        const user = new User({
            username:req.body.username,
            password:req.body.password
        })
        req.login(user,function (err) {
            if (err) {
                console.log(err);
            } else {
                passport.authenticate("local")(req,res,function () {
                    res.redirect("/secret")
                })
            }
        })




        // const userName = req.body.username 
        // const password = md5(req.body.password)
        // becrypt
        // User.findOne({email:userName},function (err, user) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         if (user) {
        //             bcrypt.compare(req.body.password, user.password, function(err, result) {
        //                 if (err) {
        //                     console.log(err);
        //                 } else {
                            
        //                 if (result) {
        //                 res.render("secrets")
        //             } else {
        //                 res.send("Enter correct details")
        //             }
        //                 }
        //                 })
        //         } else {
        //             res.send("Please register first")
        //         }
                
        //     }
        // })
        
    })

    ////secret route
    app.get("/secret",function (req,res) {
       if (req.isAuthenticated()) {
        res.render("secrets")
       } else {
        res.redirect("/login")
       } 
    })
///routes for /register
app.route("/register")
    .get(function (req, res) {
        res.render("register")
    })
    .post(function (req,res) {
        User.register({username:req.body.username},req.body.password, function (err, user) {
            if (err) {
                console.log(err);
                res.redirect("/register")
            } else {
                passport.authenticate("local")(req,res,function () {
                    res.redirect("/secret")
                })
            }
        })





        // const userName = req.body.username 
        // const password = md5(req.body.password)
        //  // becrypt
        //bcrypt.hash(req.body.password,saltRouds,function(err,hash){
        //     const newUser = new User({
        //         email:userName,
        //         password: hash
        //     })
        //     newUser.save(function (err,result) {
        //         if (err) {
        //             console.log(err)
        //         } else {
        //             // console.log(result)
        //             res.render("secrets")
        //         }
        //     })
        // })
    })

    app.get("/logout",function (req, res) {
        req.logout(function (err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/")
            }
        });
    })



app.listen(3000,function () {
    console.log("server started on port 3000");
})