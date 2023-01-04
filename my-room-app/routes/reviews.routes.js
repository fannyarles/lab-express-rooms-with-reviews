const { isOwnReview } = require('../middlewares/routes.guard');
const Reviews = require('../models/Review.model');
const Rooms = require('../models/Room.model');

const router = require('express').Router();

router.get('/rooms/:roomId/review/add', (req, res, next) => {

    let userLoggedIn;
    req.session.loggedinUser ? userLoggedIn = true : userLoggedIn = false;

    const { roomId } = req.params;

    res.render('reviews/create', { userLoggedIn, roomId } );
});

router.post('/rooms/:roomId/review/add', (req, res, next) => {
    const { roomId } = req.params;
    const { comment } = req.body;
    const { userId } = req.session.loggedinUser;
    console.log(userId)

    Reviews.create({ user: userId, comment })
        .then(review => {
            Rooms.findById( roomId )
                .then(room => {
                    room.reviews.push(review._id);
                    room.save();
                })
                .catch(err => console.log(err))
        })
        .then(() => res.redirect(`/rooms/${roomId}/view`))
        .catch(err => console.log(err));
});

router.get('/rooms/:roomId/review/:reviewId/edit', isOwnReview, (req, res, next) => {

    let userLoggedIn;
    req.session.loggedinUser ? userLoggedIn = true : userLoggedIn = false;

    const { roomId, reviewId } = req.params;

    Reviews.findById( reviewId )
        .then(review => res.render('reviews/edit', { userLoggedIn, roomId, review }))
        .catch(err => console.log(err));

});

router.post('/rooms/:roomId/review/:reviewId/edit', isOwnReview, (req, res, next) => {
    const { roomId, reviewId } = req.params;
    const { comment } = req.body;

    Reviews.findById( reviewId )
        .then(review => {
            review.comment = comment;
            review.save();
        })
        .then(() => res.redirect(`/rooms/${ roomId }/view`))
        .catch(err => console.log(err));

});

router.post('/rooms/:roomId/review/:reviewId/delete', isOwnReview, (req, res, next) => {
    const { roomId, reviewId } = req.params;

    Reviews.findByIdAndDelete( reviewId )
        .then(() => {
            Rooms.findByIdAndUpdate( roomId, { $pull: { reviews: reviewId }} )
                .catch(err => console.log(err));
        })
        .then(() => res.redirect(`/rooms/${ roomId }/view`))
        .catch(err => console.log(err));
});


module.exports = router;