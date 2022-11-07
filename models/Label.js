const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Label = new Schema({
  left: Number,
  top: Number,
  width: Number,
  height: Number,
  catalog: String,
});

module.exports = mongoose.model("labels", Label);
