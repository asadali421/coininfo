
var express = require('express');
var path = require('path');
const exphbs = require('express-handlebars');
var cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const methodoverride = require('method-override');
const upload = require('express-fileupload');


const index = require('./routes/home/index');
const admin = require('./routes/admin/admin');

var app = express();

//database connection

//mongoose.connect('mongodb://localhost:27017/coindata',{useNewUrlParser:true}).then(db=>{

mongoose.connect('mongodb://asadali421:jinlian123@ds247061.mlab.com:47061/coindata',{useNewUrlParser:true}).then(db=>{

    console.log('connected');
}).catch(err=>{

    console.log(err);
});


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(upload());


app.use(session({
    secret: 'asadali421',
    saveUninitialized: true,
    resave: true

}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next)=>{
    res.locals.user = req.user || null;

    res.locals.success_message = req.flash('success_message');
    res.locals.success = req.flash('success');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();

});

app.use(express.static(path.join(__dirname+ '/public')));
app.use(express.static(path.join(__dirname, 'public/images')));
app.use('/admin/edit',express.static(path.join(__dirname+ '/public')));
app.use('/admin/coins',express.static(path.join(__dirname+ '/public')));

app.use(methodoverride('_method'));

app.use('/',index);
app.use('/admin',admin);

app.use(cookieParser());





// view engine setup


app.engine('handlebars',exphbs({defaultLayout: 'home',
    partialsDir: path.join(__dirname, 'views/partials'),
    layoutsDir: path.join(__dirname, 'views/layouts')}));
app.set('view engine', 'handlebars');
app.set('views',path.join(__dirname,'views'));

var port = process.env.PORT || 3000;


app.listen(port,()=>{
    console.log('listening');
})





