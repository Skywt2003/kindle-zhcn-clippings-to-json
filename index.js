"use strict";

const Clipper = require("./clippings");
const clipper = new Clipper();

function toObject(text){
    return clipper.getParsed(text);
}

module.exports = toObject;