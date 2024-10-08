const express = require("express");
const db = require("../db/db");
const route = express.Router();
const jwt = require("jsonwebtoken");
const secret = "secret";
const verify = function getverification(req, res, next) {
  try {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer") ||
      !req.headers.authorization.split(" ")[1]
    ) {
      return res.status(401).json("please enter valid Credentials");
    } else {
      let header = req.headers.authorization;
      header = header.split(" ")[1];
      if (header) {
        const decoded = jwt.verify(header, secret, (err, data) => {
          if (err) {
            res.status(403).send("access Forbidden, token is invalid");
          } else {
            req.user = data;
            next();
          }
        });
      } else {
        res.status(403).send("enter valid credentials");
      }
    }
  } catch (e) {
    console.error(e);
    res.json({ message: e });
    throw e;
  }
};
module.exports = verify;
