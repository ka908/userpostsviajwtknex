const express = require("express");
const personController = require("../controller/person");
const db = require("../db/db");
const routes2 = express.Router();
const getverification = require("./middleware");

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
const dischargebyid = async (req, res) => {
  try {
    const id = req.user.id;
    const [dischargecheck] = await db("doctor")
      .where({ user_id: id })
      .select("*");
    if (!dischargecheck || !dischargecheck.user_id) {
      return res.json({ message: "patient not exists" });
    } else {
      if (id === dischargecheck.user_id) {
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
const discharge = async (req, res) => {
  try {
    const name = req.body.name;
    const timings = req.body.timings;
    const [dischargecheck] = await db("doctor")
      .where({ patientName: name, timings: timings })
      .select();
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
    res.json({ message: e });
    throw e;
  }
};
const getbypatientid = async (req, res) => {
  const id = req.user.id;
  const left_join = await db("doctor")
    .leftJoin("newusers", "doctor.user_id", "newusers.id")
    .select("doctor.patientName", "newusers.name as username", "newusers.email")
    .where("doctor.user_id", id);
  res.json({ left_join });
};
routes2.post("/discharge", discharge);
routes2.get("/dischargebyid", getverification, dischargebyid);
routes2.get("/getbypatientid", getverification, getbypatientid);
module.exports = routes2;
