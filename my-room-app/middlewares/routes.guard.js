const Reviews = require("../models/Review.model");
const Rooms = require("../models/Room.model");

const isLoggedIn = (req, res, next) => {
    req.session.loggedinUser ? next() : res.redirect('/rooms/list');
};

const isLoggedOut = (req, res, next) => {
    !req.session.loggedinUser ? next() : res.redirect('/rooms/list');
};

const isOwnRoom = (req, res, next) => {

    if ( req.session.loggedinUser ) {
        const { roomId } = req.params;
        const { userId } = req.session.loggedinUser;
    
        Rooms.findById( roomId )
            .then(room => room.owner.equals(userId) ? next() : res.redirect(`/rooms/list`));
            
        const isOwner = true;
        return isOwner;
    } else {
        res.redirect(`/rooms/list`);
    }

};

const isOwnReview = (req, res, next) => {

    if ( req.session.loggedinUser ) {
        const { reviewId } = req.params;
        const { userId } = req.session.loggedinUser;
    
        Reviews.findById( reviewId )
            .then(review => review.user.equals(userId) ? next() : res.redirect(`/rooms/list`));
    } else {
        res.redirect(`/rooms/list`);
    }

};

module.exports = { isLoggedIn, isLoggedOut, isOwnRoom, isOwnReview };