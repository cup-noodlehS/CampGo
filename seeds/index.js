const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

mongoose
  .connect("mongodb://localhost:27017/yelp-camp")
  .then(() => {
    console.log("mongo connection open!");
  })
  .catch((e) => {
    console.log("mongo error");
    console.log(e);
  });

function sample(array) {
  return array[Math.floor(Math.random() * array.length)];
}

const seedDb = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 200; i++) {
    const price = Math.floor(Math.random() * 20) + 10;
    const random1000 = Math.floor(Math.random() * 1000);
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://res.cloudinary.com/dhpihshcf/image/upload/v1675414134/YelpCamp/MapleSpringsCampground-Campsite_pk8rap.jpg",
          filename: "YelpCamp/MapleSpringsCampground-Campsite_pk8rap",
        },
        {
          url: "https://res.cloudinary.com/dhpihshcf/image/upload/v1675414134/YelpCamp/8B997043-B6A3-AC77-4E786F5CFA1043B1_q8b9zt.jpg",
          filename: "YelpCamp/8B997043-B6A3-AC77-4E786F5CFA1043B1_q8b9zt",
        },
      ],
      description:
        "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sit, deserunt natus. Similique nemo dolorum aspernatur natus. Id cum error similique, nisi quia officia quibusdam sequi enim, voluptas eaque accusamus. Similique!",
      price: price,
      author: "63d62def1fb80798da5c23e7",
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
    });
    await camp.save();
  }
};
seedDb().then(() => {
  mongoose.connection.close();
});
