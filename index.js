"use strict";

//Import Dependencies
const express = require("express");
const bodyParser = require("body-parser");
const nconf = require("nconf");
const { join } = require("path");
const responseTime = require("response-time");
const mongoose = require("mongoose");
const passport = require("passport");
const path = require("path");
const hash = require("object-hash");
const Raven = require("raven");
const Logger = require("le_node");
const winston = require("winston");
const MESSAGE = Symbol.for("message");

//Load App Variables
nconf.argv().env();

//Required App Variables
nconf.required(["MONGODB_URI", "JWT_SECRET", "JWT_TIME", "MAIL_FROM"]);

global.appRoot = path.resolve(__dirname);

if (nconf.get("SENTRY_KEY")) {
    Raven.config(nconf.get("SENTRY_KEY")).install();
    process.on("uncaughtException", err => {
        Raven.captureException(err);
    });
}

global.catchError = err => {
    if (nconf.get("SENTRY_KEY")) {
        Raven.captureException(err);
    }
    console.log(err);
};

if (nconf.get("LE_KEY")) {
    global.logger = new Logger({ token: nconf.get("LE_KEY") });
} else {
    const jsonFormatter = logEntry => {
        const base = { timestamp: new Date() };
        const json = Object.assign(base, logEntry);
        logEntry[MESSAGE] = JSON.stringify(json);
        return logEntry;
    };

    global.logger = winston.createLogger({
        transports: [
            new winston.transports.File({
                json: false,
                name: "info-file",
                meta: {
                    "@marker": ["nodejs", "sourcecode"]
                },
                filename: "local/appLogs.log",
                format: winston.format(jsonFormatter)()
            })
        ]
    });
}

logger.info("Start Server");

///////////////////////////////////////////////////////////////////////////////

//DATABASE CONFIGURATION

//MONGODB : Database Connection
mongoose.Promise = global.Promise;

const Models = require(join(process.cwd(), "server", "config", "models"))(
    mongoose
);

mongoose.connect(nconf.get("MONGODB_URI"));

///////////////////////////////////////////////////////////////////////////////
//PASSPORT CONFIGURATION

const User = Models.User;

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

///////////////////////////////////////////////////////////////////////////////
//ADMIN INITIALISATION
User.count({}, (err, count) => {
    if (count == 0) {
        //NO ADMIN IN DATABASE SO ADD IT ONE
        let newUser = new User({
            email: "admin-toreplace-quickly@ages.com",
            active: true,
            verified: true,
            group: "superadmin"
        });

        const newUserPwd = hash({ user: "admin", date: Date.now() });

        newUser.setPassword(newUserPwd, err => {
            newUser.save((err, result) => {
                console.log("\x1b[31m", "[DB INIT] -> /!\\ ----------- /!\\");
                console.log(
                    "\x1b[31m",
                    "[DB INIT] -> ! - NEW SUPERADMIN USER - !"
                );
                console.log(
                    "\x1b[31m",
                    "[DB INIT] -> USERNAME: " + result.email
                );
                console.log("\x1b[31m", "[DB INIT] -> PASSWORD: " + newUserPwd);
                console.log("\x1b[31m", "[DB INIT] -> /!\\ ----------- /!\\");
            });
        });
    }
});

///////////////////////////////////////////////////////////////////////////////

//API CONFIGURATION

//Load Express
const app = express();

//Set Global Var
app.set("APP", require("./package.json").name);
app.set("VERSION", require("./package.json").version);
app.set("JWT_TIME", nconf.get("JWT_TIME"));
app.set("JWT_SECRET", nconf.get("JWT_SECRET"));
app.set("MAIL_HOST", nconf.get("MAIL_HOST"));
app.set("MAIL_PASSWORD", nconf.get("MAIL_PASSWORD"));
app.set("MAIL_PORT", nconf.get("MAIL_PORT"));
app.set("MAIL_USER", nconf.get("MAIL_USER"));
app.set("MAIL_FROM", nconf.get("MAIL_FROM"));
app.set("SENDGRID_API", nconf.get("SENDGRID_API"));

//Mailer Import
const mailController = require("./server/tools/mail/mailController")(app);

//Add Error Log
if (nconf.get("SENTRY_KEY")) {
    app.use(Raven.requestHandler());
}

//Accept JSON & Url Encoded
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.use(
    bodyParser.json({
        limit: "50mb"
    })
);

//Add Response Time
app.use(responseTime());

//Add Form Invalid function
app.locals.returnFormInvalid = res => {
    res.status(400).json({
        error: "Form Invalid !"
    });
};

//EXPRESS : Express Configuration
app.all("*", (req, res, next) => {
    res.header("Access-Control-Allow-Credentials", false);
    res.header(
        "Access-Control-Allow-Methods",
        "GET, PUT, DELETE, POST, OPTIONS"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

//EXPRESS: URLs Restriction

const tokensMiddleware = require("./server/tools/auth/tokensMiddleware")(
    app,
    Models
);
const configUrls = require("./server/tools/auth/configUrls.json");

app.all("/api/*", (req, res, next) => {
    tokensMiddleware.checkTokens(req, res, next, configUrls);
});

//API : Get Routes
require(join(process.cwd(), "server", "config", "routes"))(
    app,
    Models,
    mailController
);

//Handle Error
if (nconf.get("SENTRY_KEY")) {
    // The error handler must be before any other error middleware
    app.use(Raven.errorHandler());

    // Optional fallthrough error handler
    app.use(function onError(err, req, res, next) {
        // The error id is attached to `res.sentry` to be returned
        // and optionally displayed to the user for support.
        res.statusCode = 500;
        res.end(res.sentry + "\n");
    });
}

app.use(express.static("client/build"));

//API : Default result
app.all("*", (req, res) => {
    res.send("client/build/index.html");
});

//EXPRESS : Start Server
app.disable("x-powered-by");
app.listen(nconf.get("PORT") || 80);

console.log("[API] -> Listening on Port : " + nconf.get("PORT"));

///////////////////////////////////////////////////////////////////////////////

//INTERVAL FILES

require(join(process.cwd(), "server", "config", "interval"))(app);

///////////////////////////////////////////////////////////////////////////////

//Add export to accept test
module.exports = app;
