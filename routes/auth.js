import { Router } from "express";
import db from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "dotenv";
env.config();
const router = Router();

//REGISTER
router.post("/register", async (req, res) => {
  const newUsers = {
    email: req.body.email,
    password: req.body.password,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    isadmin: req.body.isadmin || false,
  };
  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      newUsers.email,
    ]);

    if (checkResult.rows.length > 0) {
      res.status(400).json("Email already exists. Try logging in.");
    } else {
      const saltRounds = 10;
      const hash = await bcrypt.hash(newUsers.password, saltRounds);
      const user = await db.query(
        "INSERT INTO users (firstname, lastname, email, password, isadmin) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [
          newUsers.firstname,
          newUsers.lastname,
          newUsers.email,
          hash,
          newUsers.isadmin,
        ]
      );
      const { password, ...others } = user.rows[0];
      res.status(201).json(others);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
      email,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHashedPassword = user.password;
      const valid = await bcrypt.compare(password, storedHashedPassword);
      if (valid) {
        const accessToken = jwt.sign(
          {
            id: user.id,
            isadmin: user.isadmin,
          },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "30m",
          }
        );
        const { password, ...others } = user;
        res.status(200).json({ ...others, accessToken });
      } else {
        res.status(401).json("Wrong password");
      }
    } else {
      res.status(401).json("User not found!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
export default router;
