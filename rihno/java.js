var zrender = require('../dist/zrender-rihno-umd');

(function () {
    var root = this, // global context
        timer = new java.util.Timer(),
        counter = 1,
        ids = {};

    function setTimeout(fn,delay) {
        var id = counter++;
        ids[id] = new JavaAdapter(java.util.TimerTask,{run: fn});
        timer.schedule(ids[id],delay);
        return id;
    }

    function clearTimeout(id) {
        ids[id].cancel();
        timer.purge();
        delete ids[id];
    }

    function setInterval(fn,delay) {
        var id = counter++;
        ids[id] = new JavaAdapter(java.util.TimerTask,{run: fn});
        timer.schedule(ids[id],delay,delay);
        return id;
    }

    root.setTimeout = setTimeout;
    root.clearTimeout = clearTimeout;
    root.setInterval = setInterval;
    root.clearInterval = setInterval;
})();

var id = 0;

var draw = prepareFrame();

function createCanvas () {
    return getCanvasStubbed({
        width: 400,
        height: 300,
        __id: ++id
    });
}

// main methods to override
zrender.$override('createCanvas', createCanvas);
zrender.$override('measureText', function () {
    return {
        width: 0,
        height: 0
    };
});

function render () {
    var canvas = createCanvas();

    var zr = zrender.init(canvas);

    var rect = new zrender.Rect({
        shape: {
            x: 10,
            y: 10,
            width: 100,
            height: 100
        },
        style: {
            fill: '#' + (0x1000000 + 0x1000000 * Math.random() | 0).toString(16).substr(1)
            // ,text: new Date()
        }
    });
    zr.add(rect);

    rect.animateShape()
        .when(1000, {
            x: 50
        })
        .start();

    setTimeout(function () {
        print('--- canvas amount: ', id);
    }, 100);
}

render();

// ----- helper

function getCanvasStubbed (canvas) {
    return getCanvasContextStubbed(canvas);
}

function getCanvasContextStubbed (canvas) {
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
        'clip'                : 1,
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

    var id = canvas.__id;

    var noop = function () {};
    var ctx = {};
    Object.keys(FN_NAMES).forEach(function (name) {
        ctx[name] = function () {
            print(name);
            if (name === 'rect') {
                draw.rect({
                    x: arguments[0],
                    y: arguments[1],
                    width: arguments[2],
                    height: arguments[3]
                });
            }
        };
    });

    var getContext = function () {
        return ctx;
    };

    canvas.getContext = getContext.bind(canvas);
    return canvas;
}

function prepareFrame () {
    var f = new java.awt.Frame("Canvas Example");
    f.setLayout(null);
    f.setSize(400, 300);
    f.setVisible(true);

    var x, y, width, height;
    x = y = width = height = 0;

    var myCanvas = new JavaAdapter(java.awt.Canvas, {
        paint: function (g) {
            g.setColor(java.awt.Color.blue);
            g.fillRect(x, y, width, height);
        }
    });

    myCanvas.setSize(400, 300);
    f.add(myCanvas);

    return {
        rect: function (opt) {
            print('draw rect', opt);
            x = opt.x;
            y = opt.y;
            width = opt.width;
            height = opt.height;
            myCanvas.repaint();
        }
    };
}


