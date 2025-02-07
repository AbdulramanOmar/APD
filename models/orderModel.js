const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const OrderSchema = mongoose.Schema({
  orderID: {
    type: Number,
  },
  name: {
    type: String,
    required: [true, "Product name must be provided"],
  },
  des: {
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
  image: {
    type: String,
  },
  phone: {
    type: Number,
    required: [true, "Phone number is required"],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity must be provided"],
    min: [1, "Quantity cannot be less than 1"],
  },
  status: {
    type: String,
    enum: {
      values: ["pending", "progressing", "completed", "cancelled"],
      message: "{VALUE} is not a valid status",
    },
    default: "pending",
  },
  date: {
    type: Number,
    default: () => Date.now(),
  },
});

// Apply auto-increment plugin
OrderSchema.plugin(AutoIncrement, { inc_field: "orderID" });

module.exports = mongoose.model("Order", OrderSchema);
