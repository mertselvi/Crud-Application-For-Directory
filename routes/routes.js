const express = require ('express');
const router = express.Router();
const User = require('../models/users');
const loginDb = require('../models/login');
const logDb = require('../models/log');
const multer = require ('multer');
const users = require('../models/users');
const confirm = require('prompt-confirm');
const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');
const localStorage = require ('localStorage');

const logger = require('../log/log.js');
const log = require('../models/log');

//Bcrypt level
const workFactor = 8;
//image upload
var storage = multer.diskStorage({
    destination : (req,file,cb) => {
        cb(null,'./uploads');
    },
    filename : (req,file,cb) => {
        cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname);
    },
})

var upload = multer({
    storage : storage,
}).single('image');


//Welcome Page 
router.get('/',(req,res) => {
    res.render('../views/401')
    //res.render('../views/welcome')
})


//users/login 
router.get('/users/login',(req,res) => {
    res.render('login')
})

router.post('/users/login', (req,res) => {
    const email = req.body.email;
    const projection = {_id : 0, password: 1, email: 1, isAdmin : 1}

    loginDb.find({email},projection)
    .then((result) => {
        if(result === null) {
            req.session.message = {
                type : "danger",
                message : "Please enter a valid email "
            }
            res.redirect ('/users/login')
        } else if (bcrypt.compare(req.body.password, result[0].password)) {
            const user = {
                email : result[0].email
            }
            const token = jwt.sign(user,'secretKey',{expiresIn : "30m"});
            req.session.token = token;


            logger.loggerSchema.info(req.body.email + '-- LOGIN succesfully !')
            res.redirect ('/home')
        } else {
            req.session.message = {
                type : "danger",
                message : "Password and email does not match"
            }
            res.redirect ('/users/login')
        }
    })
    .catch((err)=>{
        req.session.message = {
            type : "danger",
            message : err.message
        }
        logger.loggerSchema.error(req.body.email + '-- LOGIN error :' + err.message)
        res.redirect('/users/login');
    }) 
})

router.get('/users/logout',(req,res) => {
    req.session.destroy();
    res.render('login')
})
//users/register 
router.get('/users/register', (req,res) => {
    res.render('register')
})

router.post('/users/register', (req,res) => {
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;

    loginDb.find({email})
    .then((result) => {
        if (result.length > 0) {
            req.session.message = {
                type : "danger",
                message : "This email already saved"
            }
            res.redirect('/users/register');
        } else {
            if (email == "" || password == "" || password2 == "") {
                req.session.message = {
                    type : "danger",
                    message : "Please fill the all fields"
                }
                res.redirect('/users/register')
            } else if (password !== password2) {
                req.session.message = {
                    type : "danger",
                    message : "Passwords are not match"
                }
                res.redirect('/users/register')
            } else if (password.length < 8) {
                req.session.message = {
                    type : "danger",
                    message : "Password can not less than 8 characters"
                }
                res.redirect('/users/register')
            } else if (password.search('[!@#$%^&*]') < 0) {
                req.session.message = {
                    type : "danger",
                    message : "Password has include at least one special characters"
                }
                res.redirect('/users/register')
            } else if (password.search('[A-Z]') < 0) {
                req.session.message = {
                    type : "danger",
                    message : "Password has include at least a Uppercase characters"
                }
                res.redirect('/users/register')
            } else {
                const user = new loginDb ({
                    email : req.body.email,
                    isAdmin : false
                })
                bcrypt.genSalt(workFactor)
                .then((salt)=>{
                    console.log("Salt : " + salt)
                    bcrypt.hash(req.body.password,salt)
                    .then((hash) => {
                        console.log("Hash : " + hash)
                        user.password = hash;
                        user.save()
                        .then(() => {
                            logger.loggerSchema.info(req.body.email + '-- registered succesfully !');
                            const user = {
                                email : req.body.email
                            }
                            generateToken(user);
                            req.session.message = {
                            type : "success",
                            message : "Succesfully Saved"
                            }
                            setTimeout(()=>{
                                res.redirect('/home');
                            },1000)
                        })
                    })
                    .catch((err) => {
                        req.session.message = {
                            type : "danger",
                            message : err.message
                        }
                        logger.loggerSchema.error(req.body.email + '-- Register error :' + err.message)
                        res.redirect('/users/register');
                    })  
                })
                     
                
            }
        }
    }) 
})

// Insert a user
router.post('/add',authenticate, async (req,res) => {
    console.log(req.body);
    const user = new User({
        name : req.body.name,
        email : req.body.email,
        phone : req.body.phone,
    })
    user.save()
    .then(()=> {
        req.session.message = {
            type : 'success',
            message : 'User succesfully added'
        }
        logger.loggerSchema.info(req.body.email + '-- added succesfully !');
        res.redirect('/home');
    })
    .catch((err)=> {
        logger.loggerSchema.error(req.body.email + '-- Add user error :' + err.message)
        res.json({message : err.message})
        res.redirect('/add');
    })
    
    // await user.save((err)=>{
    //     if(err){
    //         res.json({message : err.message, type : danger})
    //     } else {
    //         req.session.message = {
    //             type : "succes",
    //             message : 'User aded succesfully'
    //         };
    //         res.redirect('/');
    //     }
    // })
})

router.post('/update/:id', authenticate, (req,res) => {
    let id = req.params.id;
    // let newImage = "";
    // if(req.file){
    //     new_image = req.file.filename;
    // }
    User.findByIdAndUpdate(id, {
        name : req.body.name,
        email : req.body.email,
        phone : req.body.phone,
        image : req.body.image
    })
    .then((result) => {
        logger.loggerSchema.info(req.body.email + '-- updated succesfully !');
        req.session.message = {
            type : "success",
            message : "User updated successfully."
        }
        res.redirect('/home');
    })
    .catch ((err) => {
        logger.loggerSchema.error(req.body.email + '-- Update error :' + err.message)
        res.json ({message : err.message, type : "danger"});
        res.redirect('/users/register');
    })
})

router.get('/home',authenticate, (req,res) => {
    
    User.find()
    .then((result)=>{
        res.render ('index', {title : "Home Page", users: result})
    }) 
    .catch((err) => {
        res.json ({message : err.message})
    })
})

router.get('/edit/:id',authenticate, (req,res)=>{
    let id = req.params.id;
    User.findById(id)
    .then((result) => {
        if (result == null) {
            res.redirect("/");
        } else {
            res.render ('edit_user', {title : 'Edit Users',user:result})
        }
    })
    .catch ((err) => {
        res.redirect("/")
    })
    
})

router.get('/delete/:id', authenticate, async (req,res)=>{
        let id = req.params.id;
        User.findByIdAndDelete(id)
        .then(()=>{
            logger.loggerSchema.info(req.body.email + '-- deleted succesfully !');
            req.session.message = {
                type : "success",
                message : "User succesfully deleted"
            }
            res.redirect('/');
        })
        .catch ((err) => {
            req.session.message = {
                type : "danger",
                message : "Failed while deleting process."
            }
            logger.loggerSchema.error(req.body.email + '-- Delete error :' + err.message);
            res.redirect ('/home');
        })
    // } else {
    //     req.session.message = {
    //         type : "success",
    //         message : "Canceled to delete"
    //     }
    //     res.redirect('/')
    // }
})
router.get ('/add',authenticate, (req,res) => {
    res.render ('add_user', {title : 'Add Users'})
})



    
    // jwt.verify (token,'secretKey')
    // .then((result) => {
    //     console.log(result);
    //     return result;
    // })
    // .catch ((err) => {
    //     return err.message
    // } )

    // return new Promise(function(resolve, reject) {
    //     jwt.verify(token, secret, function (err, vt) {
    //       if (err) {
    //         // decide what to do with the error...
    //         reject(false);
    //       }      
    //       else {
    //         resolve(true);       
    //       }
    //     })
    //   })
    

async function authenticate (req,res,next) {
    if (req.session.token) { 
        token = req.session.token;

        if (token == null) {
            res.render('401')
        }
    
        try {
            jwt.verify(token, 'secretKey',(err,AuthData) => {
                if(!AuthData) {
                    return res.status(401).render('401');
                }
                req.email = AuthData.email;
                next();
            })
        } catch (error) {
            console.error('Token verification failed:', error.message);
        } 
        
    } else {
        res.render('login')
    }
    
    
}



// Instead of this, ı prefer the use winston package for logging.
//
//
// function logger (req,res,next) {
//     const log = new logDb ({
//         email : req.body.email,
//         date : Date.now(), 
//     })
//     if (req.url == "/users/login") {
//         log.operation = "LOGIN";
//     } else if (req.url == "/users/register") {
//         log.operation = "REGISTER";
//     } else if (req.url == "/add") { 
//         log.email = ""
//         log.operation = "ADD";
//         log.descriptipon = req.body.name + "User added";
//     }
//     log.save()
//     next();
// }
module.exports = router;