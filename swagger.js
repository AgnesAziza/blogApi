"use strict";

//Load Dependencies
const swaggerJSDoc = require("swagger-jsdoc");
const pathToSwaggerUi = require("swagger-ui-dist").absolutePath();

const express = require("express");
const { join } = require("path");
const nconf = require("nconf");

//Load Express
let app = express();

//Swagger definition
let swaggerDefinition = {
    info: {
        title: require("./package.json").name,
        version: require("./package.json").version,
        description: require("./package.json").description
    },
    host:
        (nconf.get("API_HOSTNAME") || "localhost") +
        ":" +
        (nconf.get("API_PORT") || 3000), //Access for the API
    basePath: "/"
};

// options for the swagger docs
let options = {
    // import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // path to the API docs
    apis: ["./components/**/*.js"]
};

// initialize swagger-jsdoc
let swaggerSpec = swaggerJSDoc(options);

app.use(express.static(pathToSwaggerUi));

// serve swagger
app.get("/swagger.json", function(req, res) {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

//EXPRESS : Start Server
app.disable("x-powered-by");
app.listen(9000);
console.info("Listening on " + "localhost" + ":" + "9000");
