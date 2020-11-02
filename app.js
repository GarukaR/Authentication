//jshint esversion:6
require('dotenv').config();

const express = require('express');
const app = express();

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/secretsDB', {useNewUrlParser:true, useUnifiedTopology:true});

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine', 'ejs');
app.use(express.static('public'));

const md5 = require('md5');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
// =====================
// Creating Schema and model
const userSchema = new mongoose.Schema({
    email:String,
    password:String
});

const User = mongoose.model('User', userSchema);

// Listening to the port
app.listen(3000, function(){
    console.log('Server is running on port 3000...');
});

app.get('/', function(req, res){
    res.render('home')
});

// API FOR LOGIN ROUTE
app.route('/login')
    .get(function(req, res){
    res.render('login')
    })

    .post(function(req,res){
        username = req.body.username;
        password = req.body.password;
        User.findOne({email:username}, function(err, foundUser){
            if(!err){
                if(foundUser){
                    bcrypt.compare(password, foundUser.password, function(err, result) {
                        if (result === true){
                            res.render('secrets');
                        }else{
                            console.log("Entered password is wrong!");
                            console.log(err);
                        }
                    });
                }else{
                    res.redirect('/')
                    console.log('No Matching Users with that login email.Please Register First!');
                }
            }else{
                console.log(err);
            }
        })
    });

// API FOR REGISTER ROUTE
app.route('/register')
    .get(function(req, res){
    res.render('register')
    })

    .post(function(req, res){
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            username = req.body.username;
            password = hash;
            User.countDocuments({email:username}, function(err,NoOfUsers){
                if(NoOfUsers===0){
                    const newUser = new User({
                        email:username,
                        password:password
                    });
                    newUser.save();
                    console.log('Successfully registered the user!');
                    res.render('secrets')
                }else{
                    console.log('Registeration unsuccessfull!');
                }
            })
        });

    });

app.get('/logout', function(req, res){
    res.render('home')
})

