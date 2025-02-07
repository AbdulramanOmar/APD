const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "product name must be provided"],
  },
  price: {
    type: Number,
    required: [true, "product price must be provided"],
  },
  des: {
    type: String,
  },
  image: {
    type: String,
  },
  category: {
    type: String,
    enum: {
      values: ["boxes", "bags", "packaging"],
      message: "{VALUE} is not supported",
    },
  },
  material: {
    type: String,
    enum: {
      values: ["cardboard", "paper"],
      message: "{VALUE} is not supported",
    },
  },
  thickness: {
    type: String,
    enum: {
      values: ["light", "medium", "heavy"],
      message: "{VALUE} is not supported",
    },
  },
});

module.exports = mongoose.model("Product", ProductSchema);
