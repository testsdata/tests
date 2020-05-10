"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const Handsontable = require("handsontable");
function widgetRenderer(instance, td, row, col, prop, value, cellProperties) {
    return __awaiter(this, void 0, void 0, function* () {
        // If it's a ghost-table, we do add the view
        // See https://github.com/handsontable/handsontable/blob/6.2.2/src/utils/ghostTable.js#L313-L314
        if (td.hasAttribute('ghost-table')) {
            // TODO Create a div and apply the widget layout to it, also apply the top CSS
            // class of the widget. How to retrieve CSS classes without a view?
            return;
        }
        if (cellProperties.widget_view) {
            let el = cellProperties.widget_view.el;
            if (td.children.length == 1 && td.children[0] == el) {
                // great, widget view element was already added
            }
            else {
                // clean up leftover text or elements from previous renderings
                td.innerHTML = '';
                if (el) {
                    td.appendChild(el);
                    cellProperties.widget_view.trigger('displayed');
                }
            }
        }
    });
}
Handsontable.cellTypes.registerCellType('widget', {
    renderer: widgetRenderer
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0X2NlbGxfdHlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy93aWRnZXRfY2VsbF90eXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsYUFBYTtBQUNiLDZDQUE2QztBQUU3QyxTQUFlLGNBQWMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxjQUFjOztRQUM3RSw0Q0FBNEM7UUFDNUMsZ0dBQWdHO1FBQ2hHLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUNoQyw4RUFBOEU7WUFDOUUsbUVBQW1FO1lBQ25FLE9BQU87U0FDVjtRQUNELElBQUcsY0FBYyxDQUFDLFdBQVcsRUFBRTtZQUMzQixJQUFJLEVBQUUsR0FBRyxjQUFjLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQTtZQUN0QyxJQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDaEQsK0NBQStDO2FBQ2xEO2lCQUFNO2dCQUNILDhEQUE4RDtnQkFDOUQsRUFBRSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7Z0JBQ2xCLElBQUcsRUFBRSxFQUFFO29CQUNILEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ25CLGNBQWMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2lCQUNuRDthQUNKO1NBRUo7SUFFTCxDQUFDO0NBQUE7QUFFQSxZQUFZLENBQUMsU0FBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUU7SUFDdkQsUUFBUSxFQUFFLGNBQWM7Q0FDM0IsQ0FBQyxDQUFDIn0=