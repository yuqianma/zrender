import * as zrender from '../src/zrender';
import Circle from '../src/graphic/shape/Circle';
import Rect from '../src/graphic/shape/Rect';
import G from '../src/container/G';
import Layout from '../src/container/Layout';

const zr = zrender.init(document.getElementById('main'));
window.zr = zr;

const w = zr.getWidth(), h = zr.getHeight();

const g = new G({
    position: [100, 100],
    width: 300,
    height: 400,
    // overflow: 'hidden',
    backgroundColor: 'rgba(0, 187, 153, 0.3)',
    borderWidth: 2,
    borderColor: '#555',
});
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

const layout = new Layout({
    position: [500, 100],
    // padding: 10,
    width: 310,
    height: 400,
    // overflow: 'hidden',
    backgroundColor: 'rgba(0, 187, 153, 0.3)',
    borderWidth: 2,
    borderColor: '#555',
});

zr.add(layout);

for (let i = 0; i < 5; ++i) {
    layout.appendChild(new Rect({
        margin: 10,
        shape: {
            width: 80,
            height: 50,
        },
        style: {
            fill: `#0bd`,
            stroke: 'red',
            text: i,
        }
    }));
}
