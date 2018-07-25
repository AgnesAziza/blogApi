module.exports = mongoose => {
  "use strict";

const Schema = mongoose.Schema;

/**
 * @swagger
 * definitions:
 *   Article:
 *     type: object
 *     required:
 *      - texte
 *      - pays
 *      - id_User
 *     properties:
 *       texte:
 *         type: string
 *       photo:
 *         type: string
 *       datePublication:
 *         type: date
 *         default: () => new Date().toISOString()
 *       dateModification:
 *         type: date
 *         default: () => new Date().toISOString()
 *       ville:
 *         type: string
 *       pays:
 *         type: string
 *       id_User:
 *         $ref: '#/definitions/User'
 */

const ArticleSchema = Schema ({
  texte : {
    type: String,
    required: true
  },

  photo : {
    type: String,
  },

  datePublication : {
    type: Date,
    default : () => new Date().toISOString()
  },

  dateModification : {
    type: Date,
    default : () => new Date().toISOString()
  },

  ville: {
    type: String,
  },

  pays: {
    type: String,
    required: true
  },

  id_User: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

});

return mongoose.model("Article", ArticleSchema);


}
