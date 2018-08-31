var express = require('express');
var router = express.Router();
var passport = require('passport');
var Ico = require('../../models/Ico');
var LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

router.all('/*',(req,res,next)=>{

    req.app.locals.layout='home';
    next();
});

/* GET home page. */
router.get('/', function(req, res) {
  res.send("asad");
});


// Register Form
router.get('/register', function(req, res){
    res.render('home/register');
});


// Register Proccess
router.post('/register', function(req, res){

    var errors = [];
    if (!req.body.name) {

        errors.push({
            messages: 'Name is required'
        });
    }
    if (!req.body.email) {
        errors.push({messages: 'Email is required'})
    }

    if (!req.body.username) {
        errors.push({messages: 'User Name is required'})
    }
    if (!req.body.password) {
        errors.push({messages: 'Password is required'})
    }
    if (req.body.password != req.body.password2) {
        errors.push({messages: 'Password Mismatch'})
    }
    if (errors.length > 0) {

        res.render('home/register', {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            username: req.body.username
        });
    }
    else {

        User.findOne({email: req.body.email}).then(user=>{

            if(!user)
            {
                User.findOne({username:req.body.username}).then(users=>{

                    if(!users)
                    {
                        var newUser = User({
                            name: req.body.name,
                            username: req.body.username,
                            email: req.body.email,
                            password: req.body.password

                        });
                        bcrypt.genSalt(10, (err, salt) => {

                            bcrypt.hash(newUser.password, salt, (err, hash) => {
                                newUser.password = hash;
                                newUser.save().then(
                                    saved => {
                                        req.flash('success_message', 'User registered successfuly');
                                        res.redirect('/login');
                                    }
                                ).catch()
                            });

                        })
                    }
                    else{

                        req.flash('error_message','UserName Already Exists');
                        res.render('home/register',{
                            name: req.body.name,
                            email: req.body.email,
                            username: req.body.username,
                            error_message:req.flash('error_message')
                        });
                    }
                })


            }
            else{

                req.flash('error_message','Email Already Exists');
                res.render('home/register',{
                    name: req.body.name,
                    email: req.body.email,
                    username: req.body.username,
                    error_message: req.flash('error_message')
                });
            }
        }).catch(err=>{
            console.log(err);
        })


    }
});


/* GET home page. */
router.get('/login', function(req, res) {

    console.log('asad');
    res.render('home/login');
});


// Local Strategy
passport.use(new LocalStrategy(function(username, password, done){
    // Match Username
    let query = {username:username};
    User.findOne(query, function(err, user){
        if(err) throw err;
        if(!user){
            return done(null, false, {message: 'No user found'});
        }

        // Match Password
        bcrypt.compare(password, user.password, function(err, isMatch){
            if(err) throw err;
            if(isMatch){
                return done(null, user);
            } else {
                return done(null, false, {message: 'Wrong password'});
            }
        });
    });
}));
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


// Login Process
router.post('/login', function(req, res, next){

    passport.authenticate('local', {
        successRedirect:'/admin',
        failureRedirect:'/login',
        failureFlash: true
    })(req, res, next);
});

// forgot password
router.get('/forgot', function(req, res) {
    res.render('home/forgot');
});


router.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Hotmail',
                auth: {
                    user: 'asadali_88f@hotmail.com',
                    pass: 'jinlian123'
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'coininfo.io',
                subject: 'Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});


router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('home/reset', {token: req.params.token});
    });
});


router.post('/reset/:token', function(req, res) {
    async.waterfall([
        function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if(req.body.password === req.body.confirm) {

                    user.password = "";
                    bcrypt.genSalt(10, (err, salt) => {

                        bcrypt.hash(req.body.password, salt, (err, hash) => {
                            req.body.password = hash;

                            user.update({password:req.body.password, resetPasswordToken:undefined, resetPasswordExpires:undefined}, (err,doc)=>{

                        user.save(function(err) {
                            req.logIn(user, function(err) {
                                done(err, user);
                            });
                        });
                    } )
                        });

                    })

                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Hotmail',
                auth: {
                    user: 'asadali_88f@hotmail.com',
                    pass: 'jinlian123'
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'coininfo.io',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function(err) {
        res.redirect('/login');
    });
});






router.get('/coin',  (req,res)=>{

    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');



        Ico.findOne({title:regex}, function(err, doc) {
            if(!doc){
                res.render('home/coin',{coin:"NO COIN FOUND"});
            }else{



                Ico.aggregate([
                    {$match: {}}, // filter the results
                    {$sample: {size: 3}} // You want to get 3 docs
                ]).then((docs)=>{
                    docs.forEach((nam)=>{

                        var n = nam.title
                        return n;
                    });
                });

                res.render("home/coin",{
                    ni:req.body.n,
                    symbol:doc.symbolimg,
                    symbolimg:doc.symbolimg,
                    title:doc.title,
                    author:doc.author,
                    country:doc.country,
                    website:doc.website,
                    whitepaper:doc.whitepaper,
                    price:doc.price,
                    about:doc.about,
                    team:doc.team,
                    videourl:doc.videourl,
                    roadmap:doc.roadmap,
                    presale:doc.presale,
                    icosale:doc.icosale,
                    token:doc.token,
                    platform:doc.platform,
                    type:doc.type,
                    priceinico:doc.priceinico,
                    privatepresale:doc.privatepresale,
                    mainsale:doc.mainsale,
                    tokensforsale:doc.tokensforsale,
                    mininvestement:doc.mininvestement,
                    accepting:doc.accepting,
                    distributedinico:doc.distributedinico,
                    softcap:doc.softcap,
                    hardcap:doc.hardcap,
                    publicpresale:doc.publicpresale,
                });





            }
        });
    }else{
        res.redirect('login');
    }


});

router.get('/listing',(req,res)=>{

    Ico.find({}).then(coins=>{

        if(!coins){
        req.flash('error','No Coin Found');
            res.render('home/listing',{error:req.flash('error')});
        }
        else{

        Ico.count({category:'pre'}).then(pre=>{

            Ico.count({category:'active'}).then(active=>{

                Ico.count({category:'upcoming'}).then(upcoming=>{

                    Ico.count({category:'top'}).then(top=>{

                        Ico.count({category:'past'}).then(past=>{

                            Ico.count({category:'airdrops'}).then(airdrops=>{

                                Ico.count({category:'topcrypto'}).then(topcypto=>{

                                    res.render('home/listing',{coins:coins,pre:pre,active:active,upcoming:upcoming,top:top,past:past,airdrops:airdrops,topcrypto:topcypto});

                                })


                            })

                        })

                    })

                })

            })


        })
        }



    })



});

router.get('/listing/:category',(req,res)=>{

Ico.findOne({category:req.params.category}).then(coins=>{
    if(!coins){
        req.flash('error','No Coin Found');

        Ico.count({category:'pre'}).then(pre=>{

            Ico.count({category:'active'}).then(active=>{

                Ico.count({category:'upcoming'}).then(upcoming=>{

                    Ico.count({category:'top'}).then(top=>{

                        Ico.count({category:'past'}).then(past=>{

                            Ico.count({category:'airdrops'}).then(airdrops=>{

                                Ico.count({category:'topcrypto'}).then(topcypto=>{

                                    res.render('home/listing',{error:req.flash('error'),coins:coins,pre:pre,active:active,upcoming:upcoming,top:top,past:past,airdrops:airdrops,topcrypto:topcypto});

                                })


                            })

                        })

                    })

                })

            })


        })

    }
    else{

        Ico.count({category:'pre'}).then(pre=>{

            Ico.count({category:'active'}).then(active=>{

                Ico.count({category:'upcoming'}).then(upcoming=>{

                    Ico.count({category:'top'}).then(top=>{

                        Ico.count({category:'past'}).then(past=>{

                            Ico.count({category:'airdrops'}).then(airdrops=>{

                                Ico.count({category:'topcrypto'}).then(topcypto=>{
                        console.log(coins);
                                    res.render('home/listing',{coins:coins,pre:pre,active:active,upcoming:upcoming,top:top,past:past,airdrops:airdrops,topcrypto:topcypto});

                                })


                            })

                        })

                    })

                })

            })


        })
    };
})

    }
)

router.get('/advertisment',(req,res)=>{

    res.render('home/advertisment');

})




function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/i, "\\$&");
};



module.exports = router;
