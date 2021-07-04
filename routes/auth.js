const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User.js");
const {
  validateLoginInput,
  validateRegisterInput,
} = require("../validator.js");

//messaging service settings
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require("twilio")(accountSid, authToken);

//register route
router.post("/register", async (req, res) => {
  const { errors, valid } = validateRegisterInput(
    req.body.username,
    req.body.phone,
    req.body.password
  );

  if (!valid) {
    return res.status(400).send(errors);
  }
  const exist = await User.findOne({ username: req.body.username });

  if (exist) {
    return res.status(400).send("username already exist");
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    username: req.body.username,
    phone: req.body.phone,
    password: hashedPassword,
  });

  try {
    const registeredUser = await user.save();
    res.send(registeredUser);
  } catch (error) {
    res.status(402).send(error.message);
  }
});

//login route
router.post("/login", async (req, res) => {
  const { errors, valid } = validateLoginInput(
    req.body.username,
    req.body.password
  );

  if (!valid) {
    return res.status(400).send(errors);
  }
  const user = await User.findOne({ username: req.body.username });

  //username check
  if (!user) {
    res.status(404).send("User does not exist");
  }

  //password check
  const validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword) {
    res.status(400).send("Password is incorrect");
  }

  //create and assign a token
  const token = jwt.sign({ user }, process.env.TOKEN_SECRET_KEY, {
    expiresIn: "60m",
  });

  res.header("auth-token", token).send(token);
});

//forgot password route
router.post("/reset-password", async (req, res) => {
  const phone = req.body.phone;

  const user = await User.findOne({ phone: req.body.phone });

  if (!user) {
    return res.status(404).send("Phone no. not registered");
  }
  const otp = Math.floor(100000 + Math.random() * 900000);
  const expires = Date.now() + 2 * 60 * 1000;
  const data = `${phone}.${otp}.${expires}`;

  const hash = crypto
    .createHmac("sha256", authToken)
    .update(data)
    .digest("hex");

  const fullHash = `${hash}.${expires}`;

  client.messages
    .create({
      body: `Your one time login password is ${otp}`,
      from: "+14357408562",
      to: `+91${phone}`,
    })
    .then((message) => {
      console.log(message);
    })
    .catch((error) => {
      console.log(error);
    });

  res.status(200).send({ phone, hash: fullHash, otp });
});

//verify otp
router.post("/verify-otp", async (req, res) => {
  const phone = req.body.phone;
  const otp = req.body.otp;
  const hash = req.body.hash;

  let [hashValue, expires] = hash.split(".");
  let now = Date.now();

  if (now > parseInt(expires)) {
    return res
      .status(504)
      .send({ msg: "OTP is no longer valid. Please try again" });
  }

  const data = `${phone}.${otp}.${expires}`;
  const newHashValue = crypto
    .createHmac("sha256", authToken)
    .update(data)
    .digest("hex");

  if (newHashValue === hashValue) {
    const user = await User.findOne({ phone: phone });
    res.status(202).send({ msg: "user confirmed", data: user });
  } else {
    console.log("not authenticated");
    return res.status(400).send({ verification: false, msg: "incorrect otp" });
  }
});

//changing the password

router.post("/update-data", async (req, res) => {
  const { errors, valid } = validateRegisterInput(
    req.body.username,
    req.body.phone,
    req.body.password
  );

  if (!valid) {
    return res.status(400).send(errors);
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = await User.findByIdAndUpdate(req.body.id, {
    password: hashedPassword,
  });

  res.status(201).send(user);
});

module.exports = router;
