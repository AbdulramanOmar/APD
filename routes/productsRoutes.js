const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const {
  getProducts,
  getProduct,
  deleteProducts,
  updateProducts,
  createProducts,
} = require("../controllers/productsControllers");
const router = express.Router();

router.get("/" , getProducts);
router.post("/" ,upload.single("image"), createProducts);
router.get("/:id" , getProduct);
router.put("/:id" ,upload.single("image"), updateProducts);
router.delete("/:id" , deleteProducts);


module.exports = router