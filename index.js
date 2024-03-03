import express from "express";
import bodyParser from "body-parser";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/users.js";
import productRoute from "./routes/products.js";
import cartRoute from "./routes/cart.js";
import orderRoute from "./routes/order.js";
import categoryRoute from "./routes/category.js";
import cors from "cors";
import env from "dotenv";
env.config();

const app = express();
const port = 3000;


app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api/auth", authRoute);

app.use("/api/users", userRoute);

app.use("/api/products", productRoute);

app.use("/api/cart", cartRoute);

app.use("/api/order", orderRoute);

app.use("/api/category", categoryRoute);

app.listen(process.env.PORT || port, () => {
  console.log("Server start on port 3000");
});
