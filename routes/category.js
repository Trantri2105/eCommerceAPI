import { Router } from "express";
import db from "../db.js";
import { verifyTokenAndAdmin } from "../middlewares/verifyToken.js";
const router = Router();

//CREATE A CATEGORY
router.post("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const newCategory = {
      title: req.body.title,
      description: req.body.description,
      img: req.body.img,
    };
    const result = await db.query(
      "INSERT INTO categories(title, description, img) VALUES ($1, $2, $3) RETURNING *",
      [newCategory.title, newCategory.description, newCategory.img]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err);
    console.log(err.message);
  }
});

//UPDATE A CATEGORY
router.patch("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const currentCategory = (
      await db.query("SELECT * FROM categories WHERE id = $1", [id])
    ).rows[0];
    const updateCategory = {
      title: req.body.title || currentCategory.title,
      description: req.body.description || currentCategory.description,
      img: req.body.img || currentCategory.img,
    };
    const result = await db.query(
      "UPDATE categories SET title = $1, description = $2, img = $3 WHERE id = $4 RETURNING *",
      [updateCategory.title, updateCategory.description, updateCategory.img, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err);
    console.log(err.message);
  }
});

//DELETE CATEGORY
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.query("DELETE FROM categories WHERE id = $1", [id]);
    res.status(200).json("Category has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET CATEGORY BY ID
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.query("SELECT * FROM categories WHERE id = $1", [id]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err);
    console.log(err.message);
  }
});

//GET ALL CATEGORIES
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM categories");
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(200).json(err);
    console.log(err);
  }
});
export default router;
