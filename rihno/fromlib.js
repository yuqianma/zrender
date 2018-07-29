const zrender = require('../lib/zrender');
const zrExport = require('../lib/export');
const Canvas = require('canvas');
const util = require('../lib/core/util');
const fs = require('fs');
const path = require('path');

let id = 0;

const createCanvas = () => {
    const canvas = new Canvas(400, 300);
    canvas.__id = ++id;
    debugCanvas(canvas);
    return canvas;
};

util.$override('createCanvas', createCanvas);

const canvas = createCanvas();

const zr = zrender.init(canvas);

zr.add(new zrExport.Rect({
    shape: {
        x: 10,
        y: 10,
        width: 100,
        height: 100
    },
    style: {
        fill: '#' + (0x1000000 + 0x1000000 * Math.random() | 0).toString(16).substr(1),
        // text: new Date()
    }
}));

setTimeout(function () {
    const out = fs.createWriteStream(path.join(__dirname, '../dist/test.png'));
    const stream = canvas.pngStream();

    stream.on('data', function(chunk){
        out.write(chunk);
    });

    stream.on('end', function(){
        console.log('-- saved png');
    });
}, 500);


// console.log(root.querySelectorAll('canvas')[0]);

function debugCanvas (canvas) {
    const id = canvas.__id;

    const originalGetContext = canvas.getContext.bind(canvas);

    const getContext = function () {
        console.log(`canvas #${id} getContext`);
        const ctx = originalGetContext('2d');
        const handler = {
            get: function(obj, prop) {
                const orig = obj[prop];
                if (typeof orig === 'function') {
                    return function (...arg) {
                        console.log(`${id} call ${prop}(${arg.join()})`);
                        return ctx[prop](...arg);
                    };
                }
                console.log(`${id} get ${prop}: ${orig}`);
                return orig;
            },
            set: function (obj, prop, value) {
                console.log(`${id} set ${prop} = ${value}`);
                obj[prop] = value;
                return true;
            }
        };

        return new Proxy(ctx, handler);
    };

    canvas.getContext = getContext.bind(canvas);
}
