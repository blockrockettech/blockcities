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
        {width: base2.width, height: base2.height, anchor: 92}
    ];
    const bodies = [
        {height: body0.height, anchor: 277},
        {height: body1.height, anchor: 414},
        {height: body2.height, anchor: 92}
    ];
    const roofs = [
        {height: roof0.height},
        {height: roof1.height},
        {height: roof2.height}
    ];

    const baseSvgs = [base0, base1, base2];
    const bodySvgs = [body0, body1, body2];
    const roofSvgs = [roof0, roof1, roof2];

    const canvasHeight = 1000;
    const canvasWidth = _.maxBy(bases, (b) => b.width).width;

    const canvas = createCanvas(canvasWidth, canvasHeight);

    const ctx = canvas.getContext('2d');

    const randomBase = Math.floor(Math.random() * bases.length);
    const randomBody = Math.floor(Math.random() * bodies.length);
    const randomRoof = Math.floor(Math.random() * roofs.length);
    console.log(`base ${randomBase} body ${randomBody} roof ${randomRoof}`);

    ctx.drawImage(baseSvgs[randomBase], (canvasWidth - bases[randomBase].width) / 2, canvasHeight - bases[randomBase].height);

    ctx.drawImage(bodySvgs[randomBody], 40, canvasHeight - bases[randomBase].anchor - bodies[randomBody].height);

    ctx.drawImage(roofSvgs[randomRoof], 40, canvasHeight - bases[randomBase].anchor - bodies[randomBody].anchor - roofs[randomRoof].height);

    // console.log(canvas.toDataURL());

    // strip off the data: url prefix to get just the base64-encoded bytes
    var data = canvas.toDataURL().replace(/^data:image\/\w+;base64,/, '');
    var buf = new Buffer(data, 'base64');
    fs.writeFileSync(`./svg_tests/canvg/output-${randomBase}-${randomBody}-${randomRoof}.png`, buf);

    console.log(`done: output-${randomBase}-${randomBody}-${randomRoof}.png`);

}();
