"use strict";
// Entry point for the notebook bundle containing custom model definitions.
//
// Setup notebook base URL
//
// Some static assets may be required by the custom widget javascript. The base
// url for the notebook is not known at build time and is therefore computed
// dynamically.
//__webpack_public_path__ = document.querySelector('body').getAttribute('data-base-url') + 'nbextensions/ipysheet/';
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
// Export widget models and views, and the npm package version number.
__export(require("./sheet"));
__export(require("./renderer"));
var version_1 = require("./version");
exports.version = version_1.version;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDJFQUEyRTtBQUMzRSxFQUFFO0FBQ0YsMEJBQTBCO0FBQzFCLEVBQUU7QUFDRiwrRUFBK0U7QUFDL0UsNEVBQTRFO0FBQzVFLGVBQWU7QUFDZixvSEFBb0g7Ozs7O0FBRXBILHNFQUFzRTtBQUN0RSw2QkFBd0I7QUFDeEIsZ0NBQTJCO0FBQzNCLHFDQUFvQztBQUEzQiw0QkFBQSxPQUFPLENBQUEifQ==