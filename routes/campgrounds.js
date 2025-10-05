const express = require('express');
const router = express.Router({mergeParams: true});
const mongoose = require('mongoose');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { campgroundSchema } = require('../utils/Schema');
const Campground = require('../modules/campgrounds');
const { isLoggedIn, isAuthor } = require('../middleware');

router.get('/', async (req, res) => {
  try {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
  } catch (err) {
    console.error('Error fetching campgrounds:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

function validateCampground(req, res, next) {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(', ');
    return next(new ExpressError(msg, 400));
  }
  next();
}

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
  const { title, image, location, price, description, author } = req.body;
  const newCampground = new Campground({ title, image, location, price, description, author: req.user._id });
  await newCampground.save();
  req.flash('success', 'Successfully created campground!');
  res.redirect('/campgrounds/' + newCampground._id);
}));

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Page Not Found!');
      return next(new ExpressError('Page Not Found', 404));
    }
    const campground = await Campground.findById(id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('author');
    if (!campground) {
      req.flash('error', 'Campground not found!');
      return next(new ExpressError('Campground not found', 404));
    }
    res.render('campgrounds/show', { campground });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/edit', isLoggedIn, isAuthor ,async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Page Not Found!');
      return next(new ExpressError('Page Not Found', 404));
    }
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash('error', 'Campground not found!');
      return next(new ExpressError('Campground not found', 404));
    }
    res.render('campgrounds/edit', { campground });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', isLoggedIn, isAuthor, validateCampground, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Page Not Found!');
      return next(new ExpressError('Page Not Found', 404));
    }
    const { title, image, location, price, description } = req.body;
    const campground = await Campground.findByIdAndUpdate(id, { title, image, location, price, description }, { new: true });
    if (!campground) {
      req.flash('error', 'Campground not found!');
      return next(new ExpressError('Campground not found', 404));
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect('/campgrounds/' + campground._id);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', isLoggedIn, isAuthor, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Page Not Found!');
      return next(new ExpressError('Page Not Found', 404));
    }
    const campground = await Campground.findByIdAndDelete(id);
    if (!campground) {
      req.flash('error', 'Campground not found!');
      return next(new ExpressError('Campground not found', 404));
    }
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
  } catch (err) {
    next(err);
  }
});

module.exports = router;