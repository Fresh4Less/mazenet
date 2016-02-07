define(["require", "exports"], function (require, exports) {
    //TODO Figure out how to extend Array to add cursor shit.
    var AnimatedCursorArrayDummy = (function () {
        function AnimatedCursorArrayDummy() {
            Array.apply(this, arguments);
            return new Array();
        }
        return AnimatedCursorArrayDummy;
    })();
    return AnimatedCursorArrayDummy;
});
//# sourceMappingURL=AnimatedCursorArray.js.map