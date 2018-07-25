module.exports = mongoose => {
    "use strict";

    const Schema = mongoose.Schema;

    /**
     * @swagger
     * definitions:
     *   Token:
     *     type: object
     *     required:
     *      - token
     *      - id_User
     *      - creation
     *     properties:
     *       token:
     *         type: string
     *       creation:
     *         type: date
     *         default: () => new Date().toISOString()
     *       id_User:
     *         $ref: '#/definitions/User'
     */
    const TokenSchema = Schema({
        token: {
            type: String,
            required: true
        },
        creation: {
            type: Date,
            required: true,
            default: () => new Date().toISOString()
        },
        id_User: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    });

    return mongoose.model("Token", TokenSchema);
};
