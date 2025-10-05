const mongoose = require('mongoose');
const locations = require('./location');
const {places, descriptors} = require('./description');
const Campground = require('../modules/campgrounds');

mongoose.connect('mongodb://localhost:27017/roofapp');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  try {
    await Campground.deleteMany({});
    for (let i = 0; i < locations.length; i++) {
      const price = Math.floor(Math.random() * 20) + 10;
      const imageUrl = `https://picsum.photos/400?random=${i}`;
      const camp = new Campground({
        author: '68e116bb34eca02e04ede169',
        location: `${locations[i].municipality}, ${locations[i].county}`,
        title: `${sample(descriptors)} ${sample(places)}`,
        image: imageUrl,
        description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi, voluptatibus!',
        price
      });
      await camp.save();
    }
    console.log('Database seeded successfully.');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();