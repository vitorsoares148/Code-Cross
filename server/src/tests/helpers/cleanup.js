const db = require("../../../db");

async function cleanupDatabase() {
  await db.query("DELETE FROM reviews");
  await db.query("DELETE FROM users");
}

module.exports = cleanupDatabase;
