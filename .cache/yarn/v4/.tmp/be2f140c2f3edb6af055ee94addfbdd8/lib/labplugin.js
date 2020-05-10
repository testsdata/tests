"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base = require("@jupyter-widgets/base");
const version_1 = require("./version");
const sheet = require("./sheet");
const ipysheetPlugin = {
    id: 'ipysheet',
    requires: [base.IJupyterWidgetRegistry],
    activate: function (app, widgets) {
        widgets.registerWidget({
            name: 'ipysheet',
            version: version_1.version,
            exports: sheet
        });
    },
    autoStart: true
};
exports.default = ipysheetPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFicGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xhYnBsdWdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUE4QztBQUM5Qyx1Q0FBa0M7QUFDbEMsaUNBQWlDO0FBRWpDLE1BQU0sY0FBYyxHQUFHO0lBQ25CLEVBQUUsRUFBRSxVQUFVO0lBQ2QsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDO0lBQ3ZDLFFBQVEsRUFBRSxVQUFTLEdBQUcsRUFBRSxPQUFPO1FBQzNCLE9BQU8sQ0FBQyxjQUFjLENBQUM7WUFDbkIsSUFBSSxFQUFFLFVBQVU7WUFDaEIsT0FBTyxFQUFFLGlCQUFPO1lBQ2hCLE9BQU8sRUFBRSxLQUFLO1NBQ2pCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDRCxTQUFTLEVBQUUsSUFBSTtDQUNsQixDQUFDO0FBRUYsa0JBQWUsY0FBYyxDQUFDIn0=