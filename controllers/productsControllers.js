const Product = require("../models/productsModel");
const cloudinary = require("cloudinary").v2
require("dotenv").config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
const createProducts = async (req, res) => {
  const { name, price, category, material, des, thickness } = req.body;

  // التحقق من صحة البيانات
  if (!name || !price || !req.file) {
    return res.status(400).json({ message: "Missing required fields (name, price, or image)" });
  }

  try {
    // رفع الصورة إلى Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "products", // اختياري: تحديد مجلد للصور في Cloudinary
    });

    // إنشاء المنتج في قاعدة البيانات
    const product = await Product.create({
      name,
      price,
      category,
      image: result.url, // رابط الصورة الآمن المرفوع إلى Cloudinary
      material,
      des,
      thickness,
    });

    // الاستجابة بنجاح
    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  }  catch (error) {
    console.error("Error details:", error.response?.data || error.message);
    setMessage("Failed to create product. " + (error.response?.data?.message || "Please try again."));
  }
};
const getProducts = async (req, res) => {
  const  {  category, material, thickness } = req.query;
  const queryObject = {};

  if (category) {
    queryObject.category = category 
  }
  if (material) {
    queryObject.material = material;
  }
  if (thickness) {
    queryObject.thickness = thickness;
  }
  try {
    const products = await Product.find(queryObject);
    res.status(200).json({ products: products, length: products.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProducts = async (req, res) => {
  const { id } = req.params;
  const { name, price, category, material, des, thickness } = req.body;
  try {
    // كائن لتحديث البيانات
    const updateData = {};

    // رفع الصورة إلى Cloudinary إذا كانت موجودة
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products", // اختياري: تحديد مجلد للصور في Cloudinary
      });
      updateData.image = result.url; // إضافة رابط الصورة إلى التحديثات
    }

    // إضافة الحقول النصية إذا كانت موجودة
    if (name) updateData.name = name;
    if (price) updateData.price = price;
    if (category) updateData.category = category;
    if (material) updateData.material = material;
    if (des) updateData.des = des;
    if (thickness) updateData.thickness = thickness;

    // تحديث المنتج في قاعدة البيانات
    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true, // إرجاع المنتج بعد التحديث
    });

    // التحقق إذا لم يتم العثور على المنتج
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // إرسال المنتج المحدث
    res.status(200).json(product);
  } catch (error) {
    // التعامل مع الأخطاء
    res.status(500).json({ message: error.message });
  }
};


const deleteProducts = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProducts,
  updateProducts,
  deleteProducts,
};
