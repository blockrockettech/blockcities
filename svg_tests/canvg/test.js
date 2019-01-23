const {createCanvas, loadImage} = require('canvas');
const fs = require('fs');

//
// const canvg = require('canvg');
//
// canvg('canvas', canvas);


void async function () {

    const canvasHeight = 1000;
    const canvasWidth = 240;


    const bases = [{height:231, anchor:92}];
    const bodies = [{height:416, anchor:277}];
    const roofs = [{height:185, anchor:-1}];

    const base0 = await loadImage('./svgs/base-1.svg');
    const body0 = await loadImage('./svgs/body-1.svg');
    const roof0 = await loadImage('./svgs/roof-1.svg');

    const baseSvgs = [base0];
    const bodySvgs = [body0];
    const roofSvgs = [roof0];

    const canvas = createCanvas(canvasWidth, canvasHeight);

    const ctx = canvas.getContext('2d');

    ctx.drawImage(baseSvgs[0], 0, canvasHeight - bases[0].height);

    ctx.drawImage(bodySvgs[0], 0, canvasHeight - bases[0].anchor - bodies[0].height);

    ctx.drawImage(roofSvgs[0], 0, canvasHeight - bases[0].anchor - bodies[0].anchor - roofs[0].height);

    console.log(canvas.toDataURL());


    // fs.writeFileSync(`./svg_tests/canvg/output.png`, canvas.toDataURL());

    // strip off the data: url prefix to get just the base64-encoded bytes
    var data = canvas.toDataURL().replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, 'base64');
    fs.writeFileSync(`./svg_tests/canvg/output.png`, buf);

}();
