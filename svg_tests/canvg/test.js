const {createCanvas, loadImage} = require('canvas');
const fs = require('fs');
const _ = require('lodash');

//
// const canvg = require('canvg');
//
// canvg('canvas', canvas);

void async function () {

    const base0 = await loadImage('./svgs/base-1.svg');
    const base1 = await loadImage('./svgs/base-2.svg');
    const base2 = await loadImage('./svgs/base-3.svg');

    const body0 = await loadImage('./svgs/body-1.svg');
    const body1 = await loadImage('./svgs/body-2.svg');
    const body2 = await loadImage('./svgs/body-3.svg');

    const roof0 = await loadImage('./svgs/roof-1.svg');
    const roof1 = await loadImage('./svgs/roof-2.svg');
    const roof2 = await loadImage('./svgs/roof-3.svg');

    const bases = [
        {width: base0.width, height: base0.height, anchor: 92},
        {width: base1.width, height: base1.height, anchor: 69},
        {width: base2.width, height: base2.height, anchor: 114}
    ];

    const bodies = [
        {width: body0.width, height: body0.height, anchor: 277},
        {width: body1.width, height: body1.height, anchor: 414},
        {width: body2.width, height: body2.height, anchor: 92}
    ];

    const roofs = [
        {width: roof0.width, height: roof0.height},
        {width: roof1.width, height: roof1.height},
        {width: roof2.width, height: roof2.height}
    ];

    const baseSvgs = [base0, base1, base2];
    const bodySvgs = [body0, body1, body2];
    const roofSvgs = [roof0, roof1, roof2];

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
    fs.writeFileSync(`./image/canvg/output-${randomBase}-${randomBody}-${randomRoof}.png`, buf);

    console.log(`done: output-${randomBase}-${randomBody}-${randomRoof}.png`);

}();
