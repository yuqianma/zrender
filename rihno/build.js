const path = require('path');

function getPath(relativePath) {
    return path.resolve(__dirname, '../', relativePath);
}

module.exports = {
    input: getPath('rihno/export.js'),
    legacy: true, // Support IE8-
    output: {
        name: 'zrender',
        format: 'umd',
        legacy: true, // Must be declared both in inputOptions and outputOptions.
        sourcemap: false,
        file: getPath('dist/zrender-rihno.js')
    }
};
