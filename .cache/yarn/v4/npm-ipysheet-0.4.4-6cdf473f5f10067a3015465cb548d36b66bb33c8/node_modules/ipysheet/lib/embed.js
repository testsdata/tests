"use strict";
// Entry point for the unpkg bundle containing custom model definitions.
//
// It differs from the notebook bundle in that it does not need to define a
// dynamic baseURL for the static assets and may load some css that would
// already be loaded by the notebook otherwise.
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
// Export widget models and views, and the npm package version number.
__export(require("./sheet"));
var version_1 = require("./version");
exports.version = version_1.version;
const Handsontable = require("handsontable");
exports.Handsontable = Handsontable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1iZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZW1iZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHdFQUF3RTtBQUN4RSxFQUFFO0FBQ0YsMkVBQTJFO0FBQzNFLHlFQUF5RTtBQUN6RSwrQ0FBK0M7Ozs7O0FBRS9DLHNFQUFzRTtBQUN0RSw2QkFBd0I7QUFDeEIscUNBQWtDO0FBQTFCLDRCQUFBLE9BQU8sQ0FBQTtBQUNmLDZDQUE2QztBQUNwQyxvQ0FBWSJ9