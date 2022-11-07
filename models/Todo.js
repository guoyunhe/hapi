const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Label = require("./Label");

const Photo = new Schema(
  {
    key: String,
    originalname: String,
    mimetype: String,
    labels: [Label.schema],
  },
  {
    virtuals: {
      url: {
        get() {
          return (
            "https://" + process.env.S3_BUCKET + ".s3.amazonaws.com/" + this.key
          );
        },
      },
    },
  }
);

module.exports = mongoose.model("photos", Photo);
