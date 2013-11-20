"use strict";

var fs          = require('fs'),
    xml2js      = require('xml2js'),
    _           = require('underscore'),
    SvgParser   = require(__dirname + '/parser'),
    builder     = require('xmlbuilder');

var Svg = function(){};

Svg.prototype.elements = [];

/**
 * Set Svg Elements
 * @param {Array}       elements            SvgObject Array (rect|polygon|polyline|...)
 */
Svg.prototype.setElements = function(elements){
    this.elements = elements;
};

/**
 * Add SvgObject element to current SVG
 * @param {SvgObject}   element             SvgObject Element
 */
Svg.prototype.addElement = function(element){
    this.elements.push(element);
};

/**
 * Convert Svg to Json format
 * @param {boolean}     matrix              Applies Matrix and convert rect to polygon and circle to ellipse
 * @returns {object}                        Svg Json Object representation
 */
Svg.prototype.toJSON = function(matrix){
    var json = {
        elements : []
    };

    _.each(this.elements, function(element){
        json.elements.push(element.toJSON());
    });

    return json;
};

/**
 * Convert Svg to Xml format
 * @param {boolean}     matrix              Applies Matrix and convert rect to polygon and circle to ellipse
 * @returns {object}                        XMLBuilder Svg representation
 */
Svg.prototype.toXml = function(matrix){
    var xml = builder.create('svg');
    xml.att('version', '1.1');
    xml.att('xmlns', 'http://www.w3.org/2000/svg');

    _.each(this.elements, function(element){
        xml.children.push(element.toXml());
    });

    return xml;
};

/**
 * Convert SVG to String :
 *     '<svg>...</svg>'
 * @param {boolean}     matrix              Applies Matrix and convert rect to polygon and circle to ellipse
 * @returns {string}                        Svg String representation
 */
Svg.prototype.toString = function(matrix){
    return this.toXml(matrix).toString();
};

module.exports = Svg;

/**
 * Create Svg from Svg Document
 * @param {string}      path                Uri of source file
 * @param {function}    callback            Callback Function
 */
module.exports.fromSvgDocument = function(path, callback){
    fs.readFile(path, function(error, data){
        if(error){
            callback(error);
            return;
        }
        Svg.fromString(data.toString(), callback);
    });
};

/**
 * Create Svg from Xml String representation
 * @param {string}      string              Svg string representation
 * @param {function}    callback            Callback Function
 */
module.exports.fromString = function(string, callback){
    var parser  = new xml2js.Parser(),
        self    = this;

    parser.addListener('end', function(result) {
        SvgParser.convert(result, function(err, elements){
            if(err){
                callback(err);
                return;
            }

            var svg = new Svg();
            svg.setElements(elements);
            callback(null, svg);
        });
    });

    parser.parseString(string);
};