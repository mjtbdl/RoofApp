const express = require('express');
const router = express.Router({mergeParams: true});

const Campground = require('../modules/campgrounds');
const Review = require('../modules/review');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn , validateReview, isReviewAuthor } = require('../middleware'); 



router.post('/', validateReview, isLoggedIn, catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { body, rating} = req.body;
  const review = new Review({ body, rating });
  review.author = req.user._id;
  const campground = await Campground.findById(id);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash('success', 'Successfully added a new review!');
  res.redirect('/campgrounds/' + id);
}));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res, next) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Successfully deleted review!');
  res.redirect('/campgrounds/' + id);
}));

module.exports = router;