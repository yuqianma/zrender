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
        this.updateChildNodes();

        var width = this.width,
            height = this.height;

        var left = 0, top = 0;

        // TODO Jeffrey: 还有border，真是深坑啊告退告退……
        if (this.padding) {
            var padding = zrUtil.normalizeCssArray(this.padding);
            width -= padding[3];
            width -= padding[1];
            width = Math.max(0, width);
            // height -= padding[0];
            // height -= padding[2];
            // height = Math.max(0, height);
            left = padding[3];
            top = padding[0];
        }

        var x = left, y = top, lineHeight = 0;

        var renderList = this._renderList;
        for (var i = 0; i < renderList.length; ++i) {
            var node = renderList[i];
            var rect = node.getBoundingRect();
            var rectWidth = rect.width;
            var rectHeight = rect.height;

            var margin = zrUtil.normalizeCssArray(node.margin || 0);

            rectWidth += margin[1];
            rectHeight += margin[2];

            if (x + margin[3] + rectWidth > width) {
                x = left;
                y = y + lineHeight;
                lineHeight = 0;
            }
            node.position = [x + margin[3], y + margin[0]];
            node.update();
            x = x + margin[3] + rectWidth;
            lineHeight = Math.max(lineHeight, rectHeight);
        }

        this._background.update();
    },
};

zrUtil.inherits(Layout, G);

export default Layout;
