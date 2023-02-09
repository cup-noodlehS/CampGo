const Review = require("../models/review");
const Campground = require("../models/campground");

module.exports.addReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Review added!");
  res.redirect("/campgrounds/" + req.params.id);
};

module.exports.deleteReview = async (req, res) => {
  await Campground.findByIdAndUpdate(req.params.id, {
    $pull: { reviews: req.params.reviewId },
  });
  await Review.findByIdAndDelete(req.params.reviewId);
  req.flash("success", "Deleted Review");
  res.redirect("/campgrounds/" + req.params.id);
};
