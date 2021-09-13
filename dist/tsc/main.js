"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.foo = exports.greet = exports.delayMillis = void 0;
const tslib_1 = require("tslib");
const delayMillis = (delayMs) => new Promise(resolve => setTimeout(resolve, delayMs));
exports.delayMillis = delayMillis;
const greet = (name) => `Hello ${name}`;
exports.greet = greet;
const foo = () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    console.log((0, exports.greet)('World'));
    yield (0, exports.delayMillis)(1000);
    console.log('done');
    return true;
});
exports.foo = foo;
//# sourceMappingURL=main.js.map