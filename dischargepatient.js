const express = require("express");
const personController = require("../controller/person");
const db = require("../db/db");
const routes2 = express.Router();

// routes2.get("/", async (req, res) => {
const getAll = async (req, res) => {
  try {
    const full = await db("doctor").select("*");
    res.json({ data: full });
  } catch (e) {
    console.error(e);
    res.json({ message: e });
    throw e;
  }
};

// routes2.post("/", async (req, res) => {
const discharge = async (req, res) => {
  try {
    const name = req.body.name;
    const timings = req.body.timings;
    const [dischargecheck] = await db("doctor")
      .where({ patientName: name, timings: timings })
      .select();

    console.log(dischargecheck);
    // console.log(dischargecheck.patientName);

    // console.log(req.body.name);
    // console.log(dischargecheck.timings);

    if (
      !dischargecheck ||
      !dischargecheck.timings ||
      !dischargecheck.patientName
    ) {
      return res.json({ message: "patient not exists" });
    } else {
      if (
        name === dischargecheck.patientName &&
        timings === dischargecheck.timings
      ) {
        res.json({ message: "patient discharged" });
      } else {
        res.json({ message: "patient not discharged" });
      }
    }
  } catch (e) {
    console.error(e);
    res.json({ message: e });

    throw e;
  }
};

routes2.post("/discharge", discharge);
routes2.get("/getAll", getAll);
module.exports = routes2;
