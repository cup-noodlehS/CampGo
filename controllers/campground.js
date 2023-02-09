const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res, next) => {
  res.cookie("myUrl", "/campgrounds");
  const campgrounds = await Campground.find({}).populate("author");
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.showCampground = async (req, res, next) => {
  res.cookie("myUrl", req.originalUrl);
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author")
    .catch(() => {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    });
  req.session.myUrl = "/campgrounds/" + req.params.id;
  res.render("campgrounds/show", { campground });
};

module.exports.createCampground = async (req, res) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const newCampground = new Campground(req.body.campground);
  newCampground.geometry = geoData.body.features[0].geometry;
  req.files.forEach((e) => {
    newCampground.images.push({
      url: e.path,
      filename: e.filename,
    });
  });
  newCampground.author = req.user._id;
  console.log(newCampground);
  await newCampground.save();
  req.flash("success", "Successfully made a new campground");
  res.redirect("/campgrounds/" + newCampground._id);
};

module.exports.renderEditForm = async (req, res, next) => {
  const campground = await Campground.findById(req.params.id).catch(() => {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  });

  res.render("campgrounds/edit", { campground });
};

module.exports.editCampground = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  req.body.campground.geometry = geoData.body.features[0].geometry;
  const campground = await Campground.findByIdAndUpdate(req.params.id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  campground.images.push(...imgs);

  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }

    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }

  await campground.save();

  req.flash("success", "Successfully updated campground!");
  res.redirect("/campgrounds/" + req.params.id);
};

module.exports.deleteCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  campground.images.forEach((img) => {
    cloudinary.uploader.destroy(img.filename);
  });
  // if (campground.reviews) {
  //   campground.reviews.forEach((e) => {
  //     Review.findByIdAndDelete(e);
  //   });
  // }
  await Campground.findByIdAndDelete(req.params.id);
  req.flash("success", "Successfully deleted campground");
  res.redirect("/campgrounds");
};
