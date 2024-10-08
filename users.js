const express = require("express");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const db = require("../db/db");
const knex = require("../db/db");
const route = express.Router();
const jwt = require("jsonwebtoken");
const secret = "secret";
const getverification = require("./middleware");
const newupdate = async (req, res) => {
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
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });
    const { error, value } = schema.validate(data);
    if (error) {
      res.status(201).json({ message: "login failed Email not found" });
    } else {
      const [userdata] = await db
        .select("*")
        .from("newusers")
        .where("email", data.email);
      if (!userdata) {
        res.json({ message: "email not found" });
      } else {
        const token = jwt.sign({ id: userdata.id }, secret); //
        const user = await db("newusers").where("email", data.email).first();
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
const getuserbyjwt = async (req, res) => {
  if (req.user) {
    const id = req.user.id;
    const data = await db.select("*").from("users").where("id", id);
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
    const schema = Joi.object({
      name: Joi.string().min(3).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(3).required(),
    });

    const { error } = schema.validate(data);
    if (error) {
      res.json({ Validationerror: error.details[0].message });
    } else {
      const user = await db("newusers").where("email", data.email).first();
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
    res.json({ message: e });
    throw e;
  }
};
route.patch("/newupdate", newupdate);
route.post("/newloginApi", newloginApi);
route.delete("/newdeleteById", newdeleteById);
route.post("/newsignupApi", newsignupApi);
route.get("/getuserbyjwt", getverification, getuserbyjwt);
module.exports = route;
