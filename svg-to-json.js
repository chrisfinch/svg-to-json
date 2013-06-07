// Make sure we got a filename on the command line.
if (process.argv.length < 3) {
  console.log("\r\nUsage: node svg-to-json.js svg_layer1.txt svg_layer2.txt ... svg_layerN.txt\r\n");
  process.exit(1);
}

var fs = require('fs');
var jsdom = require("jsdom");
var jquery = fs.readFileSync("./jquery.js").toString();
var Raphael = require("raphael-browserify");

var files = process.argv.splice(2, process.argv.length-2);

var fileData = [],
    names = [];

var read = function () {
  console.log("\r\n"+files.length+" files detected...");
  files.forEach(function (e, i) {
    console.log("\r\nReading file: ", e);
    var f = fs.readFileSync(e, "utf8"),
        name = e.replace(".txt", "");
    fileData.push({
      name: name,
      data: f
    });
    names.push(name);
    if (i == files.length-1) parse();
  });
};

var parse = function () {

    var len = fileData.length;

    var parsed = [];

    while (fileData.length > 0) {
      (function (f) {

        console.log("\r\nParsing a DOM for: ", f.name);

        jsdom.env({
          html: f.data,
          src: [jquery],
          done: function (errors, window) {
            var $ = window.$;

            var f_parsed = [];
            // each top level group
            var $g = $("svg").children("g").children("g");

            $g.each(function (i, e) {
              var callback = function (paths) {
                f_parsed.push({
                  name: $(e).parent().attr("id"),
                  paths: paths
                });
                if (i == $g.length-1) {
                  parsed.push({
                    name: f.name,
                    paths: f_parsed
                  });
                  if (parsed.length == len) write();
                }
              };
              grind($, $(e), callback);
            });

          }
        });
      })(fileData.shift());
    }

    var grind = function ($, $e, callback) {
      var data = [];

      $.when(
        $e.find("*").each(function (i, e) {

          var $e = $(e);

          switch (e.nodeName.toLowerCase()) {
            case "path":
              data.push({
                "type": "path",
                "fill": $e.attr("fill"),
                "path": $e.attr("d"),
                "stroke": $e.attr("stroke"),
                "opacity": typeof $e.attr("opacity") == "undefined" ? "1" : $e.attr("opacity"),
                "stroke-width": typeof $e.attr("stroke-width") == "undefined" ? "0" : $e.attr("stroke-width")
              });
            break;

            case "circle":
              data.push({
                "type": "circle",
                "fill": $e.attr("fill"),
                "cx": $e.attr("cx"),
                "cy": $e.attr("cy"),
                "r": $e.attr("r"),
                "stroke": $e.attr("stroke"),
                "stroke-width": typeof $e.attr("stroke-width") == "undefined" ? "0" : $e.attr("stroke-width")
              });
            break;

            case "polygon":
              data.push({
                "type": "path",
                "fill": $e.attr("fill"),
                "path": mungePolygon($e.attr("points")),
                "stroke": $e.attr("stroke"),
                "stroke-width": typeof $e.attr("stroke-width") == "undefined" ? "0" : $e.attr("stroke-width"),
                "opacity": typeof $e.attr("opacity") == "undefined" ? "1" : $e.attr("opacity")
              });
            break;

            case "text":
              data.push({
                "type": "text",
                "fill": $e.attr("fill"),
                "transform": mungeMatrix($e.attr("transform")),
                "font-family": $e.attr("font-family"),
                "font-size": $e.attr("font-size"),
                "text": $e.html()
              });
            break;
          }
        })

      ).then(function () {
        callback(data);
      });
    };

    var write = function () {

      // Check layers

      var l = parsed[0].paths.length, valid = true;
      parsed.forEach(function (e, i) {
        if (e.paths.length != l) valid = false;
      });
      if (!valid) {
        console.error("\r\nERROR: All files must have the same number of group layers.");
        process.exit(1);
      }
      console.log("\r\nLayers OK; attempting to write file...");

      // AHHHHHHHHHHHHHHHHHHHHHHH
      var out = [];

      parsed[0].paths.forEach(function (e, j) {
        var item = {
          name: e.name,
          paths: {}
        };
        for (var i = 0; i < parsed.length; i++) {
          var p = parsed[i].paths[j].paths;
          item.paths["layer_"+i] = p;
        }
        out.push(item);
      });


      var filename = names.join("-")+"_svg-to-json.json";

      fs.writeFile(filename, JSON.stringify(out), function(err) {
          if(err) {
              console.log(err);
          } else {
              console.log("\r\n"+filename+" was saved!\r\n");
          }
          process.exit(0); // Finish
      });

    };

};

var mungePolygon = function (pointString) {
  var poly  = ['M'],
      point = pointString.split(' ');

  for(var i=0; i < point.length; i++) {
     var c = point[i].split(',');
     for(var j=0; j < c.length; j++) {
        var d = parseFloat(c[j]);
        if (d)
          poly.push(d);
     }
     if (i === 0)
      poly.push('L');
  }
  poly.push('Z');
  return poly.toString();
};

var mungeMatrix = function (matrix) {
  var s = matrix.replace("matrix(", "").replace(")", "").split(" ");
  var m = Raphael.matrix(s[0], s[1], s[2], s[3], s[4], s[5]);
  return m.toTransformString();
};

// GO!!!
read();
