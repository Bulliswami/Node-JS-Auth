const mongoose = require("mongoose");
require('dotenv').config();
let DB_URL = process.env.DB_URL;

module.exports = async function connection() {
  try {
     mongoose.connect(
      DB_URL,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true,
      }
    )
    console.log('connection success')
  } catch (error) {
    console.log(error);
  }
};
