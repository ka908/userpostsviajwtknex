const knex = require("knex");
const knexfile = require("../knexfile");
const db = knex(knexfile.development); // Connects to the database using the development configuration
module.exports = db;

// const knex = require("knex");
// const knexfile = require("../knexfile");
// module.exports = knex(knexfile[process.env.NODE_ENV ?? "development"]);
