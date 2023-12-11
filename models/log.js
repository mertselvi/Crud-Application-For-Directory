const mongoose = require('mongoose');

const log = new mongoose.Schema ({
    email : {
        type : String,
        require : true
    },
    operation : {
        type : String,
        require : true
    },
    descriptipon : {
        type : String,
    },
    date : {
        type : Date,
        require : true
    }
})

module.exports = mongoose.model ('log',log)