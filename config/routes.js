const { lstatSync, readdirSync } = require("fs");
const { join } = require("path");

const isDirectory = source => lstatSync(source).isDirectory();
const getDirectories = source =>
    readdirSync(source)
        .map(name => join(source, name))
        .filter(isDirectory);

module.exports = function() {
    "use strict";

    const args =
        arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);

    getDirectories("./components").forEach(function(componentSubFolder) {
        readdirSync(componentSubFolder).forEach(file => {
            if (file.endsWith("Routes.js")) {
                console.log("[API] -> Load Routes from " + file);
                require(join(
                    process.cwd(),
                    componentSubFolder,
                    file.slice(0, -3)
                ))(...args);
            }
        });
    });
};
