const getBounds = require('svg-path-bounds');

let [left, top, right, bottom] = getBounds('M0 0L10 10 20 0Z');
