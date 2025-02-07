const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderControllers");

router.post("/", upload.single("image"), createOrder);

router.get("/", getOrders);

router.get("/:id", getOrderById);

router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

module.exports = router;
