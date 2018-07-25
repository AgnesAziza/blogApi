const nodemailer = require("nodemailer");
const htmlToText = require("html-to-text");
const handlebars = require("handlebars");
const { readdirSync, readFileSync } = require("fs");
const { join, resolve } = require("path");
const sgMail = require("@sendgrid/mail");

module.exports = app => {
    let mailController = {};

    const from = app.get("MAIL_FROM");

    let transporter;

    if (app.get("SENDGRID_API")) {
        sgMail.setApiKey(app.get("SENDGRID_API"));
    } else {
        transporter = nodemailer.createTransport({
            host: app.get("MAIL_HOST"),
            port: parseInt(app.get("MAIL_PORT")),
            secure: false, // true for 465, false for other ports
            auth: {
                user: app.get("MAIL_USER"), // generated ethereal user
                pass: app.get("MAIL_PASSWORD") // generated ethereal password
            }
        });
    }

    let models;

    readdirSync(join(appRoot, "templates", "mail")).forEach(file => {
        console.log("[MAILER] -> Load Mail Template " + file);

        const html = readFileSync(
            join(appRoot, "templates", "mail", file),
            {
                encoding: "utf-8"
            }
        );

        mailController[file.replace(".html", "")] = (to, subject, vars) => {
            const htmlResult = handlebars.compile(html)(vars || {});
            const textResult = htmlToText.fromString(htmlResult);

            const mail = {
                to: to, // list of receivers
                from: from,
                subject: subject, // Subject line
                html: htmlResult, // html body,
                text: textResult //Add Html to Text (Old Browser/Mail Client)
            };

            if (transporter) {
                // send mail with defined transport object
                transporter.sendMail(mail, (error, info) => {
                    if (error) {
                        logger.error(error);
                    }
                });
            } else {
                sgMail.send(mail);
            }
        };
    });

    return mailController;
};
