const fs = require('fs');

const sharp = require('sharp');

sharp({create: {width: 240, height: 600, channels: 4, background: {r: 255, g: 0, b: 0, alpha: 0.4}}})
    .overlayWith('./svgs/body-3.svg', {left: 0, top: 300})
    // .overlayWith('./svgs/roof-2.svg', {
    //     left: 0,
    //     top: 100
    // })
    .png()
    .toBuffer()
    .then(function (outputBuffer) {
        // outputBuffer contains upside down, 300px wide, alpha channel flattened
        // onto orange background, composited with overlay.png with SE gravity,
        // sharpened, with metadata, 90% quality WebP image data. Phew!

        fs.writeFileSync(`./svg_tests/sharpjs/output.png`, outputBuffer);
    });
