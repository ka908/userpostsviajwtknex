const express = require("express");
const Joi = require("joi");
const db = require("../db/db");
const knex = require("../db/db");
const route = express.Router();
const jwt = require("jsonwebtoken");
const secret = "secret";
const getverification = require("./middleware");
const postupdate = async (req, res) => {
  try {
    const data = {
      id: req.body.id,
      title: req.body.title,
    };
    const schema = Joi.object({
      id: Joi.number().integer().required(),
      title: Joi.string().required(),
    });
    const { error } = schema.validate(data);
    if (error) {
      res.status(201).json({ message: " validation error" });
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
    res.json({ message: e });
    throw e;
  }
};

const postloginApi = async (req, res) => {
  try {
    const data = {
      id: req.body.id,
    };
    const schema = Joi.object({
      id: Joi.number().integer().required(),
    });
    const { error } = schema.validate(data);
    if (error) {
      res.status(201).json({ message: "login failed Email not found" });
    } else {
      const [userdata] = await db
        .select("*")
        .from("posts")
        .where("id", data.id);
      if (!userdata) {
        res.json({ message: "id not found" });
      } else {
        const token = jwt.sign({ id: userdata.id }, secret); //
        const user = await db("posts").where("id", data.id).first();
        if (user) {
          res.json({ message: "login success", token });
        } else {
          res.status(201).json({ message: "login failed Email not found" });
        }
      }
    }
  } catch (e) {
    res.status(400).json({ message: e.details[0].message });
    throw e;
  }
};
const postsgetuserbyjwt = async (req, res) => {
  if (req.user) {
    const id = req.user.id;
    const data = await db.select("*").from("posts").where("id", id);
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
      const schema = Joi.object({
        title: Joi.string().required(),
        content: Joi.string().min(3).required(),
      });
      const { error, result } = schema.validate(data);
      if (error) {
        res.json({ Validationerror: error.details[0].message });
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
  const left_join = await knex("posts")
    .leftJoin("users", "posts.id", "users.id")
    .select("posts.title", "users.name as username", "users.email");
  const rightJoin = await knex("posts")
    .rightJoin("users", "posts.id", "users.id")
    .select("posts.title", "users.name as username", "users.email");
  const innerjoin = await knex("posts")
    .join("users", "posts.id", "users.id")
    .select("posts.title", "users.name as username", "users.email");
  const fullOuterJoin = await knex("posts")
    .fullOuterJoin("users", "posts.id", "users.id")
    .select(
      "posts.title",
      "users.name as username",
      "users.email",
      "users.password"
    );
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
