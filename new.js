const knex = require("knex");
const Joi = require("joi");
const express = require("express");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const secret = "secret";
const app = express();
const dischargepatient = require("./routes/dischargepatient.js");
const route = require("./routes/index.js");
const users = require("./routes/users");
const posts = require("./routes/posts");
const postandcomments = require("./routes/postandcomments");
const db = require("./db/db");
const knexfile = require("./knexfile");
app.use(express.json());

app.use("/", dischargepatient);
app.use("/", route);
app.use("/", users);
app.use("/", posts);
app.use("/", postandcomments);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
