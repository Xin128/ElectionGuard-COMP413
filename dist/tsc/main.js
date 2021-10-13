"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.foo = exports.greet = exports.delayMillis = void 0;
const delayMillis = (delayMs) => new Promise(resolve => setTimeout(resolve, delayMs));
exports.delayMillis = delayMillis;
const greet = (name) => `Hello ${name}`;
exports.greet = greet;
const foo = async () => {
    console.log((0, exports.greet)('World'));
    await (0, exports.delayMillis)(1000);
    console.log('done');
    return true;
};
exports.foo = foo;
//# sourceMappingURL=main.js.map