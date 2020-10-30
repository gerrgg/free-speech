const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

// Hide warnings
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: 3,
    required: true,
    unique: true,
  },
  author: String,
  url: {
    type: String,
    require: true,
  },
  likes: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

blogSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

blogSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Blog", blogSchema);
