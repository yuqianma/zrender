import * as zrUtil  from '../core/util';
import BoundingRect from '../core/BoundingRect';
import Displayable  from '../graphic/Displayable';
import Rect         from '../graphic/shape/Rect';

/**
 * @alias module:zrender/graphic/G
 * @constructor
 * @extends module:zrender/mixin/Transformable
 * @extends module:zrender/mixin/Eventful
 */
var G = function (opts) {

    opts = opts || {};

    // TODO Jeffrey: Displayable or Element
    Displayable.call(this, opts);

    // TODO Jeffrey: animation?
    // TODO Jeffrey: optimize no background
    this._background = new Rect({
        shape: {
            width: opts.width,
            height: opts.height
        },
        style: {
            fill: opts.backgroundColor,
            stroke: opts.borderColor,
            lineWidth: opts.borderWidth
        },
    });

    this._background.parentNode = this;

    this._renderList = [];

    this.childNodes = [];

    this.__storage = null;

    this.__dirty = true;
};

G.prototype = {
    constructor: G,

    /**
     * @type {string}
     */
    type: 'g',

    backgroundColor: null,

    borderColor: null,

    borderWidth: 0,

    /**
     * 添加子节点到最后
     * @param {module:zrender/Element} child
     * @return {module:zrender/Element|undefined}
     */
    appendChild: function (child) {
        if (!child || child === this) {
            // Theoretically, `child` shouldn't contain `this`, but checking it is too expensive.
            return;
        }

        var childNodes = this.childNodes;
        var lastChild = childNodes[childNodes.length - 1];

        if (child.parentNode === this) {
            if (lastChild && lastChild !== child) {
                var idx = childNodes.indexOf(child);

                // remove child from list, link prev node to next node
                childNodes.splice(idx, 1);
                if (idx > 0) {
                    childNodes[idx - 1].nextSibling = childNodes[idx];
                }

                childNodes.push(child);
                child.nextSibling = null;
                lastChild.nextSibling = child;
            }
        } else {
            child.parentNode && child.parentNode.removeChild(child);

            childNodes.push(child);
            child.parentNode = this;

            lastChild && (lastChild.nextSibling = child);
        }

        return child;
    },

    /**
     * 添加子节点在 nextSibling 之前
     * @param {module:zrender/Element} child
     * @param {module:zrender/Element} referenceNode
     * @return {module:zrender/Element|undefined}
     */
    insertBefore: function (child, referenceNode) {
        if (!child || child === this || referenceNode.parentNode !== this) {
            return;
        }

        var childNodes = this.childNodes;
        var refIdx = childNodes.indexOf(referenceNode);

        if (child.parentNode === this) {
            var idx = childNodes.indexOf(child);
            if (idx !== refIdx && idx + 1 !== refIdx) {

                childNodes.splice(idx, 1);
                if (idx > 0) {
                    childNodes[idx - 1].nextSibling = childNodes[idx];
                }

                // update refIdx
                if (idx < refIdx) {
                    --refIdx;
                }

                // link node before referenceNode to new node
                if (refIdx > 0) {
                    childNodes[refIdx - 1].nextSibling = child;
                }

                // add new node
                childNodes.splice(refIdx, 0, child);
                child.nextSibling = referenceNode;
            }
        } else {
            if (child.parentNode) {
                child.parentNode.removeChild(child);
            }
            if (refIdx > 0) {
                childNodes[refIdx - 1].nextSibling = child;
            }
            childNodes.splice(refIdx, 0, child);
            child.parentNode = this;
            child.nextSibling = referenceNode;
        }

        return child;
    },

    /**
     *
     * @param child
     * @returns {module:zrender/Element|undefined}
     */
    removeChild: function (child) {
        if (!child || child.parentNode !== this) {
            return;
        }

        var childNodes = this.childNodes;

        if (child.nextSibling) {
            var idx = childNodes.indexOf(child);
            childNodes.splice(idx, 1);
            if (idx > 0) {
                childNodes[idx - 1].nextSibling = childNodes[idx];
            }
        } else {
            // last
            childNodes.pop();
            var last = childNodes[childNodes.length - 1];
            if (last) {
                last.nextSibling = null;
            }
        }

        child.parentNode = null;
        child.nextSibling = null;

        return child;
    },

    updateChildNodes: function (updateChild) {
        this.updateTransform();
        var childNodes = this.childNodes;
        var renderListLen = 0;
        for (var i = 0; i < childNodes.length; ++i) {
            var node = childNodes[i];
            updateChild && node.update();
            if (!node.ignore) {
                this._renderList.push(childNodes[i]);
                ++renderListLen;
            }
        }

        this._renderList.length = renderListLen;

        // TODO Jeffrey: no zlevel
        this._renderList.sort(function (a, b) {
            if (a.zlevel === b.zlevel) {
                return a.z - b.z;
            }
            return a.zlevel - b.zlevel;
        });
    },

    update: function () {
        this.updateChildNodes(true);
        if (this.borderColor) {

        }
        this._background.update();
    },

    // TODO Jeffrey: zlevel
    // TODO Jeffrey: painter prevEl
    brush: function (ctx, prevEl) {
        this._background.brush(ctx, prevEl);
        prevEl = this._background;
        var renderList = this._renderList;

        for (var i = 0; i < renderList.length; ++i) {
            var node = renderList[i];
            node.beforeBrush && node.beforeBrush(ctx);
            node.brush(ctx, prevEl);
            node.afterBrush && node.afterBrush(ctx);
            prevEl = node;
        }
    },

    /**
     * @return {module:zrender/core/BoundingRect}
     */
    getBoundingRect: function () {
        if (!this._rect) {
            var rect = null;
            var tmpRect = new BoundingRect(0, 0, 0, 0);
            var children = this._renderList;
            var tmpMat = [];

            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child.ignore) {
                    continue;
                }

                var childRect = child.getBoundingRect();
                var transform = child.getLocalTransform(tmpMat);
                // TODO
                // The boundingRect cacluated by transforming original
                // rect may be bigger than the actual bundingRect when rotation
                // is used. (Consider a circle rotated aginst its center, where
                // the actual boundingRect should be the same as that not be
                // rotated.) But we can not find better approach to calculate
                // actual boundingRect yet, considering performance.
                if (transform) {
                    tmpRect.copy(childRect);
                    tmpRect.applyTransform(transform);
                    rect = rect || tmpRect.clone();
                    rect.union(tmpRect);
                }
                else {
                    rect = rect || childRect.clone();
                    rect.union(childRect);
                }
            }
            this._rect = rect || tmpRect;
        }

        return this._rect;
    },

    contain: function (x, y) {
        var localPos = this.transformCoordToLocal(x, y);
        // TODO Jeffrey: background
        var rect = this.getBoundingRect();

        if (rect.contain(localPos[0], localPos[1])) {
            for (var i = 0; i < this._renderList.length; i++) {
                var displayable = this._renderList[i];
                if (displayable.contain(x, y)) {
                    return true;
                }
            }
        }
        return false;
    }
};

zrUtil.inherits(G, Displayable);

export default G;
