import chai from 'chai';
import zrender from '../src/zrender';
import G from '../src/container/G';
import Rect from '../src/graphic/shape/Rect';

const { expect } = chai;

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

        describe(`invalid`, function () {
            it(`should return undefined when accept null or self`, function () {
                expect(g.appendChild()).to.be.undefined;
                expect(g.appendChild(g)).to.be.undefined;
            });
            it(`should have empty childNodes when no valid added`, function () {
                g.appendChild();
                g.appendChild(g);
                expect(g.childNodes).to.be.an('array').that.is.empty;
            });
        });

        describe(`single node`, function () {
            it(`should return added node when accept node`, function () {
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
});
