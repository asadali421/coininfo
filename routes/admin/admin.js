var express = require('express');
var router = express.Router();
var passport = require('passport');
var Ico = require('../../models/Ico');
var LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const multer = require('multer');
var fs = require('fs');
var {userAuthenticated} = require('../../helpers/authentication');
var { isEmpty } = require('../../helpers/upload-helper');
router.all('/*',userAuthenticated,(req,res,next)=>{

    req.app.locals.layout='admin';
    next();
});



/* GET home page. */
router.get('/', function(req, res) {
    res.render('admin/index');
});


// logout
router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/admin/login');
});

//view coins
router.get('/coins',(req,res)=>{
        console.log(res.locals.user)
    Ico.find({}).then(coins=>{

res.render('admin/coins',{coins:coins});
    })


})

//get add Coins page

router.get('/coins/create',(req,res)=>{

    res.render('admin/create');
})

// Add coins Submit POST Route
router.post('/coins/create',function(req, res){

            let tempArray=[];

            if(req.body.name&&Array.isArray(req.body.name)){
                req.body.name.forEach((nam,i)=>{
                    var filename = "";
console.log('asadali');
if(!isEmpty(req.files)) {
    var filess = req.files.image[i];
    filename = Date.now() + "-" + filess.name;
    filess.mv('./public/images/' + filename, err => {
        if (err) throw err;
    })
    let obj = {};
    obj['name'] = nam;
    obj['image'] = filename;
    tempArray.push(obj);
}});
            }else {
                if (!isEmpty(req.files.image)) {
                    var filename = "";

                    var filess = req.files.image;
                    filename = Date.now() + "-" + filess.name;
                    filess.mv('./public/images/' + filename, err => {
                        if (err) throw err;
                    })

                    tempArray.push({
                        name: req.body.name,
                        image: filename
                    })
                }
            }


            let roadmapArray=[];
            if(req.body.date&&Array.isArray(req.body.date)){
                req.body.date.forEach((dat,a)=>{

                    let object = {}

                    object['date'] = dat;
                    object['about'] = req.body.about[a];

                    roadmapArray.push(object);

                });
            }else{
                roadmapArray.push({
                    date:req.body.date,
                    about:req.body.about
                })
            }
               var filename1 = "";
            var files = req.files.symbolimg;

            filename1 = Date.now()+"-"+files.name;

            files.mv('./public/images/'+filename1,err=>{
                if (err) throw err;
            });


            let  ico = new Ico();
            ico.symbolimg = filename1;
            ico.title = req.body.title;
            ico.author = req.body.author;
            ico.country = req.body.country;
            ico.price = req.body.price;
            ico.about = req.body.about;
            ico.website = req.body.website;
            ico.whitepaper = req.body.whitepaper;
            ico.videourl = req.body.videourl;
            ico.roadmap = roadmapArray;
            ico.presale = req.body.presale;
            ico.icosale = req.body.icosale;
            ico.token = req.body.token;
            ico.platform = req.body.platform;
            ico.type = req.body.type;
            ico.priceinico = req.body.priceinico;
            ico.privatepresale = req.body.privatepresale;
            ico.mainsale = req.body.mainsale;
            ico.tokensforsale = req.body.tokensforsale;
            ico.mininvestement = req.body.mininvestement;
            ico.accepting = req.body.accepting;
            ico.distributedinico = req.body.distributedinico;
            ico.softcap = req.body.softcap;
            ico.hardcap = req.body.hardcap;
            ico.publicpresale = req.body.publicpresale;
            ico.team = tempArray;
            ico.category  = req.body.category;




            ico.save(function(err){
                if(err){
                    console.log(err);
                    console.log('can not store data');
                } else {

                    req.flash('success','Ico Added');
                    res.render("admin/create",{
                        success: req.flash('success')
                    });
                }
            });


});

router.get('/edit/:id',(req,res)=>{

    Ico.findOne({_id:req.params.id}).then(coin=>{

        res.render('admin/edit',{coin:coin});
    });




});



// Update Submit POST Route
router.post('/edit/:id',(req, res)=>{



    let query = {_id:req.params.id};

    Ico.findOne(query).then(Ico=>{


        if(req.files.symbolimg){
            var filename1 = "";
            var files = req.files.symbolimg;

            filename1 = Date.now()+"-"+files.name;

            files.mv('./public/images/'+filename1,err=>{
                if (err) throw err;
            });


            Ico.symbolimg = filename1;
        }

        Ico.title = req.body.title;
        Ico.author = req.body.author;
        Ico.country = req.body.country;
        Ico.price = req.body.price;
        Ico.about = req.body.about;
        Ico.videourl = req.body.videourl;
        Ico.roadmap = req.body.roadmap;
        Ico.presale = req.body.presale;
        Ico.icosale = req.body.icosale;
        Ico.token = req.body.token;
        Ico.platform = req.body.platform;
        Ico.type = req.body.type;
        Ico.priceinico = req.body.priceinico;
        Ico.privatepresale = req.body.privatepresale;
        Ico.publicpresale = req.body.publicpresale;
        Ico.mainsale = req.body.mainsale;
        Ico.tokensforsale = req.body.tokensforsale;
        Ico.mininvestement = req.body.mininvestement;
        Ico.accepting = req.body.accepting;
        Ico.distributedinico = req.body.distributedinico;
        Ico.softcap = req.body.softcap;
        Ico.hardcap = req.body.hardcap;
        Ico.teamname = req.body.teamname;
        Ico.teamimg = req.body.teamimg;

        Ico.save().then(saved=>{
            req.flash('success','Ico Updated');
            res.redirect("/admin/coins/");
        }).catch(err=>{
            console.log(err);
        })



    })

});


router.delete('/coins/:id',(req,res)=>{

    Ico.findOne({_id:req.params.id}).then(ico=>{

        fs.unlink('./public/images/'+ico.symbolimg,err=>{
            console.log(err)
        });
        if(ico.team&&Array.isArray(ico.team)){
            ico.team.forEach((nam,i)=>{
               fs.unlink('./public/images/'+ico.team[i].image,err=>{
                   console.log(err);
               })
            });
        }



    })
    Ico.remove({_id:req.params.id}).then(removed=>{
        req.flash('success','Post Deleted Successfully');
        res.redirect('/admin/coins');
    }).catch(err=>{
        console.log(err)
    })
})







module.exports = router;