const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const router = require('express').Router();
const { isLoggedIn, isLoggedOut } = require('../middlewares/routes.guard');

router.get('/login', isLoggedOut, (req, res, next) => {
    res.render('auth/login', { userLoggedIn: false });
});

router.post('/login', isLoggedOut, (req, res, next) => {

    const { email, password } = req.body;

    User.findOne({ email })
        .then(user => {
            const userId = user._id;
            bcrypt.compare(password, user.password)
            .then(result => {
                if ( result ) {
                    req.session.loggedinUser = { userId };
                    res.redirect('/rooms/list');
                } else {
                    res.render('auth/login', { userLoggedIn: false, errorMessage: `Wrong password, try again.` })
                }
            })
        })
        .catch(() => res.render('auth/login', { userLoggedIn: false, errorMessage: `Wrong email, try again.` }));

});

router.get('/signup', isLoggedOut, (req, res, next) => {
    res.render('auth/signup', { userLoggedIn: false });
});

router.post('/signup', isLoggedOut, (req, res, next) => {
    
    const { email, fullName, password } = req.body;

    bcrypt.hash(password, 10)
        .then(hash => {
            User.create({
                email,
                fullName,
                password: hash
            }).catch(err => console.log(err));
        })
        .then(() => res.redirect('/auth/login'))
        .catch(() => res.render('auth/login', { userLoggedIn: false, errorMessage: `An error happened, try again.` }));

});

router.post('/logout', isLoggedIn, (req, res, next) => {
    req.session.destroy(err => {
        if (err) next(err)
        res.redirect('/');
    });
});

module.exports = router;