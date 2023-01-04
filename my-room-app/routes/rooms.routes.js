const Room = require('../models/Room.model');
const fileUploader = require('../config/cloudinary.config');
const User = require('../models/User.model');
const { isLoggedIn, isOwnRoom } = require('../middlewares/routes.guard');
const router = require('express').Router();

router.get('/list', (req, res, next) => {

    let userLoggedIn;
    req.session.loggedinUser ? userLoggedIn = true : userLoggedIn = false;

    Room.find()
        .populate( 'owner' )
        .then(rooms => rooms.length === 0 ? res.render('rooms/list', { noRoomsMessage: `No rooms created yet.` }) : res.render('rooms/list', { userLoggedIn, rooms }))
        .catch(err => console.log(err));

});

router.get('/:roomId/view', (req, res, next) => {

    let userLoggedIn;
    req.session.loggedinUser ? userLoggedIn = req.session.loggedinUser.userId : userLoggedIn = false;

    const { roomId } = req.params;

    Room.findById( roomId )
        .populate('owner')
        .populate({
            path: 'reviews',
            populate: { path: 'user' }
        }) 
        .then(room => {
            const reviewsCount = room.reviews.length;
            let isRoomOwner;
            if ( userLoggedIn ) { isRoomOwner = room.owner._id.equals(req.session.loggedinUser.userId); } else { isRoomOwner = false; }
            res.render('rooms/single', { userLoggedIn, isRoomOwner, room, reviewsCount })
        })
        .catch(err => console.log(err));
});

router.get('/create', isLoggedIn, (req, res, next) => {

    let userLoggedIn;
    req.session.loggedinUser ? userLoggedIn = true : userLoggedIn = false;
    
    res.render('rooms/create', { userLoggedIn });
});

router.post('/create', isLoggedIn, fileUploader.single('roomImg'), (req, res, next) => {
    const { name, desc } = req.body;
    const { userId } = req.session.loggedinUser;
    let filePath;
    req.file ? filePath = req.file.path : filePath = '';

    Room.create({
            name, 
            description: desc,
            imageUrl: filePath,
            owner: userId,
            reviews: []
        })
        .then(() => res.redirect('/rooms/list'))
        .catch(err => console.log(error))

});

router.get('/:roomId/edit', isOwnRoom, (req, res, next) => {

    let userLoggedIn;
    req.session.loggedinUser ? userLoggedIn = true : userLoggedIn = false;

    const { roomId } = req.params;

    Room.findById( roomId )
        .then(room => res.render('rooms/edit', { userLoggedIn, room } ))
        .catch(err => console.log(err))
});

router.post('/:roomId/edit', isOwnRoom, fileUploader.single('roomImg'), (req, res, next) => {

    const { roomId } = req.params;
    const { name, desc } = req.body;

    Room.findById( roomId )
        .then(room => {
            let filePath;
            req.file ? filePath = req.file.path : filePath = room.imageUrl;
            room.name = name;
            room.description = desc;
            room.imageUrl = filePath;
            room.save();
        })
        .then(() => res.redirect('/rooms/list'))
        .catch(err => console.log(err))

});

router.post('/:roomId/delete', isOwnRoom, (req, res, next) => {
    const { roomId } = req.params;
    Room.findByIdAndDelete( roomId )
        .then(() => res.redirect('/rooms/list'))
        .catch(err => console.log(err));
});


module.exports = router;