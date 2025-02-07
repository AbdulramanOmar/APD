const express = require("express");
const connectDB = require("./db/connect");
require("dotenv").config();
const cors = require("cors")
const router = require("./routes/productsRoutes")
const orderRoutes = require("./routes/orderRoutes");
const app = express();

app.use(cors())
app.use(express.json())

app.use("/api/products" , router)
app.use("/api/orders", orderRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack); // طباعة الخطأ في الـ console

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong",
  });
});
const start = async () => {
  try {
    await connectDB();
    app.listen(5000, () => {
      console.log("server running in 5000 :localhost");
    });
  } catch (error) {
    console.log(error);
  }
};

start()
