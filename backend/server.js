const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "secret123";

const db = new sqlite3.Database("./database.db");

// CREATE TABLES
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, username TEXT, password TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS ratings(id INTEGER PRIMARY KEY, user_id INTEGER, movie_id INTEGER, rating INTEGER)"
  );
});

// REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users(username,password) VALUES(?,?)",
    [username, hash],
    function (err) {
      if (err) return res.send(err);
      res.send({ msg: "User created" });
    }
  );
});

// LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username=?",
    [username],
    async (err, user) => {
      if (!user) return res.send({ msg: "User not found" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.send({ msg: "Wrong password" });

      const token = jwt.sign({ id: user.id }, SECRET);
      res.send({ token });
    }
  );
});

// SAVE RATING
app.post("/rate", (req, res) => {
  const { token, movie_id, rating } = req.body;
  const user = jwt.verify(token, SECRET);

  db.run(
    "INSERT INTO ratings(user_id,movie_id,rating) VALUES(?,?,?)",
    [user.id, movie_id, rating],
    () => res.send({ msg: "Saved" })
  );
});

// GET RECOMMENDATIONS (simple)
app.post("/recommend", (req, res) => {
  const { token } = req.body;
  const user = jwt.verify(token, SECRET);

  db.all(
    "SELECT movie_id FROM ratings WHERE user_id=? ORDER BY rating DESC LIMIT 5",
    [user.id],
    (err, rows) => {
      res.send(rows);
    }
  );
});

app.listen(5000, () => console.log("Backend running on 5000"));