import { Router } from "express";
import db from "../db.js";
import {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
} from "../middlewares/verifyToken.js";
const router = Router();

//CREATE
router.post("/", verifyToken, async (req, res) => {
  try {
    const productId = req.body.productId;
    const userId = req.user.id;
    const quantity = req.body.quantity;
    const color = req.body.color;
    const size = req.body.size;
    const result = await db.query(
      "INSERT INTO cart_items VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [userId, productId, quantity, color, size]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE
router.patch("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const userId = req.params.id;
    const productId = req.body.productId;
    const currentCart = await db.query(
      "SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );
    const quantity = req.body.quantity || currentCart.quantity;
    const color = req.body.color || currentCart.color;
    const size = req.body.size || currentCart.size;
    const result = await db.query(
      "UPDATE cart_items SET quantity = $1, color = $2, size = $3 WHERE user_id = $4 AND product_id = $5 RETURNING *",
      [quantity, color, size, userId, productId]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err);
    console.log(err.message);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const userId = req.params.id;
    const productId = req.body.productId;
    if (productId) {
      await db.query(
        "DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2",
        [userId, productId]
      );
    } else {
      await db.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
    }
    res.status(200).json("Cart has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER CART
router.get("/find/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await db.query(
      "SELECT * FROM cart_items WHERE user_id = $1",
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
