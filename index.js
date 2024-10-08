const express = require("express");
const db = require("../db/db");
const route = express.Router();
const uuid = require("uuid");

// routes.post("/posts", personController.createPerson);

// routes.get("/", async (req, res) => {
//   try {
//     const full = await db("doctor").select("*");
//     res.json({ data: full });
//   } catch (e) {
//     console.error(e);
//     res.json({ message: e });
//     throw e;
//   }
// });

// routes.get("/", async (req, res) => {
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

// routes.patch("/", async (req, res) => {
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

// routes.delete("/", async (req, res) => {
const deleteByName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.json({ message: "provide name" });
    } else {
      const [getdata] = await db("doctor")
        .where({ patientName: name })
        .select("*");
      // console.log(getdata.patientName);
      if (!getdata || !getdata.patientName) {
        res.json({ message: "no such patient" });
      } else {
        await db("doctor").where({ patientName: name }).del();
        res.json({ message: "deleted record" });
      }
    }
  } catch (e) {
    console.error(e);
    res.json({ message: e });
    throw e;
  }
};

// routes.post("/", async (req, res) => {
const insertData = async (req, res) => {
  try {
    const name = req.body.name;
    const timings = req.body.timings;

    const insertedRows = await db("doctor")
      .insert({ patientName: name, timings: timings })
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
    const abc = await db("doctor")
      .where({ id: 38 }) // Assuming you're identifying records by some 'id'
      .update({ user_id: 18 });
    console.log(abc);
    res.json({ message: "updated" });
  } catch (e) {
    console.error(e);
    res.json({ message: e });

    throw e;
  }
};

route.post("/insert", insertData);
route.get("/get-by-name", getByName);
route.delete("/delete-by-name", deleteByName);
route.patch("/update-by-name", updateByName);
route.patch("/updating_user_id", updating_user_id);

module.exports = route;
