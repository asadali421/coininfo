const mongoose = require('mongoose');
var bcrypt = require("bcryptjs");

// User Schema
const UserSchema = mongoose.Schema({

  name:{
    type: String,
    required: true,
  },

  username:{
    type: String,
    required: true,
    unique:true
  },

  email:{
    type: String,
    required: true,
    unique:true
  },
  password:{
    type: String,
    required: true
  },

  admin:false,

  resetPasswordToken:String,

  resetPasswordExpires:Date



});

const User = module.exports = mongoose.model('User', UserSchema);
