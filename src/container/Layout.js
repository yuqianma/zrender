import * as zrUtil  from '../core/util';
import BoundingRect from '../core/BoundingRect';
import G            from './G';
import Rect         from '../graphic/shape/Rect';

var Layout = function (opts) {
    opts = opts || {};

    G.call(this, opts);
};

Layout.prototype = {
    constructor: Layout,

    type: 'layout',

    update: function () {
        G.prototype.updateChildNodes.call(this);

        // calculate this._rect
        // TODO Jeffrey: 可以少遍历一遍
        var rect = this.getBoundingRect();
        // this._background.position = [rect.x, rect.y];
        // this._background.shape.width = rect.width;
        // this._background.shape.height = rect.height;
        this._background.update();
    },
};

zrUtil.inherits(Layout, G);

export default Layout;
