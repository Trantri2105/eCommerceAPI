import { Router } from "express";
import {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
} from "../middlewares/verifyToken.js";
import db from "../db.js";
const router = Router();

//CREATE
router.post("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const total_cost = req.body.total_cost;
    const address = req.body.address;
    const newOrder = (
      await db.query(
        "INSERT INTO orders(user_id,total_cost,address) VALUES ($1,$2,$3) RETURNING *",
        [userId, total_cost, address]
      )
    ).rows[0];
    const products = req.body.products;
    for (let i = 0; i < products.length; ++i) {
      let product = products[i];
      await db.query(
        "INSERT INTO order_detail(order_id, product_id, color, size, quantity) VALUES($1,$2,$3,$4,$5)",
        [newOrder.id, product.id, product.color, product.size, product.quantity]
      );
    }
    newOrder.products = req.body.products;
    res.status(200).json(newOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});
export default router;

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const order_id = req.params.id;
    await db.query("DELETE FROM order_detail WHERE order_id = $1", [order_id]);
    await db.query("DELETE FROM orders WHERE id = $1", [order_id]);
    res.status(200).json("Order has been deleted");
  } catch (err) {
    res.status(500).json(err);
    console.log(err.message);
  }
});

//Update order status
router.patch("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const order_id = req.params.id;
    const status = req.body.status;
    const result = (
      await db.query("UPDATE orders SET status = $1 WHERE id = $2 RETURNING *", [
        status,
        order_id,
      ])
    ).rows[0];
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
    console.log(err.message);
  }
});

//Get all order of a user
router.get("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const user_id = req.params.id;
    const result = (
      await db.query("SELECT * FROM orders WHERE user_id = $1", [user_id])
    ).rows;
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Get all orders
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    if (req.query.num) {
      const result = (
        await db.query("SELECT * FROM orders LIMIT $1", [req.query.num])
      ).rows;
      res.status(200).json(result);
    } else {
      const result = (await db.query("SELECT * FROM orders")).rows;
      res.status(200).json(result);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
