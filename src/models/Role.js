const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: String,
  permissions: [
    {
      module: String,
      actions: [String], // read, create, update, delete
    },
  ],
});

module.exports = mongoose.model("Role", roleSchema);