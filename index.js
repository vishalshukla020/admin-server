require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

const PORT = process.env.PORT || 4000;

//connecting to database
mongoose.connect(
  process.env.MONGODB_DATABASE,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  () => console.log("connected to db")
);

//middlewares
app.use(express.json());
app.use(cors());

//import routes
const authRoutes = require("./routes/auth.js");

//route middlewares
app.use("/api/user", authRoutes);

app.listen(PORT, () => {
  console.log("http://localhost:4000");
});
