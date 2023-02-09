const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");
const opts = { toJSON: { virtuals: true } };

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const campGroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    price: Number,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

campGroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a href="/campgrounds/${
    this._id
  }">${this.title}</a></strong><p>${this.description.substring(0, 70)}...</p>`;
});

campGroundSchema.post("findOneAndDelete", async function (e) {
  if (e) {
    await Review.deleteMany({
      _id: {
        $in: e.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Campground", campGroundSchema);
