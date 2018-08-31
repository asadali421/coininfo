let mongoose = require('mongoose');

// Article Schema
let IcoSchema = mongoose.Schema({

  title:{
    unique:true,
    type: String,
  },

  author:{
    unique:true,
    type: String,
  },

website:{
  type:String,
  required:true
},

whitepaper:{
  type:String,
  required:true
},

  country:{
    type: String,
  },


  price:{
    type: String,
  },


  about:{
    type: String,
  },


  team:[
  {
    name:{
      type:String
    },
    image:{
      type:String
    }
  }
  ],


  videourl:{
    type: String,
  },

    category:{
        type: String,
    },


  roadmap:[
      {
date:{type:String,
      },
about:{type:String,
      }
      }
  ],


  presale:{
    type:String
  },


  icosale:{
    type: String,
  },


  token:{
    type: String,
  },


  platform:{
    type: String,
  },


  type:{
    type: String,
  },


  priceinico:{
    type: String,
  },


  privatepresale:{
    type: String,
    required: true
  },


  publicpresale:{
    type: String,
  },


  mainsale:{
    type: String,
  },


  tokensforsale:{
    type: String,
  },


  mininvestement:{
    type: String,
  },


  accepting:{
    type: String,
  },


  distributedinico:{
    type: String,
  },


  softcap:{
    type: String,
  },


  hardcap:{
    type: String,
  },

  symbolimg:{
    type:String,

  }

});




let Ico = module.exports = mongoose.model('Ico', IcoSchema);
