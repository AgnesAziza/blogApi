const jwt = require("jsonwebtoken");

module.exports = (app, Models) => {
    let tokenstools = {};

    const authTool = require("./authTool")();

    const { User, Token } = Models;

    tokenstools.checkTokens = (req, res, next, config) => {
        let token;

        if (req.get("Authorization")) {
            token = req.get("Authorization");
        }

        if (!token) {
            if (authTool.checkURL(req.originalUrl, req.method, config)) {
                next();
            } else {
                res.status(401).send({
                    error: "Access Forbidden ! "
                });
            }
        } else {
            Token.findOne(
                {
                    token: token
                },
                (err, data) => {
                    if (data) {
                        jwt.verify(
                            token,
                            app.get("JWT_SECRET"),
                            (err, decoded) => {
                                if (err) {
                                    Token.remove({ token: token }, err => {
                                        res.status(401).send({
                                            error:
                                                "Token Error, Please Renew Your Token !"
                                        });
                                    });
                                } else {
                                    User.findOne(
                                        { _id: data.id_User },
                                        (err, user) => {
                                            if (user) {
                                                req.currentUser = user;
                                                next();
                                            } else {
                                                Token.remove(
                                                    { token: data.token },
                                                    err => {
                                                        res.status(500).send({
                                                            error:
                                                                "User Not Found ! Token Error !"
                                                        });
                                                    }
                                                );
                                            }
                                        }
                                    );
                                }
                            }
                        );
                    } else {
                        res.status(401).send({
                            error: "Token Error, Please Renew Your Token !"
                        });
                    }
                }
            );
        }
    };

    return tokenstools;
};
