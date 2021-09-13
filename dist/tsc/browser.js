"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This file is the entrypoint of browser builds.
 * The code executes when loaded in a browser.
 */
const main_1 = require("./main");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.foo = main_1.foo; // instead of casting window to any, you can extend the Window interface: https://stackoverflow.com/a/43513740/5433572
console.log('Method "foo" was added to the window object. You can try it yourself by just entering "await foo()"');
//# sourceMappingURL=browser.js.map