const knex = require("knex");
const express = require("express");
const app = express();
const dischargepatient = require("./routes/dischargepatient.js");
const route = require("./routes/index.js");
const users = require("./routes/users");
const posts = require("./routes/posts");
const postandcomments = require("./routes/postandcomments");
app.use(express.json());
app.use("/", dischargepatient);
app.use("/", route);
app.use("/", users);
app.use("/", posts);
app.use("/", postandcomments);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
