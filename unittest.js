/**
 * Need to run brackets from source
 *
 * https://github.com/adobe/brackets/wiki/How-to-Hack-on-Brackets
 */
define(function (require) {
    "use strict";

    var main = require("main");

    describe("Hello World", function () {
        it("should expose a handleHelloWorld method", function () {
            expect(main.handleHelloWorld).not.toBeNull();
        });
    });
});
