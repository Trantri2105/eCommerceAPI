import { Router } from "express";
import {
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
} from "../middlewares/verifyToken.js";
import db from "../db.js";
import bcrypt from "bcrypt";
const router = Router();

//UPDATE USER
router.patch("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const currentUser = (
      await db.query("SELECT * FROM users WHERE id = $1", [id])
    ).rows[0];
    const updateUser = {
      firstname: req.body.firstname || currentUser.firstname,
      lastname: req.body.lastname || currentUser.lastname,
      password: currentUser.password,
    };
    if (req.body.password) {
      const saltRounds = 10;
      const newPassword = req.body.password;
      updateUser.password = await bcrypt.hash(newPassword, saltRounds);
    }
    const updatedUser = (
      await db.query(
        "UPDATE users SET firstname = $1, lastname = $2, password = $3 WHERE id = $4 RETURNING *",
        [updateUser.firstname, updateUser.lastname, updateUser.password, id]
      )
    ).rows[0];
    const { password, ...others } = updatedUser;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

//DELETE USER
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.query("DELETE FROM users WHERE id = $1", [id]);
    res.status(200).json("User has been deleted");
  } catch (err) {
    res.status(500).json(err);
    console.log(err.message);
  }
});

//GET USER BY ID
router.get("/find/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = (await db.query("SELECT * FROM users WHERE id = $1", [id]))
      .rows[0];
    const { password, ...other } = result;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

//GET ALL USERS
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const num = req.query.num;
    if (num) {
      const result = await db.query(
        "SELECT id, firstname, lastname, email FROM users LIMIT $1",
        [num]
      );
      res.status(200).json(result.rows);
    } else {
      const result = db.query(
        "SELECT id, firstname, lastname, email FROM users",
      );
      res.status(200).json(result.rows);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
