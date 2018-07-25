const passportLocalMongoose = require("passport-local-mongoose") // pr passport

module.exports = mongoose => {
  "use strict";

  console.log(mongoose);

const Schema = mongoose.Schema;

/**
 * @swagger
 * definitions:
 *   User:
 *     type: object
 *     required:
 *      - nom
 *      - adresseMail
 *      - pseudo
 *      - pays
 *     properties:
 *       nom:
 *         type: string
 *       photo:
 *         type: string
 *       adresseMail:
 *         type: string
 *       ville:
 *         type: string
 *       pays:
 *         type: string
 *       pseudo:
 *         type: string
 */

const UserSchema = Schema ({
  nom : {
    type: String,
    required: true
  },

  photo : {
    type: String,
  },

  adresseMail: {
    type: String,
    required: true, unique:true,
  },


  ville: {
    type: String,
  },

  pays: {
    type: String,
    required: true
  },

  pseudo: {
    type: String,
    required: true, unique:true,
  },
});

UserSchema.plugin(passportLocalMongoose, {
  usernameQueryFields: ["adresseMail"],
  limitAttemps: true,
  maxAttemps:5,
  usernameUnique: true
})

return mongoose.model("User", UserSchema);


}
//
// const mongoose = require('mongoose');
// const passwordHash = require('password-hash');
// const jwt = require('jwt-simple');
// const config = require('../../config/config');
//
// var userSchema = mongoose.Schema({
// 	email: {
// 		type: String,
// 		lowercase: true,
// 		trim: true,
// 		unique: true,
// 		required: true
// 	},
// 	password: {
//         type: String,
//         required: true
//     }
// },{ timestamps: { createdAt: 'created_at' }})
//
//
// userSchema.methods = {
// 	authenticate: function (password) {
// 		return passwordHash.verify(password, this.password);
// 	},
// 	getToken: function () {
// 		return jwt.encode(this, config.secret);
// 	}
// }

module.exports = mongoose.model('User', userSchema);
