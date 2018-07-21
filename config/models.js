const { lstatSync, readdirSync } = require("fs");
const { join } = require("path");

const isDirectory = source => lstatSync(source).isDirectory();
const getDirectories = source =>
    readdirSync(source)
        .map(name => join(source, name))
        .filter(isDirectory);

module.exports = function() {
    "use strict";

    let models = [];

    const args =
        arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);

    getDirectories("./server/components").forEach(function(componentSubFolder) {
        readdirSync(componentSubFolder).forEach(file => {
            if (file.endsWith("Model.js")) {
                console.log("[Model] -> Load Model from " + file);
                let modelName = file.slice(0, -8);
                modelName =
                    modelName.charAt(0).toUpperCase() + modelName.slice(1, -1);

                models[modelName] = require(join(
                    process.cwd(),
                    componentSubFolder,
                    file.slice(0, -3)
                ))(...args);
            }
        });
    });

    return models;
};
