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
function make_view() {
    return __awaiter(this, void 0, void 0, function* () {
        const options = { model: this.sheet, output: { handle_output: () => { }, handle_clear_output: () => { } } };
        const view = yield this.manager.create_view(this.sheet, options); //new ipysheet.SheetView(options);
        yield this.manager.display_view(undefined, view);
        return view;
    });
}
exports.make_view = make_view;
function wait_validate(view) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve, reject) {
            view.hot.validateCells(function (valid) {
                //console.log('waited for validate,', valid)
                resolve(valid);
            });
        });
    });
}
exports.wait_validate = wait_validate;
function make_cell(options, skip_add) {
    return __awaiter(this, void 0, void 0, function* () {
        const modelId = 'u-u-i-d-cell';
        var cell = yield this.manager.new_widget({
            model_module: 'ipysheet',
            model_name: 'CellRangeModel',
            view_module: 'jupyter-widgets',
            view_name: 'DOMWidgetView',
            view_module_version: '*',
            model_module_version: '0.1.0',
            model_id: modelId,
        }, Object.assign({ row_start: 1, column_start: 2, row_end: 1, column_end: 2, value: 888 }, options));
        var cells = this.sheet.get('cells');
        if (!skip_add)
            this.sheet.set('cells', [...cells, cell]);
        return cell;
    });
}
exports.make_cell = make_cell;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdGVzdC91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLFNBQ2UsU0FBUzs7UUFDcEIsTUFBTSxPQUFPLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFBQyxhQUFhLEVBQUUsR0FBRyxFQUFFLEdBQUUsQ0FBQyxFQUFFLG1CQUFtQixFQUFFLEdBQUcsRUFBRSxHQUFFLENBQUMsRUFBQyxFQUFDLENBQUM7UUFDdkcsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsa0NBQWtDO1FBQ3BHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2pELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FBQTtBQU5ELDhCQU1DO0FBRUQsU0FDZSxhQUFhLENBQUMsSUFBSTs7UUFDN0IsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFTLE9BQU8sRUFBRSxNQUFNO1lBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLFVBQVMsS0FBSztnQkFDakMsNENBQTRDO2dCQUM1QyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDbEIsQ0FBQyxDQUFDLENBQUE7UUFDTixDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUM7Q0FBQTtBQVJELHNDQVFDO0FBRUQsU0FDZSxTQUFTLENBQUMsT0FBTyxFQUFFLFFBQVE7O1FBQ3RDLE1BQU0sT0FBTyxHQUFHLGNBQWMsQ0FBQztRQUMvQixJQUFJLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO1lBQ3JDLFlBQVksRUFBRSxVQUFVO1lBQ3hCLFVBQVUsRUFBRSxnQkFBZ0I7WUFDNUIsV0FBVyxFQUFFLGlCQUFpQjtZQUM5QixTQUFTLEVBQUUsZUFBZTtZQUMxQixtQkFBbUIsRUFBRSxHQUFHO1lBQ3hCLG9CQUFvQixFQUFHLE9BQU87WUFDOUIsUUFBUSxFQUFFLE9BQU87U0FDcEIsa0JBQUcsU0FBUyxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUMsR0FBRyxJQUFLLE9BQU8sRUFBRyxDQUFDO1FBQ3ZGLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BDLElBQUcsQ0FBQyxRQUFRO1lBQ1IsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQTtRQUM3QyxPQUFPLElBQUksQ0FBQTtJQUNmLENBQUM7Q0FBQTtBQWhCRCw4QkFnQkMifQ==