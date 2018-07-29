import { $override as textOverride } from '../src/contain/text';
import { $override as utilOverride } from '../src/core/util';
export * from '../src/export';
export * from '../src/zrender';

const Methods = {
    createCanvas: 'createCanvas',
    measureText: 'measureText'
};
export function $override(name, fn) {
    if (name === Methods.createCanvas) {
        utilOverride(Methods.createCanvas, fn);
    } else
    if (name === Methods.measureText) {
        textOverride(Methods.measureText, fn);
    } else {
        throw 'no such method [' + name + ']';
    }

}
