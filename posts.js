const express = require("express");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const db = require("../db/db");
const knex = require("../db/db");
const route = express.Router();
const jwt = require("jsonwebtoken");
const secret = "secret";
const getverification = require("./middleware");

// routes.patch("/", async (req, res) => {
const postupdate = async (req, res) => {
  try {
    const data = {
      id: req.body.id,
      title: req.body.title,
    };

    console.log("update", data);

    const schema = Joi.object({
      id: Joi.number().integer().required(),
      title: Joi.string().required(),
    });
    const { error } = schema.validate(data);
    if (error) {
      res.status(201).json({ message: " validation error" });
      console.log("Validation error:", error.details[0].message);
    } else {
      const checkforupdate = await db("posts").where({ id: data.id });
      if (checkforupdate) {
        const update = await db("posts").where({ id: data.id }).update({
          title: data.title,
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

const postloginApi = async (req, res) => {
  try {
    const data = {
      id: req.body.id,
    };
    console.log("loginapi", data);
    const schema = Joi.object({
      id: Joi.number().integer().required(),
    });
    const { error } = schema.validate(data);
    if (error) {
      res.status(201).json({ message: "login failed Email not found" });
      console.log("Validation error:", error.details[0].message);
    } else {
      const [userdata] = await db
        .select("*")
        .from("posts")
        .where("id", data.id);
      if (!userdata) {
        res.json({ message: "id not found" });
      } else {
        console.log("query console", userdata);
        const token = jwt.sign({ id: userdata.id }, secret); //
        console.log(userdata.id);
        const user = await db("posts").where("id", data.id).first();
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
const postsgetuserbyjwt = async (req, res) => {
  if (req.user) {
    const id = req.user.id;
    const data = await db.select("*").from("posts").where("id", id);
    console.table(data);
    res.json({ data });
  } else {
    res.json({ message: "no user found" });
  }
};
const postsdeleteById = async (req, res) => {
  try {
    const id = req.body.id;
    const [data] = await db.select("*").from("posts").where("id", id);
    if (data) {
      const token = await db("posts").where({ id }).del();
      res.json({ msg: `no of deleted users=${token}` });
    } else {
      res.json({ message: "id not found" });
    }
  } catch (e) {
    console.error(e);
    res.json({ message: e });
    throw e;
  }
};
const createpost = async (req, res) => {
  try {
    if (req.user) {
      const user_id = req.user.user_id;

      let data = {
        title: req.body.title,
        content: req.body.content,
      };
      console.log("carry data", data);
      const schema = Joi.object({
        title: Joi.string().required(),
        content: Joi.string().min(3).required(),
      });
      const { error, result } = schema.validate(data);
      if (error) {
        res.json({ Validationerror: error.details[0].message });
        console.log("Validation error:", error.details[0].message);
      } else {
        const update = await db("posts").where({ id: user_id }).insert({
          title: data.title,
          content: data.content,
        });
        res.status(201).json({
          message: "post has been created",
        });
      }
    }
  } catch (e) {
    console.error(e);
    res.json({ message: e });
    throw e;
  }
};
const dataById = async (req, res) => {
  const id = req.body.id;
  const [posts] = await knex("posts").where({ id }).select("*");
  const [users] = await knex("users").where({ id }).select("*");
  res.json({
    fulldata: "fulldata",
    name: users.name,
    email: users.email,
    title: posts.title,
    content: posts.content,
  });
};
const postslJoin = async (req, res) => {
  // console.log({ doctors, users });
  // console.table(doctors);
  // console.table(users);

  const left_join = await knex("posts")
    .leftJoin("users", "posts.id", "users.id")
    .select("posts.title", "users.name as username", "users.email");

  console.log("left");

  console.table(left_join);

  const rightJoin = await knex("posts")
    .rightJoin("users", "posts.id", "users.id")
    .select("posts.title", "users.name as username", "users.email");

  console.log("right");
  console.table(rightJoin);

  const innerjoin = await knex("posts")
    .join("users", "posts.id", "users.id")
    .select("posts.title", "users.name as username", "users.email");
  console.log("inner");

  console.table(innerjoin);

  const fullOuterJoin = await knex("posts")
    .fullOuterJoin("users", "posts.id", "users.id")
    .select(
      "posts.title",
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

route.patch("/postupdate", postupdate);
route.post("/postloginApi", postloginApi);
route.delete("/postsdeleteById", postsdeleteById);
route.post("/createpost", getverification, createpost);
route.get("/postsgetuserbyjwt", getverification, postsgetuserbyjwt);
route.get("/postslJoin", postslJoin);
route.get("/dataById", dataById);

module.exports = route;
