const {createCanvas, loadImage} = require('canvas');
const fs = require('fs');

//
// const canvg = require('canvg');
//
// canvg('canvas', canvas);


void async function () {

    const base = await loadImage('./svgs/base-1.svg');
    const body = await loadImage('./svgs/body-1.svg');
    const roof = await loadImage('./svgs/roof-1.svg');

    const canvas = createCanvas(240, 1000);

    const ctx = canvas.getContext('2d');

    ctx.drawImage(base, 0, 300);

    ctx.drawImage(body, 0, 300);

    ctx.drawImage(roof, 0, 300);

    console.log(canvas.toDataURL());


    // fs.writeFileSync(`./svg_tests/canvg/output.png`, canvas.toDataURL());

}();
