const Order = require("../models/orderModel"); // افترض أن نموذجك في مجلد models
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
// إنشاء طلب جديد
const createOrder = async (req, res) => {
  const { name, des, category, material, thickness, phone, quantity } =
    req.body;

  try {
    let imageUrl = null; // المتغير الذي سيحمل رابط الصورة إذا تم رفعها

    // رفع الصورة إلى Cloudinary إذا كانت موجودة
    if (req.file && req.file.path) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products", // اختياري: تحديد مجلد للصور في Cloudinary
      });
      imageUrl = result.url; // حفظ رابط الصورة
    }

    // إنشاء الطلب
    const order = await Order.create({
      name,
      des,
      category,
      material,
      thickness,
      image: imageUrl, // إضافة الصورة إذا كانت موجودة، وإلا ستكون null
      phone,
      quantity,
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// الحصول على جميع الطلبات
const getOrders = async (req, res) => {
  const { status, orderID } = req.query;
  const queryObject = {};
  if (status) {
    queryObject.status = status;
  }
  if (orderID) {
    queryObject.orderID = orderID;
  }
  try {
    const orders = await Order.find(queryObject);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// الحصول على طلب واحد باستخدام ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// تحديث طلب
const updateOrder = async (req, res) => {
  const { status } = req.body;
  const updateStatus = {};
  if (status) {
    updateStatus.status = status;
  }
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, updateStatus, {
      new: true, // يعيد الكائن بعد التحديث
      runValidators: true, // للتحقق من القيود أثناء التحديث
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// حذف طلب
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
