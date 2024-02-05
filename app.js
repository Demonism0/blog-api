const express = require('express');

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

mongoose.set('strictQuery', false);

const mongoDB = process.env.MONGODB_URI;

async function main () {
  await mongoose.connect(mongoDB);
}
main().catch((err) => console.log(err));

const User = require('./models/user');

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use(bodyParser.json());

const apiRouter = require('./routes/api');

app.use('/api', apiRouter);

app.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}!`));
