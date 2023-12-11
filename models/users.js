const mongoose = require ('mongoose');

const userSchema = new mongoose.Schema ({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    phone : {
        type :String,
        reqired : true
    },
    image : {
        type :String,
        reqired : true
    },
    create : {
        type : Date,
        default : Date.now
    }
})
module.exports = mongoose.model ('User',userSchema);
