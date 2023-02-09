const ExpressError = require("./utils/ExpressError");
const { reviewSchema, campgroundSchema } = require("./schemas");
const Review = require("./models/review");
const Campground = require("./models/campground");
const User = require("./models/user");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.cookie("myUrl", req.originalUrl);

    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission");
    return res.redirect("/campgrounds/" + req.params.id);
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission");
    return res.redirect("/campgrounds/" + req.params.id);
  }
  next();
};

module.exports.validateCampground = (req, res, next) => {
  const data = req.body;

  const { error } = campgroundSchema.validate(data);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
