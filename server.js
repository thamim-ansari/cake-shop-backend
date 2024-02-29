const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, "cakedata.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
app.get("/cakes/", async (request, response) => {
  const {
    search_q = "",
    order_by = "id",
    order = "ASC",
    cake_type = "cake,cup cake",
  } = request.query;
  const cakeTypeArray = cake_type.split(",").map((item) => item.trim());
  const cakeTypeString = cakeTypeArray.map((item) => `"${item}"`).join(", ");
  const getCakesQuery = `
    SELECT
      *
    FROM
      cake_data
      WHERE name LIKE '%${search_q}%' AND type IN (${cakeTypeString})
    ORDER BY ${order_by} ${order}
    ;`;
  const cakesArray = await db.all(getCakesQuery);
  response.send(cakesArray);
});
