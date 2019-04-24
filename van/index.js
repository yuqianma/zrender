import * as zrender from '../src/zrender';
import Circle from '../src/graphic/shape/Circle';
import G from '../src/container/G';



var zr = zrender.init(document.getElementById('main'));
window.zr = zr;

var w = zr.getWidth(), h = zr.getHeight();

var g = new G();
zr.add(g);

g.appendChild(new Circle({
    position: [100, 100],
    shape: {
        r: 10,
    },
    style: {
        fill: '#e55'
    }
}));

g.appendChild(new Circle({
    position: [200, 100],
    shape: {
        r: 10,
    },
    style: {
        fill: '#0bd'
    }
}));
