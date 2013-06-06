# svg-to-json.js

A super dirty script for importing svg data output by Adobe Illustrator and similar to JSON suitable for use by Raphael.js

## How it works

### Input:

  SVG DOM code from Adobe Illustrator or simlar saved in a text file (Save >> Format SVG >> SVG code button).

  SVG's must be grouped in to elements via illustrators group function (cmd+g) so that the SVG DOM structure shows paths grouped under `<g />` elements.

- Sample input

    `<?xml version="1.0" encoding="utf-8"?>
    <!-- Generator: Adobe Illustrator 16.0.4, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="976px"
       height="325px" viewBox="0 0 976 325" enable-background="new 0 0 976 325" xml:space="preserve">
      <g>
        <g>
          <polygon fill="#000000" opacity="0.8" points="790.21,58.482 743.21,58.482 743.21,80.482 758.599,80.482 767.21,89.093 775.819,80.482
            790.21,80.482       "/>
          <g>
            <path fill="#FFFFFF" d="M770.351,65.494v1.947h1.766v0.938h-1.766v3.656c0,0.84,0.238,1.316,0.924,1.316
              c0.322,0,0.561-0.042,0.715-0.084l0.057,0.925c-0.238,0.098-0.617,0.168-1.093,0.168c-0.575,0-1.036-0.182-1.331-0.519
              c-0.35-0.364-0.477-0.966-0.477-1.765v-3.698h-1.051v-0.938h1.051v-1.625L770.351,65.494z"/>
            <path fill="#FFFFFF" d="M779.551,70.775c0,2.507-1.737,3.6-3.376,3.6c-1.834,0-3.25-1.345-3.25-3.488
              c0-2.269,1.485-3.6,3.362-3.6C778.234,67.287,779.551,68.702,779.551,70.775z M774.172,70.845c0,1.485,0.854,2.605,2.06,2.605
              c1.176,0,2.059-1.106,2.059-2.633c0-1.148-0.574-2.605-2.031-2.605S774.172,69.556,774.172,70.845z"/>
          </g>
        </g>
      </g>
    </svg>`

### Output

  You will recieve a JSON file in the following format:

    [ { name: 'Element 1',
      paths: { layer_0: [Object], layer_1: [Object], layer_2: [Object] } },
    { name: 'Element 2',
      paths: { layer_0: [Object], layer_1: [Object], layer_2: [Object] } },
    { name: 'Element n',
      paths: { layer_0: [Object], layer_1: [Object], layer_2: [Object] } } ]

  Each top level group in the SVG DOM will have its respective paths merged from all the input files such that each element conatins all the layer states for itself. For example a button with an "off", "hovered" and "active" state will be arrange like this:

    [ { name: 'My Button',
    paths: {
        layer_0: [Object], // Off state
        layer_1: [Object], // Hover state
        layer_2: [Object] // Active state
      }
    } ];

  Each individual svg element object will be in the correct formatting for processing by Raphael's `Raphael.paper().add()` method as detailed (here)[http://raphaeljs.com/reference.html#Paper.add].

## Usage

    cd svg-to-json

    npm install

    node svg-to-json.js filename1.txt filename2.txt filename3.txt
