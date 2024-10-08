const express = require("express");
const Joi = require("joi");
const db = require("../db/db");
const route = express.Router();
const jwt = require("jsonwebtoken");
const secret = "secret";
const getverification = require("./middleware");
const update = async (req, res) => {
  try {
    const data = {
      id: req.body.id,
      email: req.body.email,
    };
    const schema = Joi.object({
      id: Joi.number().integer().required(),
      email: Joi.string().email().required(),
    });
    const { error } = schema.validate(data);
    if (error) {
      res.status(201).json({ message: " validation error" });
    } else {
      const checkforupdate = await db("users").where({ id: data.id });
      if (checkforupdate) {
        const update = await db("users").where({ id: data.id }).update({
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
const postAndCommentsLogin = async (req, res) => {
  try {
    const data = {
      user_id: req.body.user_id,
    };
    const schema = Joi.object({
      user_id: Joi.number().integer().required(),
    });
    const { error } = schema.validate(data);
    if (error) {
      res.status(201).json({ message: "login failed user_id not found" });
    } else {
      const [userdata] = await db
        .select("*")
        .from("postandcomments")
        .where("user_id", data.user_id);
      if (!userdata) {
        res.json({ message: "user_id not found" });
      } else {
        const token = jwt.sign({ user_id: userdata.user_id }, secret); //
        const user = await db("postandcomments")
          .where("user_id", data.user_id)
          .first();
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
const getbyuserid = async (req, res) => {
  const id = req.body.id;
  const left_join = await knex("postandcomments")
    .leftJoin("newusers", "postandcomments.user_id", "newusers.id")
    .select(
      "postandcomments.content",
      "newusers.name as username",
      "newusers.email"
    )
    .where("postandcomments.user_id", id);
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
  res.json({ left_join });
};
const deleteById = async (req, res) => {
  try {
    const id = req.body.id;
    const token = await db("users").where({ id }).del();
    res.json({ token });
  } catch (e) {
    res.json({ message: e });
    throw e;
  }
};
const insertcomments = async (req, res) => {
  try {
    let data = {
      user_id: req.user.id,
      content: req.body.content,
      comments: req.body.comments,
    };
    const schema = Joi.object({
      user_id: Joi.number().integer().required(),
      content: Joi.string().required(),
      comments: Joi.string().required(),
    });

    const { error } = schema.validate(data);
    if (error) {
      res.json({ Validationerror: error.details[0].message });
    } else {
      const id = await db("postandcomments").insert({
        user_id: data.user_id,
        content: data.content,
        comments: data.comments,
      });
      res.status(201).json({ message: "post created for respective jwt" });
    }
  } catch (e) {
    res.json({ message: e });
    throw e;
  }
};
route.patch("/update", update);
route.post("/postAndCommentsLogin", postAndCommentsLogin);
route.get("/getbyuserid", getbyuserid);
route.delete("/deleteById", deleteById);
route.post("/insertcomments", getverification, insertcomments);
module.exports = route;
