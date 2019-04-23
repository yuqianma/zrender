requireES([
    'src/zrender.js',
    'src/graphic/IncrementalDisplayable',
    'src/graphic/shape/Circle',
    'src/container/Group'
], function(
    zrender,
    IncrementalDisplayable,
    Circle,
    Group,
) {
    var zr = zrender.init(document.getElementById('main'));
    window.zr = zr;

    var group = new Group();
    zr.add(group);

    var w = zr.getWidth(), h = zr.getHeight();

    window.addData = function () {
        for(var i = 0; i < 1e5; i++) {
            var circleShape = new Circle({
                zlevel: 10,
                position: [Math.random() * w, Math.random() *h],
                shape: {
                    r: 1
                },
                style: {
                    fill: i > 500 ? '#0bd' : '#0b9',
                },
                incremental: true,
            });
            group.add(circleShape);
        }
    };

    addData();

    zr.add(new Circle({
        zlevel: 10,
        position: [200, 200],
        incremental: true,
        shape: {
            r: 10,
        },
        style: {
            fill: 'red'
        },
        onmouseover: e => e.target.setShape('r', 20),
        onmouseout: e => e.target.setShape('r', 10),
    }));
});
