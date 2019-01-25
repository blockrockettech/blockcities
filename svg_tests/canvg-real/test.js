const {createCanvas, loadImage} = require('canvas');
const fs = require('fs');
const _ = require('lodash');

//
// const canvg = require('canvg');
//
// canvg('canvas', canvas);

void async function () {

    try {
        const base0 = await loadImage('./svg_tests/canvg-real/svgs/bases/432-park-curt-base.svg');
        const base1 = await loadImage('./svg_tests/canvg-real/svgs/bases/432-park-horiz-base.svg');
        const base2 = await loadImage('./svg_tests/canvg-real/svgs/bases/432-park-rect-base.svg');
        const base3 = await loadImage('./svg_tests/canvg-real/svgs/bases/432-park-vert-base.svg');

        const body0 = await loadImage('./svg_tests/canvg-real/svgs/bodies/body-curt-windows.svg');
        const body1 = await loadImage('./svg_tests/canvg-real/svgs/bodies/body-horiz-windows.svg');
        const body2 = await loadImage('./svg_tests/canvg-real/svgs/bodies/body-rect-windows.svg');
        const body3 = await loadImage('./svg_tests/canvg-real/svgs/bodies/body-vert-windows.svg');

        const roof0 = await loadImage('./svg_tests/canvg-real/svgs/roofs/432-park-roof.svg');
        const roof1 = await loadImage('./svg_tests/canvg-real/svgs/roofs/200-vesey-roof.svg');
        const roof2 = await loadImage('./svg_tests/canvg-real/svgs/roofs/pool-roof-11.svg');

        const bases = [
            {width: base0.width, height: base0.height, anchor: 81},
            {width: base1.width, height: base1.height, anchor: 81},
            {width: base2.width, height: base2.height, anchor: 81},
            {width: base3.width, height: base3.height, anchor: 81}
        ];

        const bodies = [
            {width: body0.width, height: body0.height, anchor: 230},
            {width: body1.width, height: body1.height, anchor: 230},
            {width: body2.width, height: body2.height, anchor: 230},
            {width: body3.width, height: body3.height, anchor: 230}
        ];

        const roofs = [
            {width: roof0.width, height: roof0.height},
            {width: roof1.width, height: roof1.height},
            {width: roof2.width, height: roof2.height}
        ];

        const baseSvgs = [
            base0,
            base1,
            base2,
            base3
        ];
        const bodySvgs = [
            body0,
            body1,
            body2,
            body3,
        ];
        const roofSvgs = [
            roof0,
            roof1,
            roof2
        ];

        // const randomBase = 2;
        // const randomBody = 2;
        // const randomRoof = 2;

        const randomBase = Math.floor(Math.random() * bases.length);
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
        fs.writeFileSync(`./svg_tests/canvg-real/output/${randomBase}-${randomBody}-${randomRoof}.png`, buf);

        console.log(`done: output-${randomBase}-${randomBody}-${randomRoof}.png`);
    } catch (e) {
        console.error(e);
    }
}();
