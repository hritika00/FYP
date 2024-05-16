const cloudinary = require('cloudinary').v2
const multiparty = require("connect-multiparty");

const express = require('express');

const path = require('path');

const cors = require('cors');

const dotenv = require('dotenv');
const connectDB = require('./database/db');

const app = express();

dotenv.config();
app.use(express.json());
// app.use(express.json({ limit: '40mb' }))
// app.use(express.urlencoded({limit: '40mb', extended: true }));
app.use(multiparty());


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const corsPolicy = {
    origin : true,
    credentials : true,
    optionSuccessStatus : 200,
}
app.use(cors(corsPolicy));

app.use('/uploads', (req, res, next) => {
  express.static(path.resolve(__dirname, 'uploads'))(req, res, next);
});

connectDB();

const port = process.env.PORT;

app.use('/api/user', require('./routes/userRoutes'))
app.use('/api/hotel', require('./routes/hotelRoutes'))
app.use('/api/booking', require('./routes/bookingRoutes'))
app.use('/api/comment', require('./routes/commentRoutes'))


app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});

module.exports = app;
