import { Router } from "express";
import { verifyTokenAndAdmin } from "../middlewares/verifyToken.js";
import db from "../db.js";

const router = Router();

//CREATE PRODUCT
router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newProduct = req.body;
  try {
    const result = await db.query(
      "INSERT INTO products (title, description, img, category_id, price, stocks) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        newProduct.title,
        newProduct.description,
        newProduct.img,
        newProduct.category_id,
        newProduct.price,
        newProduct.stocks,
      ]
    );
    const sizes = newProduct.sizes;
    for (let i = 0; i < sizes.length; ++i) {
      await db.query("INSERT INTO sizes (product_id,size) VALUES ($1,$2)", [
        result.rows[0].id,
        sizes[i],
      ]);
    }
    const colors = newProduct.colors;
    for (let i = 0; i < colors.length; ++i) {
      await db.query("INSERT INTO colors (product_id,color) VALUES ($1,$2)", [
        result.rows[0].id,
        colors[i],
      ]);
    }
    const product = result.rows[0];
    product.colors = newProduct.colors;
    product.sizes = newProduct.sizes;
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
    console.log(err.message);
  }
});

//UPDATE PRODUCT
router.patch("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const currentProduct = (
      await db.query("SELECT * FROM products WHERE id = $1", [id])
    ).rows[0];
    const updateProduct = {
      title: req.body.title || currentProduct.title,
      description: req.body.description || currentProduct.description,
      img: req.body.img || currentProduct.img,
      category_id: req.body.category_id || currentProduct.category_id,
      price: req.body.price || currentProduct.price,
      stocks: req.body.stocks || currentProduct.stocks,
    };
    const updatedProduct = (
      await db.query(
        "UPDATE products SET title = $1, description = $2, img = $3, category_id = $4, price = $5,stocks = $6 WHERE id = $7 RETURNING *",
        [
          updateProduct.title,
          updateProduct.description,
          updateProduct.img,
          updateProduct.category_id,
          updateProduct.price,
          updateProduct.stocks,
          id,
        ]
      )
    ).rows[0];
    if (req.body.colors) {
      await db.query("DELETE FROM colors WHERE product_id = $1", [id]);
      const colors = req.body.colors;
      for (let i = 0; i < colors.length; ++i) {
        await db.query("INSERT INTO colors (product_id,color) VALUES ($1,$2)", [
          id,
          colors[i],
        ]);
      }
    }
    if (req.body.sizes) {
      await db.query("DELETE FROM sizes WHERE product_id = $1", [id]);
      const sizes = req.body.sizes;
      for (let i = 0; i < sizes.length; ++i) {
        await db.query("INSERT INTO sizes (product_id,size) VALUES ($1,$2)", [
          id,
          sizes[i],
        ]);
      }
    }
    updatedProduct.colors = req.body.colors;
    updatedProduct.sizes = req.body.sizes;
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

//DELETE PRODUCT
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.query("DELETE FROM sizes WHERE product_id = $1", [id]);
    await db.query("DELETE FROM colors WHERE product_id = $1", [id]);
    await db.query("DELETE FROM products WHERE id = $1", [id]);
    res.status(200).json("Product has been deleted");
  } catch (err) {
    res.status(500).json(err);
    console.log(err.message);
  }
});

//GET PRODUCT BY ID
router.get("/find/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = (
      await db.query("SELECT * FROM products WHERE id = $1", [id])
    ).rows[0];
    const colors = (
      await db.query("SELECT color FROM colors WHERE product_id = $1", [id])
    ).rows;
    result.colors = [];
    colors.forEach((item) => {
      result.colors.push(item.color);
    });
    const sizes = (
      await db.query("SELECT size FROM sizes WHERE product_id = $1", [id])
    ).rows;
    result.sizes = [];
    sizes.forEach((item) => {
      result.sizes.push(item.size);
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

//GET PRODUCTS
router.get("/", async (req, res) => {
  try {
    const num = req.query.num;
    const category = req.query.category_id;
    let result;
    if (category) {
      if (num) {
        result = await db.query(
          "SELECT * FROM products WHERE category_id = $1 ORDER BY date_created DESC LIMIT $2",
          [category, num]
        );
      } else {
        result = await db.query(
          "SELECT * FROM products WHERE category_id = $1 ORDER BY date_created DESC",
          [category]
        );
      }
    } else {
      if (num) {
        result = await db.query(
          "SELECT * FROM products ORDER BY date_created DESC LIMIT $2",
          [num]
        );
      } else {
        result = await db.query(
          "SELECT * FROM products ORDER BY date_created DESC"
        );
      }
    }
    result = result.rows;
    for (let i = 0; i < result.length; ++i) {
      const id = result[i].id;
      const colors = (
        await db.query("SELECT color FROM colors WHERE product_id = $1", [id])
      ).rows;
      result[i].colors = [];
      colors.forEach((item) => {
        result[i].colors.push(item.color);
      });
      const sizes = (
        await db.query("SELECT size FROM sizes WHERE product_id = $1", [id])
      ).rows;
      result[i].sizes = [];
      sizes.forEach((item) => {
        result[i].sizes.push(item.size);
      });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

export default router;
