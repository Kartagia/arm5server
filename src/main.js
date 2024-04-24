
/**
 * The server main of the ArM5 Tools using react.
 */

const express = require("express");
const path = require("path");

const app = new express();
app.use("/arm5", express.static("src/arm5tools/"));


const port = 3000;
const server = app.listen(port, function (err) {
    if (err) {
        console.err(`Failed to start server on part ${port}: ${err}`);
    } else {
    console.log(`ArM5Tools Server running on port ${port}`);
    }
});