const express = require("express");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const db = require("../db/db");
const knex = require("../db/db");
const route = express.Router();
const jwt = require("jsonwebtoken");
const secret = "secret";
const getverification = require("./middleware");
const uuid = require("uuid");

// routes.patch("/", async (req, res) => {
const newupdate = async (req, res) => {
  try {
    const data = {
      id: req.body.id,
      email: req.body.email,
    };

    console.log("update", data);

    const schema = Joi.object({
      id: Joi.number().integer().required(),
      email: Joi.string().email().required(),
    });
    const { error } = schema.validate(data);
    if (error) {
      res.status(201).json({ message: " validation error" });
      console.log("Validation error:", error.details[0].message);
    } else {
      const checkforupdate = await db("newusers").where({ id: data.id });
      if (checkforupdate) {
        const update = await db("newusers").where({ id: data.id }).update({
          email: data.email,
        });
        res.json({ update });
        return update;
      } else {
        res.json({ message: "id not found" });
      }
    }
  } catch (e) {
    console.error(e);
    res.json({ message: e });
    throw e;
  }
};

const newloginApi = async (req, res) => {
  try {
    const data = {
      email: req.body.email,
      password: req.body.password,
    };

    console.log("loginapi", data);

    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });
    const { error, value } = schema.validate(data);
    if (error) {
      res.status(201).json({ message: "login failed Email not found" });

      console.log("Validation error:", error.details[0].message);
    } else {
      const [userdata] = await db
        .select("*")
        .from("newusers")
        .where("email", data.email);
      if (!userdata) {
        res.json({ message: "email not found" });
      } else {
        console.log("query console", userdata);
        const token = jwt.sign({ id: userdata.id }, secret); //
        console.log(userdata.id);
        const user = await db("newusers").where("email", data.email).first();
        if (user) {
          res.json({ message: "login success", token });
        } else {
          res.status(201).json({ message: "login failed Email not found" });
        }
      }
    }
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: e.details[0].message });

    throw e;
  }
};
const getuserbyjwt = async (req, res) => {
  if (req.user) {
    const id = req.user.id;

    const data = await db.select("*").from("users").where("id", id);
    console.table(data);
    res.json({ data });
  } else {
    res.json({ message: "no user found" });
  }
};
const newdeleteById = async (req, res) => {
  try {
    const id = req.body.id;
    const token = await db("newusers").where({ id }).del();
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.json({ message: e });
    throw e;
  }
};

const newsignupApi = async (req, res) => {
  try {
    let data = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    };
    console.log("carry data", data);

    const schema = Joi.object({
      name: Joi.string().min(3).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(3).required(),
    });

    const { error } = schema.validate(data);
    if (error) {
      res.json({ Validationerror: error.details[0].message });

      // console.log("Validation error:", error.details[0].message);
    } else {
      const user = await db("newusers").where("email", data.email).first();
      console.log("check the data", user);

      if (user) {
        res.json({ message: "Email exists", user });
      } else {
        let passwordHash = bcrypt.hashSync(data.password, 8);
        const id = await db("newusers").insert({
          name: data.name,
          email: data.email,
          password: passwordHash,
        });
        res.status(201).json({ message: "user hase been registered" });
      }
    }
  } catch (e) {
    console.error(e);
    res.json({ message: e });
    throw e;
  }
};

const lJoin = async (req, res) => {
  const [doctors] = await knex("doctor").select();
  const [users] = await knex("users").select();
  // console.log({ doctors, users });
  // console.table(doctors);
  // console.table(users);

  const left_join = await knex("doctor")
    .leftJoin("users", "doctor.user_id", "users.id")
    .select("doctor.patientName", "users.name as username", "users.email");

  console.log("left");

  console.table(left_join);

  const rightJoin = await knex("doctor")
    .rightJoin("users", "doctor.user_id", "users.id")
    .select("doctor.patientName", "users.name as username", "users.email");

  console.log("right");
  console.table(rightJoin);

  const innerjoin = await knex("doctor")
    .join("users", "doctor.user_id", "users.id")
    .select("doctor.patientName", "users.name as username", "users.email");
  console.log("inner");

  console.table(innerjoin);

  const fullOuterJoin = await knex("doctor")
    .fullOuterJoin("users", "doctor.user_id", "users.id")
    .select(
      "doctor.patientName",
      "users.name as username",
      "users.email",
      "users.password"
    );
  console.log("fullouter");
  console.table(fullOuterJoin);

  res.json({
    left_join: left_join,
    rightJoin: rightJoin,
    innerjoin: innerjoin,
    fullOuterJoin: fullOuterJoin,
  });
};

route.patch("/newupdate", newupdate);
route.post("/newloginApi", newloginApi);
route.delete("/newdeleteById", newdeleteById);
route.post("/newsignupApi", newsignupApi);
route.get("/getuserbyjwt", getverification, getuserbyjwt);
route.get("/lJoin");

module.exports = route;
