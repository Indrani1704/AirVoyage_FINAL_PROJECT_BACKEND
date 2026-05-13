const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(require("../../firebase.json"))
});

module.exports = admin;