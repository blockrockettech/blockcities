const SVGO = require('svgo');
const PATH = require('path');
const fs = require('fs');
const _ = require('lodash');

const svgo = new SVGO({
    plugins: [
        {cleanupAttrs: true,},
        {removeDoctype: true,},
        {removeXMLProcInst: true,},
        {removeComments: true,},
        {removeMetadata: true,},
        {removeTitle: true,},
        {removeDesc: true,},
        {removeUselessDefs: true,},
        {removeEditorsNSData: true,},
        {removeEmptyAttrs: true,},
        {removeHiddenElems: true,},
        {removeEmptyText: true,},
        {removeEmptyContainers: true,},
        {removeViewBox: false,},
        // {cleanupEnableBackground: true,},
        // {convertStyleToAttrs: true,},
        // {convertColors: true,},
        // {convertPathData: true,},
        // {convertTransform: true,},
        {removeUnknownsAndDefaults: true,},
        {removeNonInheritableGroupAttrs: true,},
        {removeUselessStrokeAndFill: true,},
        {removeUnusedNS: true,},
        {cleanupIDs: true,},
        {cleanupNumericValues: true,},
        // {moveElemsAttrsToGroup: true,},
        // {moveGroupAttrsToElems: true,},
        // {collapseGroups: true,},
        // {removeRasterImages: false,},
        // {mergePaths: true,},
        // {convertShapeToPath: true,},
        // {sortAttrs: true,},
        // {removeDimensions: true,},
        // {removeAttrs: {attrs: '(stroke|fill)'}}
    ]
});


_.forEach(['base', 'body', 'roof'], (type) => {

    _.forEach(['1', '2', '3'], (index) => {


        const file_name = `${type}-${index}`;

        const svgRawFile = fs.readFileSync(`./svgs/${file_name}.svg`);

        svgo
            .optimize(svgRawFile, {
                path: svgRawFile.path
            })
            .then(function (result) {

                console.log(result);

                // {
                //     // optimized SVG data string
                //     data: '<svg width="10" height="20">test</svg>'
                //     // additional info such as width/height
                //     info: {
                //         width: '10',
                //         height: '20'
                //     }
                // }

                fs.writeFileSync(`./svg_tests/optimized/${file_name}-svgo-clean.svg`, result.data);

            });

    });

});
