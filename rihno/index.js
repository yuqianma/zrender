var zrender = require('../dist/zrender-rihno');

var id = 0;

function createCanvas () {
    // return getCanvasProxied({
    //     width: 400,
    //     height: 300,
    //     __id: ++id
    // });

    return getCanvasContextProxied({
        width: 400,
        height: 300,
        __id: ++id,
    });
}

zrender.$override('createCanvas', createCanvas);
zrender.$override('measureText', function () {
    console.log('measureText', [].slice.apply([], arguments));
    return {
        width: 0,
        height: 0
    };
});

var canvas = createCanvas();

var zr = zrender.init(canvas);

zr.add(new zrender.Rect({
    shape: {
        x: 10,
        y: 10,
        width: 100,
        height: 100
    },
    style: {
        fill: '#' + (0x1000000 + 0x1000000 * Math.random() | 0).toString(16).substr(1),
        text: new Date()
    }
}));

setTimeout(function () {
    console.log('--- canvas amount: ', id);
}, 100);

var FN_NAMES = {
    'save'                : 1,
    'restore'             : 1,
    'scale'               : 1,
    'rotate'              : 1,
    'translate'           : 1,
    'transform'           : 1,
    'setTransform'        : 1,
    'resetTransform'      : 1,
    'createLinearGradient': 1,
    'createRadialGradient': 1,
    'createPattern'       : 1,
    'clearRect'           : 1,
    'fillRect'            : 1,
    'strokeRect'          : 1,
    'beginPath'           : 1,
    'fill'                : 1,
    'stroke'              : 1,
    'drawFocusIfNeeded'   : 1,
    'clip'                : 1,
    'isPointInPath'       : 1,
    'isPointInStroke'     : 1,
    'fillText'            : 1,
    'strokeText'          : 1,
    'measureText'         : 1,
    'drawImage'           : 1,
    'getImageData'        : 1,
    'putImageData'        : 1,
    'createImageData'     : 1,
    'setLineDash'         : 1,
    'getLineDash'         : 1,
    'closePath'           : 1,
    'moveTo'              : 1,
    'lineTo'              : 1,
    'quadraticCurveTo'    : 1,
    'bezierCurveTo'       : 1,
    'arcTo'               : 1,
    'rect'                : 1,
    'arc'                 : 1,
    'ellipse'             : 1
};

function getCanvasProxied (canvas) {

    getCanvasContextProxied(canvas);

    var handler = {
        get: function(obj, prop) {
            console.log(`canvas #${id} get ${prop}`);
            switch (prop) {
                case 'getContext':
                    return obj[prop];
                case 'nodeName':
                case 'style':
                    return null;
                default:
                    return obj[prop] || 1;
            }
        },
        set: function (obj, prop, value) {
            console.log(`${id} set ${prop} = ${value}`);
            obj[prop] = value;
            return true;
        }
    };

    return new Proxy(canvas, handler);
}

function getCanvasContextProxied (canvas) {
    var id = canvas.__id;

    var getContext = function () {
        console.log(`canvas #${id} getContext`);
        var handler = {
            get: function(obj, prop) {
                if (FN_NAMES[prop]) {
                    return function (...arg) {
                        console.log(`${id} call ${prop}(${arg.join()})`);
                        return true;
                    };
                }
                console.log(`${id} get ${prop}`);
                return 1;
            },
            set: function (obj, prop, value) {
                console.log(`${id} set ${prop} = ${value}`);
                obj[prop] = value;
                return true;
            }
        };

        return new Proxy({}, handler);
    };

    canvas.getContext = getContext.bind(canvas);
    return canvas;
}
