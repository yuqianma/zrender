import * as zrUtil  from '../core/util';
import BoundingRect from '../core/BoundingRect';
import Displayble   from '../graphic/Displayable';

/**
 * @alias module:zrender/graphic/G
 * @constructor
 * @extends module:zrender/mixin/Transformable
 * @extends module:zrender/mixin/Eventful
 */
var G = function (opts) {

    opts = opts || {};

    Displayble.call(this, opts);

    for (var key in opts) {
        if (opts.hasOwnProperty(key)) {
            this[key] = opts[key];
        }
    }

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

    /**
     * 所有子孙元素是否响应鼠标事件
     * @type {boolean}
     * @default false
     */
    silent: false,

    // /**
    //  * @return {Array.<module:zrender/Element>}
    //  */
    // children: function () {
    //     return this.childNodes.slice();
    // },
    //
    // /**
    //  * 获取指定 index 的儿子节点
    //  * @param  {number} idx
    //  * @return {module:zrender/Element}
    //  */
    // childAt: function (idx) {
    //     return this.childNodes[idx];
    // },
    //
    // /**
    //  * 获取指定名字的儿子节点
    //  * @param  {string} name
    //  * @return {module:zrender/Element}
    //  */
    // childOfName: function (name) {
    //     var children = this.childNodes;
    //     for (var i = 0; i < children.length; i++) {
    //         if (children[i].name === name) {
    //             return children[i];
    //         }
    //     }
    // },
    //
    // /**
    //  * @return {number}
    //  */
    // childCount: function () {
    //     return this.childNodes.length;
    // },
    //
    // /**
    //  * 添加子节点到最后
    //  * @param {module:zrender/Element} child
    //  */
    // add: function (child) {
    //     if (child && child !== this && child.parentNode !== this) {
    //
    //         this.childNodes.push(child);
    //
    //         this._doAdd(child);
    //     }
    //
    //     return this;
    // },

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
        // TODO, add


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
        // TODO, add

        return child;
    },

    /**
     *
     * @param child
     * @returns {module:zrender/Element|undefined}
     */
    removeChild: function (child) {
        if (child.parentNode !== this) {
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

    update: function () {
        this.updateTransform();
        for (var i = 0; i < this.childNodes.length; ++i) {
            this.childNodes[i].update();
        }
    },

    brush: function (ctx, prevEl) {
        for (var i = 0; i < this.childNodes.length; ++i) {
            var node = this.childNodes[i];
            node.beforeBrush && node.beforeBrush(ctx);
            node.brush(ctx, prevEl);
            node.afterBrush && node.afterBrush(ctx);
            prevEl = node;
        }
    },

    // /**
    //  * 添加子节点在 nextSibling 之前
    //  * @param {module:zrender/Element} child
    //  * @param {module:zrender/Element} nextSibling
    //  */
    // addBefore: function (child, nextSibling) {
    //     if (child && child !== this && child.parentNode !== this
    //         && nextSibling && nextSibling.parentNode === this) {
    //
    //         var children = this.childNodes;
    //         var idx = children.indexOf(nextSibling);
    //
    //         if (idx >= 0) {
    //             children.splice(idx, 0, child);
    //             this._doAdd(child);
    //         }
    //     }
    //
    //     return this;
    // },

    // _doAdd: function (child) {
    //     if (child.parentNode) {
    //         child.parentNode.remove(child);
    //     }
    //
    //     child.parentNode = this;
    //
    //     var storage = this.__storage;
    //     var zr = this.__zr;
    //     if (storage && storage !== child.__storage) {
    //
    //         storage.addToStorage(child);
    //
    //         if (child instanceof Group) {
    //             child.addChildrenToStorage(storage);
    //         }
    //     }
    //
    //     zr && zr.refresh();
    // },

    // /**
    //  * 移除子节点
    //  * @param {module:zrender/Element} child
    //  */
    // remove: function (child) {
    //     var zr = this.__zr;
    //     var storage = this.__storage;
    //     var children = this.childNodes;
    //
    //     var idx = zrUtil.indexOf(children, child);
    //     if (idx < 0) {
    //         return this;
    //     }
    //     children.splice(idx, 1);
    //
    //     child.parentNode = null;
    //
    //     if (storage) {
    //
    //         storage.delFromStorage(child);
    //
    //         if (child instanceof Group) {
    //             child.delChildrenFromStorage(storage);
    //         }
    //     }
    //
    //     zr && zr.refresh();
    //
    //     return this;
    // },
    //
    // /**
    //  * 移除所有子节点
    //  */
    // removeAll: function () {
    //     var children = this.childNodes;
    //     var storage = this.__storage;
    //     var child;
    //     var i;
    //     for (i = 0; i < children.length; i++) {
    //         child = children[i];
    //         if (storage) {
    //             storage.delFromStorage(child);
    //             if (child instanceof Group) {
    //                 child.delChildrenFromStorage(storage);
    //             }
    //         }
    //         child.parentNode = null;
    //     }
    //     children.length = 0;
    //
    //     return this;
    // },
    //
    // /**
    //  * 遍历所有子节点
    //  * @param  {Function} cb
    //  * @param  {}   context
    //  */
    // eachChild: function (cb, context) {
    //     var children = this.childNodes;
    //     for (var i = 0; i < children.length; i++) {
    //         var child = children[i];
    //         cb.call(context, child, i);
    //     }
    //     return this;
    // },
    //
    // /**
    //  * 深度优先遍历所有子孙节点
    //  * @param  {Function} cb
    //  * @param  {}   context
    //  */
    // traverse: function (cb, context) {
    //     for (var i = 0; i < this.childNodes.length; i++) {
    //         var child = this.childNodes[i];
    //         cb.call(context, child);
    //
    //         if (child.type === 'group') {
    //             child.traverse(cb, context);
    //         }
    //     }
    //     return this;
    // },
    //
    // addChildrenToStorage: function (storage) {
    //     for (var i = 0; i < this.childNodes.length; i++) {
    //         var child = this.childNodes[i];
    //         storage.addToStorage(child);
    //         if (child instanceof Group) {
    //             child.addChildrenToStorage(storage);
    //         }
    //     }
    // },
    //
    // delChildrenFromStorage: function (storage) {
    //     for (var i = 0; i < this.childNodes.length; i++) {
    //         var child = this.childNodes[i];
    //         storage.delFromStorage(child);
    //         if (child instanceof Group) {
    //             child.delChildrenFromStorage(storage);
    //         }
    //     }
    // },

    dirty: function () {
        this.__dirty = true;
        this.__zr && this.__zr.refresh();
        return this;
    },

    /**
     * @return {module:zrender/core/BoundingRect}
     */
    getBoundingRect: function (includeChildren) {
        // TODO Caching
        var rect = null;
        var tmpRect = new BoundingRect(0, 0, 0, 0);
        var children = includeChildren || this.childNodes;
        var tmpMat = [];

        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.ignore || child.invisible) {
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
        return rect || tmpRect;
    }
};

zrUtil.inherits(G, Displayble);

export default G;
