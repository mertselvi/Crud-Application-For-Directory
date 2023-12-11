const  Mongoose  = require("mongoose");

const loginSchema = new Mongoose.Schema ({
    email : {
        type : String ,
        required : true
    },
    password : {
        type : String,
        require : true
    },
    isAdmin : {
        type : Boolean
    }
})

module.exports = Mongoose.model('loginDb',loginSchema);