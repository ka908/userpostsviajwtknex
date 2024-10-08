const express = require("express");
const db = require("../db/db");
const route = express.Router();
const getverification = require("./middleware");
const Joi = require("joi");
const getByName = async (req, res) => {
  try {
    const name = req.body.name;

    if (name) {
      const getdata = await db("doctor")
        .where({ patientName: name })
        .select("*");

      res.json({ data: getdata });
    } else {
      res.json({ data: "no such patient " });
    }
  } catch (e) {
    console.error(e);
    res.json({ message: e });
    throw e;
  }
};
const updateByName = async (req, res) => {
  try {
    const { name, timings } = req.body;
    await db("doctor")
      .where({ patientName: name })
      .update({ timings: timings });

    res.json({ message: "updated" });
  } catch (e) {
    console.error(e);
    res.json({ message: e });
    throw e;
  }
};
const deleteById = async (req, res) => {
  try {
    const id = req.body.id;
    if (!id) {
      return res.json({ message: "provide id" });
    } else {
      const [getdata] = await db("doctor").where({ id: id }).select("*");
      if (!getdata || !getdata.id) {
        res.json({ message: "no such patient" });
      } else {
        await db("doctor").where({ id: id }).del();
        res.json({ message: "deleted record" });
      }
    }
  } catch (e) {
    console.error(e);
    res.json({ message: e });
    throw e;
  }
};
const insertData = async (req, res) => {
  try {
    const user_id = req.user.id;
    const name = req.body.name;
    const timings = req.body.timings;
    const insertedRows = await db("doctor")
      .insert({ patientName: name, timings: timings, user_id: user_id })
      .returning("id");
    res.json({ data: insertedRows });
  } catch (e) {
    console.error(e);
    res.json({ message: e });
    throw e;
  }
};
const updating_user_id = async (req, res) => {
  try {
    const abc = await db("doctor").where({ id: 38 }).update({ user_id: 18 });
    console.log(abc);
    res.json({ message: "updated" });
  } catch (e) {
    console.error(e);
    res.json({ message: e });
    throw e;
  }
};
route.post("/insert", getverification, insertData);
route.get("/get-by-name", getByName);
route.delete("/deleteById", deleteById);
route.patch("/update-by-name", updateByName);
route.patch("/updating_user_id", updating_user_id);
module.exports = route;
