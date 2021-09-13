#!/usr/bin/env node
(() => {
  // src/main.ts
  var delayMillis = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs));
  var greet = (name) => `Hello ${name}`;
  var foo = async () => {
    console.log(greet("World"));
    await delayMillis(1e3);
    console.log("done");
    return true;
  };

  // src/cli.ts
  foo();
})();
