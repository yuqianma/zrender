import chai from 'chai';
import zrender from '../src/zrender';
import G from '../src/container/G';
import Rect from '../src/graphic/shape/Rect';

const { expect } = chai;

/* global describe,beforeEach,afterEach,before,after,it */

describe(`G container`, function () {
    describe(`#appendChild()`, function () {

        let g, rects;
        beforeEach(function () {
            g = new G();
            rects = [
                new Rect(),
                new Rect(),
                new Rect()
            ];
        });

        afterEach(function () {
            g = rects = null;
        });

        describe(`invalid node`, function () {
            it(`should return undefined when accept null or self`, function () {
                expect(g.appendChild()).to.be.undefined;
                expect(g.appendChild(g)).to.be.undefined;
                expect(g.childNodes).to.be.an('array').that.is.empty;
            });
        });

        describe(`single node`, function () {
            it(`should return appended node when accept node`, function () {
                const rect = rects[0];
                expect(g.appendChild(rect)).to.be.equal(rect);
                expect(g.appendChild(rect)).to.be.equal(rect);
            });
            it(`should have single item childNodes even when the same item added`, function () {
                const rect = rects[0];
                g.appendChild(rect);
                g.appendChild(rect);
                expect(g.childNodes).to.be.eql([rect]);
            });
            it(`should set node's parentNode to self`, function () {
                g.appendChild(rects[0]);
                expect(rects[0].parentNode).to.be.equal(g);
            });
        });

        describe(`three nodes`, function () {
            it(`should have three items childNodes with right nextSibling`, function () {
                g.appendChild(rects[0]);
                g.appendChild(rects[1]);
                g.appendChild(rects[2]);
                expect(g.childNodes).to.be.eql([rects[0], rects[1], rects[2]]);
                expect(rects[0].nextSibling).to.be.equal(rects[1]);
                expect(rects[1].nextSibling).to.be.equal(rects[2]);
                expect(rects[2].nextSibling).to.not.exist;
            });

            it(`should move item to the end`, function () {
                g.appendChild(rects[0]);
                g.appendChild(rects[1]);
                g.appendChild(rects[2]); // 0 1 2

                g.appendChild(rects[0]);
                expect(g.childNodes).to.be.eql([rects[1], rects[2], rects[0]]);
                g.appendChild(rects[2]);
                expect(g.childNodes).to.be.eql([rects[1], rects[0], rects[2]]);

                g.appendChild(rects[1]);
                expect(g.childNodes).to.be.eql([rects[0], rects[2], rects[1]]);
                expect(rects[0].nextSibling).to.be.equal(rects[2]);
                expect(rects[2].nextSibling).to.be.equal(rects[1]);
                expect(rects[1].nextSibling).to.not.exist;
            });
        });

        describe(`g1 appends g2's node`, function () {
            it(`should remove node from g2`, function () {
                const g2 = new G();
                g2.appendChild(rects[0]);
                g2.appendChild(rects[1]);
                g2.appendChild(rects[2]);

                g.appendChild(rects[1]);

                expect(g.childNodes).to.be.eql([rects[1]]);
                expect(rects[1].nextSibling).to.not.exist;
                expect(rects[1].parentNode).to.be.equal(g);

                expect(g2.childNodes).to.be.eql([rects[0], rects[2]]);
                expect(rects[0].nextSibling).to.be.equal(rects[2]);
            });
        });
    });

    describe(`#insertBefore()`, function () {
        let g, rects;
        beforeEach(function () {
            g = new G();
            rects = [
                new Rect(),
                new Rect(),
                new Rect()
            ];
        });

        afterEach(function () {
            g = rects = null;
        });

        // TODO: 每条spec一种结果，不要并在一个spec中

        describe(`has no childNodes, then`, function () {
            it(`should return undefined and have empty childNodes when accept null or self`, function () {
                expect(g.childNodes).to.be.an('array').that.is.empty;
                expect(g.insertBefore()).to.be.undefined;
                expect(g.insertBefore(g)).to.be.undefined;
                expect(g.childNodes).to.be.an('array').that.is.empty;
            });
        });

        describe(`has one childNodes, then`, function () {

            it(`should reject new node when no valid referenceNode provided`, function () {
                const g2 = new G();
                const otherRect = new Rect();
                g2.appendChild(otherRect);
                expect(g.insertBefore(rects[0], {})).to.be.undefined;
                expect(g.insertBefore(rects[0], otherRect)).to.be.undefined;
                expect(g.childNodes).to.be.an('array').that.is.empty;
            });
            it(`should insert new node when valid referenceNode provided`, function () {
                g.appendChild(rects[0]);
                expect(g.insertBefore(rects[1], rects[0])).to.be.equal(rects[1]);
                expect(g.childNodes).to.be.eql([rects[1], rects[0]]);
                expect(rects[1].nextSibling).to.be.equal(rects[0]);
                expect(rects[1].parentNode).to.be.equal(g);
            });
            it(`should move node when node has already been there`, function () {
                g.appendChild(rects[0]);
                expect(g.insertBefore(rects[0], rects[0])).to.be.equal(rects[0]);
                expect(g.childNodes).to.be.eql([rects[0]]);
                g.appendChild(rects[1]);
                expect(g.insertBefore(rects[0], rects[1])).to.be.equal(rects[0]);
                expect(g.childNodes).to.be.eql([rects[0], rects[1]]);
                expect(g.insertBefore(rects[1], rects[0])).to.be.equal(rects[1]);
                expect(g.childNodes).to.be.eql([rects[1], rects[0]]);
            });
        });

        describe(`has three childNodes, then`, function () {
            it(`should move last node to first`, function () {
                g.appendChild(rects[0]);
                g.appendChild(rects[1]);
                g.appendChild(rects[2]);
                expect(g.insertBefore(rects[2], rects[0])).to.be.equal(rects[2]);
                expect(g.childNodes).to.be.eql([rects[2], rects[0], rects[1]]);
                expect(rects[2].nextSibling).to.be.equal(rects[0]);
                expect(rects[0].nextSibling).to.be.equal(rects[1]);
            });
        });

    });

    describe(`#removeChild()`, function () {

        describe(`has three childNodes [0, 1, 2], then`, function () {
            let g, rects;
            before(function () {
                g = new G();
                rects = [
                    new Rect(),
                    new Rect(),
                    new Rect()
                ];
                g.appendChild(rects[0]);
                g.appendChild(rects[1]);
                g.appendChild(rects[2]);
            });

            after(function () {
                g = rects = null;
            });

            it(`should return undefined when accept null, self, or other's child`, function () {
                const rect = new Rect();
                expect(g.removeChild()).to.be.undefined;
                expect(g.removeChild(g)).to.be.undefined;
                expect(g.removeChild(rect)).to.be.undefined;
            });
            it(`should return the node after removing node 1`, function () {
                expect(g.removeChild(rects[1])).to.be.equal(rects[1]);
            });
            it(`should remove the node 1's parentNode`, function () {
                expect(rects[1].parentNode).to.not.exist;
            });
            it(`should keep childNodes [0, 2]`, function () {
                expect(g.childNodes).to.be.eql([rects[0], rects[2]]);
            });
            it(`should link the remaining nodes' nextSibling`, function () {
                expect(rects[0].nextSibling).to.be.equal(rects[2]);
            });
        });


    });
});
