const fs = require('fs');

const sharp = require('sharp');

sharp('./svgs/base-1.svg')
    // .rotate(180)
    // .resize(300)
    // .flatten( { background: '#ff6600' } )
    .overlayWith('./svgs/body-3.svg', {
        gravity: sharp.gravity.northeast
    })
    .overlayWith('./svgs/roof-2.svg', {
        gravity: sharp.gravity.northeast
    })
    // .sharpen()
    // .withMetadata()
    // .webp( { quality: 90 } )
    .toBuffer()

    .then(function (outputBuffer) {
        // outputBuffer contains upside down, 300px wide, alpha channel flattened
        // onto orange background, composited with overlay.png with SE gravity,
        // sharpened, with metadata, 90% quality WebP image data. Phew!


        fs.writeFileSync(`./svg_tests/sharpjs/output.png`, outputBuffer);
    });
