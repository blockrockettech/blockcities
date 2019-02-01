const {createCanvas, loadImage} = require('canvas');
const fs = require('fs');
const _ = require('lodash');
const parse = require('parse-svg-path');
const extract = require('extract-svg-path');

const parser = require('fast-xml-parser');

const window = require('svgdom');
const SVG = require('svg.js')(window);
const document = window.document;

void async function () {

    try {
        const base0 = await loadImage('./image/canvg-base-top/svgs/bases/base-1.svg');
        const base1 = await loadImage('./image/canvg-base-top/svgs/bases/base-2.svg');
        const base2 = await loadImage('./image/canvg-base-top/svgs/bases/base-3.svg');

        const body0 = await loadImage('./image/canvg-base-top/svgs/bodies/body-1.svg');
        const body1 = await loadImage('./image/canvg-base-top/svgs/bodies/body-2.svg');
        const body2 = await loadImage('./image/canvg-base-top/svgs/bodies/body-3.svg');

        const roof0 = await loadImage('./image/canvg-base-top/svgs/roofs/roof-1.svg');
        const roof1 = await loadImage('./image/canvg-base-top/svgs/roofs/roof-2.svg');
        const roof2 = await loadImage('./image/canvg-base-top/svgs/roofs/roof-3.svg');


        //https://jsfiddle.net/0pft5z7x/5/
// initialize SVG.js
//         var draw = SVG('drawing')
//
//         draw.svg(`<?xml version="1.0" standalone="no"?>
// <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate"
//      viewBox="320 762.102 240 230.94" width="240" height="230.94">
//     <switch>
//         <g id="base-1">
//             <path d=" M 320 831.384 L 440 900.666 L 440 993.042 L 320 923.76 L 320 831.384 Z " id="right-side"
//                   />
//             <path d=" M 560 831.384 L 560 923.76 L 440 993.042 L 440 900.666 L 560 831.384 Z " id="left-side" fill="yellow"
//                  />
//             <path d=" M 320 831.384 L 440 762.102 L 560 831.384 L 440 900.666 L 320 831.384 Z " id="base-top"
//                   "/>
//         </g>
//     </switch>
// </svg>`);
//
//         draw.select('path#left-side').fill('cyan');
//         draw.select('path#right-side').fill('orange');
//         draw.select('path#base-top').fill('purple');
//
//         alert(draw.svg());

        const bases = [
            {width: base0.width, height: base0.height, anchor: 81},
            {width: base1.width, height: base1.height, anchor: 81},
            {width: base2.width, height: base2.height, anchor: 81}
        ];

        const bodies = [
            {width: body0.width, height: body0.height, anchor: 232},
            {width: body1.width, height: body1.height, anchor: 232},
            {width: body2.width, height: body2.height, anchor: 232}
        ];

        const roofs = [
            {width: roof0.width, height: roof0.height},
            {width: roof1.width, height: roof1.height},
            {width: roof2.width, height: roof2.height}
        ];

        const baseSvgs = [
            base0,
            base1,
            base2
        ];
        const bodySvgs = [
            body0,
            body1,
            body2
        ];
        const roofSvgs = [
            roof0,
            roof1,
            roof2
        ];

        // const randomBase = 2;
        // const randomBody = 2;
        // const randomRoof = 2;

        const randomBase = 1;
        const randomBody = Math.floor(Math.random() * bodies.length);
        const randomRoof = Math.floor(Math.random() * roofs.length);

        console.log(`base ${randomBase} body ${randomBody} roof ${randomRoof}`);

        // height of the base, body, roof - minus the difference in the offset anchor from body and height
        const canvasHeight = bases[randomBase].height
            + bodies[randomBody].height
            + roofs[randomRoof].height
            - (bases[randomBase].height - bases[randomBase].anchor)
            - (bodies[randomBody].height - bodies[randomBody].anchor);

        // Always assume the base if the widest post for now
        const canvasWidth = bases[randomBase].width;

        const canvas = createCanvas(canvasWidth, canvasHeight);

        const ctx = canvas.getContext('2d');

        // Base
        ctx.drawImage(baseSvgs[randomBase], (canvasWidth - bases[randomBase].width) / 2, canvasHeight - bases[randomBase].height);

        // Body
        ctx.drawImage(bodySvgs[randomBody], (canvasWidth - bodySvgs[randomBody].width) / 2, canvasHeight - bases[randomBase].anchor - bodies[randomBody].height);

        // Roof
        ctx.drawImage(roofSvgs[randomRoof], (canvasWidth - roofSvgs[randomRoof].width) / 2, canvasHeight - bases[randomBase].anchor - bodies[randomBody].anchor - roofs[randomRoof].height);

        // console.log(canvas.toDataURL());

        // Temp - write file to disk
        // strip off the data: url prefix to get just the base64-encoded bytes
        const data = canvas.toDataURL().replace(/^data:image\/\w+;base64,/, '');
        const buf = new Buffer(data, 'base64');
        fs.writeFileSync(`./image/canvg-base-top/output/${randomBase}-${randomBody}-${randomRoof}.png`, buf);

        console.log(`done: output-${randomBase}-${randomBody}-${randomRoof}.png`);
    } catch (e) {
        console.error(e);
    }
}();
