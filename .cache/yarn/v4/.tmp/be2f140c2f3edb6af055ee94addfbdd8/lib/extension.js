"use strict";
// This file contains the javascript that is run when the notebook is loaded.
// It contains some requirejs configuration and the `load_ipython_extension`
// which is required for any notebook extension.
Object.defineProperty(exports, "__esModule", { value: true });
// Configure requirejs
if (window['require'] !== undefined) {
    window['require'].config({
        map: {
            "*": {
                "ipysheet": "nbextensions/ipysheet/index",
                "jupyter-js-widgets": "nbextensions/jupyter-js-widgets/extension"
            }
        }
    });
}
// Export the required load_ipython_extention
function load_ipython_extension() { }
exports.load_ipython_extension = load_ipython_extension;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2V4dGVuc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsNkVBQTZFO0FBQzdFLDRFQUE0RTtBQUM1RSxnREFBZ0Q7O0FBRWhELHNCQUFzQjtBQUN0QixJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxTQUFTLEVBQUU7SUFDbkMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUN2QixHQUFHLEVBQUU7WUFDSCxHQUFHLEVBQUc7Z0JBQ0osVUFBVSxFQUFFLDZCQUE2QjtnQkFDekMsb0JBQW9CLEVBQUUsMkNBQTJDO2FBQ2xFO1NBQ0Y7S0FDRixDQUFDLENBQUM7Q0FDSjtBQUVELDZDQUE2QztBQUM3QyxTQUFnQixzQkFBc0IsS0FBSyxDQUFDO0FBQTVDLHdEQUE0QztBQUFBLENBQUMifQ==