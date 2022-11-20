var Zfont;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
(() => {
var exports = __webpack_exports__;
/*!**************************!*\
  !*** ./src/demo/demo.ts ***!
  \**************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Demo = void 0;
var Demo = /** @class */ (function () {
    // Register Zfont plugin
    function Demo() {
        this.Zfont = window["Zfont"];
        this.Zdog = window["Zdog"];
        this.Zfont.init(this.Zdog);
        this.init();
        this.animate();
    }
    Demo.prototype.init = function () {
        var textarea = document.getElementById("textarea");
        // create illo
        this.illo = new this.Zdog.Illustration({
            element: ".Canvas",
            dragRotate: true,
            resize: true,
            rotate: { x: -0.32, y: 0.64, z: 0 },
        });
        // create font
        var font = new this.Zdog.Font({
            src: "./fredokaone.ttf",
        });
        var text = new this.Zdog.Text({
            addTo: this.illo,
            font: font,
            value: textarea.value,
            fontSize: 48,
            textAlign: "center",
            textBaseline: "middle",
            color: "#fff",
            fill: true,
        });
        // text "shadow"
        var shadow1 = text.copy({
            addTo: this.illo,
            translate: { z: -3 },
            color: "#aab",
        });
        var shadow2 = text.copy({
            addTo: this.illo,
            translate: { z: -6 },
            color: "#aab",
        });
        textarea.addEventListener("input", function () {
            text.value = textarea.value;
            shadow1.value = textarea.value;
            shadow2.value = textarea.value;
        });
    };
    // animation loop
    Demo.prototype.animate = function () {
        this.illo.updateRenderGraph();
        requestAnimationFrame(this.animate.bind(this));
    };
    return Demo;
}());
exports.Demo = Demo;
new Demo();

})();

Zfont = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=index.js.map