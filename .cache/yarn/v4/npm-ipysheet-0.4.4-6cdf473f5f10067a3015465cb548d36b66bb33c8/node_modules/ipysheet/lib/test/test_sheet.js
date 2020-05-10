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
const ipysheet = require("../sheet");
const dummy_manager_1 = require("./dummy-manager");
const chai_1 = require("chai");
const utils_1 = require("./utils");
var data_cloner = function () {
    var data = this.sheet.data;
    return JSON.parse(JSON.stringify(data));
};
describe('sheet', function () {
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            this.manager = new dummy_manager_1.DummyManager({ ipysheet: ipysheet });
            const modelId = 'u-u-i-d';
            this.sheet = yield this.manager.new_widget({
                model_module: 'ipysheet',
                model_name: 'SheetModel',
                model_module_version: '*',
                view_module: 'jupyter-widgets',
                view_name: 'DOMWidgetView',
                view_module_version: '*',
                //model_module: 'test-widgets',
                //model_name: 'TestWidget',
                model_id: modelId,
            }, { rows: 2, columns: 4 });
            this.sheet.state_change = Promise.resolve(); // bug in ipywidgets?
            this.sheet.views = {};
        });
    });
    it('sanity', function () {
        chai_1.expect(this.sheet.get('rows')).to.equal(2);
        chai_1.expect(this.sheet.get('columns')).to.equal(4);
    });
    it('data init', function () {
        //console.log(this.sheet.data)
        chai_1.expect(this.sheet.data).to.have.lengthOf(2);
        chai_1.expect(this.sheet.data[0]).to.have.lengthOf(4);
    });
    it('data row grow', function () {
        // test grow
        this.sheet.data[1][2].value = 123;
        this.sheet.set('rows', 3);
        chai_1.expect(this.sheet.data).to.have.lengthOf(3);
        chai_1.expect(this.sheet.data[0]).to.have.lengthOf(4);
        chai_1.expect(this.sheet.data[2]).to.have.lengthOf(4);
        chai_1.expect(this.sheet.data[1][2].value, 'data should be preserved when changing size').to.equal(123);
        this.sheet.set('rows', 5);
        chai_1.expect(this.sheet.data).to.have.lengthOf(5);
        chai_1.expect(this.sheet.data[0]).to.have.lengthOf(4);
        chai_1.expect(this.sheet.data[2]).to.have.lengthOf(4);
        chai_1.expect(this.sheet.data[1][2].value, 'data should be preserved when changing size').to.equal(123);
    });
    it('data column shrink', function () {
        this.sheet.data[1][2].value = 123;
        this.sheet.data[1][3].value = 1234;
        this.sheet.set('columns', 3);
        chai_1.expect(this.sheet.data).to.have.lengthOf(2);
        chai_1.expect(this.sheet.data[0]).to.have.lengthOf(3);
        chai_1.expect(this.sheet.data[1]).to.have.lengthOf(3);
        chai_1.expect(this.sheet.data[1][2].value, 'data should be preserved when changing size').to.equal(123);
    });
    it('data column grow', function () {
        this.sheet.set('columns', 5);
        chai_1.expect(this.sheet.data).to.have.lengthOf(2);
        chai_1.expect(this.sheet.data[0]).to.have.lengthOf(5);
        chai_1.expect(this.sheet.data[1]).to.have.lengthOf(5);
    });
    it('model reflecting view', function () {
        return __awaiter(this, void 0, void 0, function* () {
            var view = yield utils_1.make_view.call(this);
            yield view._table_constructed;
            view.set_cell(1, 2, 123);
            yield utils_1.wait_validate(view);
            chai_1.expect(this.sheet.data[1][2].value, 'cell changes should be reflected in model').to.equal(123);
        });
    });
    it('view reflecting model', function () {
        return __awaiter(this, void 0, void 0, function* () {
            var view = yield utils_1.make_view.call(this);
            var data = this.sheet.data;
            yield view._table_constructed;
            data[1][2].value = 123;
            this.sheet.trigger('data_change');
            yield view._last_data_set;
            chai_1.expect(view.get_cell(1, 2), 'model change should be reflected in view').to.equal(123);
        });
    });
    it('view reflecting different view', function () {
        return __awaiter(this, void 0, void 0, function* () {
            var view1 = yield utils_1.make_view.call(this);
            var view2 = yield utils_1.make_view.call(this);
            view1.set_cell(1, 2, 123);
            var bla = yield utils_1.wait_validate(view1);
            chai_1.expect(view1.get_cell(1, 2), 'model change should be reflected in view').to.equal(123);
            chai_1.expect(view1.get_cell(1, 2), 'cell changes in one view should be reflected in a related view').to.equal(view2.get_cell(1, 2));
        });
    });
    // we don't validate at the moment
    it.skip('invalid sheet should not propagate to model', function () {
        return __awaiter(this, void 0, void 0, function* () {
            var view = yield utils_1.make_view.call(this);
            var data_clone = data_cloner.call(this);
            data_clone[1][2].value = 123;
            data_clone[1][2].options = { type: 'numeric' };
            chai_1.expect(data_clone[1][2].value, 'cloned data check').to.equal(123);
            this.sheet.set('data', data_clone);
            view.set_cell(1, 2, 'wrong');
            yield utils_1.wait_validate(view);
            chai_1.expect(view.get_cell(1, 2), 'sheet will reflect invalid data').to.equal('wrong');
            chai_1.expect(this.sheet.data[1][2].value, 'model should not have invalid data').to.not.equal('wrong');
        });
    });
    var make_cell = function (options, skip_add) {
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
    };
    var make_range = function (options, skip_add) {
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
            }, Object.assign({ squeeze_row: false, squeeze_column: false }, options));
            var cells = this.sheet.get('cells');
            if (!skip_add)
                this.sheet.set('cells', [...cells, cell]);
            return cell;
        });
    };
    it('cell changes should be reflected in datamodel', function () {
        return __awaiter(this, void 0, void 0, function* () {
            var cell = yield make_cell.apply(this, [{ value: 777 }]);
            var data = this.sheet.data;
            chai_1.expect(data[1][2].value, 'for initial value').to.equal(777);
            cell.set('value', 999);
            var data = this.sheet.data;
            chai_1.expect(data[1][2].value, 'when cell.value is change').to.equal(999);
        });
    });
    it('numeric cell with value zero should indeed have value zero', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield make_cell.apply(this, [{ value: 0.00, type: 'numeric' }]);
            var data = this.sheet.data;
            chai_1.expect(data[1][2].value, 'for initial value').to.equal(0);
        });
    });
    it('none cell with should be set', function () {
        return __awaiter(this, void 0, void 0, function* () {
            var cell = yield make_cell.apply(this, [{ value: 0.00, type: 'numeric' }]);
            var data = this.sheet.data;
            chai_1.expect(data[1][2].value, 'for initial value').to.equal(0);
            cell.set('value', null);
            var data = this.sheet.data;
            chai_1.expect(data[1][2].value, 'for new value').to.equal(null);
        });
    });
    it('multiple cells added', function () {
        return __awaiter(this, void 0, void 0, function* () {
            var cell1 = yield make_cell.apply(this, [{ value: 777 }, true]);
            var cell2 = yield make_cell.apply(this, [{ row_start: 0, row_end: 0, value: 555 }, true]);
            var cells = this.sheet.get('cells');
            this.sheet.set('cells', [...cells, cell1, cell2]);
            var data = this.sheet.data;
            chai_1.expect(data[1][2].value, 'for initial value').to.equal(777);
            chai_1.expect(data[0][2].value, 'for initial value').to.equal(555);
            cell1.set('value', 999);
            cell2.set('value', 444);
            var data = this.sheet.data;
            chai_1.expect(data[1][2].value, 'when cell.value is change').to.equal(999);
            chai_1.expect(data[0][2].value, 'when cell.value is change').to.equal(444);
        });
    });
    it('model changes should be reflected in cell', function () {
        return __awaiter(this, void 0, void 0, function* () {
            var cell = yield make_cell.apply(this, [{ value: [[777]] }]);
            var data = data_cloner.call(this);
            data[1][2].value = 999;
            this.sheet.data = data;
            this.sheet.trigger('data_change');
            chai_1.expect(cell.get('value'), 'when the data in the sheet changes').to.equal(999);
        });
    });
    it('range should be reflected in all cells', function () {
        return __awaiter(this, void 0, void 0, function* () {
            var range = yield make_range.apply(this, [{ row_start: 0, row_end: 1, column_start: 1, column_end: 2, value: [[0, 1], [2, 3]] }]);
            var data = data_cloner.call(this);
            chai_1.expect(data[0][1].value, 'and in the underlying data grid').to.equal(0);
            chai_1.expect(data[0][2].value, 'and in the underlying data grid').to.equal(1);
            chai_1.expect(data[1][1].value, 'and in the underlying data grid').to.equal(2);
            chai_1.expect(data[1][2].value, 'and in the underlying data grid').to.equal(3);
            var cell = yield make_cell.apply(this, [{ row_start: 0, row_end: 0, value: 777 }]);
            data = data_cloner.call(this);
            chai_1.expect(data[0][2].value, 'sanity check').to.equal(777);
            chai_1.expect(range.get('value')[0][1], 'and in the underlying data grid, synced back').to.equal(777);
            var cell2 = yield make_cell.apply(this, [{ row_start: 1, row_end: 1, value: null }]);
            data = data_cloner.call(this);
            chai_1.expect(data[1][2].value, 'should not be using a null value for an overlapping value').to.equal(3);
            chai_1.expect(range.get('value')[1][1], 'and the original data should not be modified').to.equal(3);
            chai_1.expect(cell2.get('value'), 'but the cell value should be updated').to.equal(3);
            //data[1][2].value = 999;
            //this.sheet.set('data', data)
            //expect(range.get('value'), 'when the data in the sheet changes').to.equal(999);
        });
    });
    it('range tranposed should be reflected in all cells', function () {
        return __awaiter(this, void 0, void 0, function* () {
            var range = yield make_range.apply(this, [{ row_start: 0, row_end: 1, column_start: 1, column_end: 2, transpose: true, value: [[0, 1], [2, 3]] }]);
            var data = data_cloner.call(this);
            chai_1.expect(data[0][1].value, 'and in the underlying data grid').to.equal(0);
            chai_1.expect(data[0][2].value, 'and in the underlying data grid').to.equal(2);
            chai_1.expect(data[1][1].value, 'and in the underlying data grid').to.equal(1);
            chai_1.expect(data[1][2].value, 'and in the underlying data grid').to.equal(3);
            var cell = yield make_cell.apply(this, [{ row_start: 0, row_end: 0, value: 777 }]);
            data = data_cloner.call(this);
            chai_1.expect(data[0][2].value, 'sanity check').to.equal(777);
            chai_1.expect(range.get('value')[1][0], 'and in the underlying data grid, synced back').to.equal(777);
            //data[1][2].value = 999;
            //this.sheet.set('data', data)
            //expect(range.get('value'), 'when the data in the sheet changes').to.equal(999);
        });
    });
    it('should use the last style but not overwrite', function () {
        return __awaiter(this, void 0, void 0, function* () {
            var range = yield make_range.apply(this, [{ row_start: 0, row_end: 1, column_start: 1, column_end: 2, transpose: true, value: [[0, 1], [2, 3]],
                    style: { color: 'red', backgrouncColor: 'orange' } }]);
            var data = data_cloner.call(this);
            chai_1.expect(data[0][1].options.style.color, 'and in the underlying data grid').to.equal('red');
            chai_1.expect(data[0][2].options.style.color, 'and in the underlying data grid').to.equal('red');
            chai_1.expect(data[1][1].options.style.color, 'and in the underlying data grid').to.equal('red');
            chai_1.expect(data[1][2].options.style.color, 'and in the underlying data grid').to.equal('red');
            chai_1.expect(data[0][1].options.style.backgrouncColor, 'and in the underlying data grid').to.equal('orange');
            chai_1.expect(data[0][2].options.style.backgrouncColor, 'and in the underlying data grid').to.equal('orange');
            chai_1.expect(data[1][1].options.style.backgrouncColor, 'and in the underlying data grid').to.equal('orange');
            chai_1.expect(data[1][2].options.style.backgrouncColor, 'and in the underlying data grid').to.equal('orange');
            var cell = yield make_cell.apply(this, [{ row_start: 0, row_end: 0, value: 777, style: { color: 'blue' } }]);
            data = data_cloner.call(this);
            chai_1.expect(data[0][2].options.style.color, 'effective color should be blue').to.equal('blue');
            chai_1.expect(data[0][2].options.style.backgrouncColor, 'effective backgrouncColor should be blue').to.equal('orange');
            chai_1.expect(range.get('style').color, 'but the original should not be changed').to.equal('red');
        });
    });
    it('should search at table creation', function () {
        return __awaiter(this, void 0, void 0, function* () {
            var cell = yield make_cell.apply(this, [{ value: [['Hello']] }]);
            this.sheet.set('search_token', 'Hell');
            var view = yield utils_1.make_view.call(this);
            yield view._table_constructed;
            chai_1.expect(view.el.querySelector('td[class*="htSearchResult"]')).to.not.equal(null);
        });
    });
    it('should search', function () {
        return __awaiter(this, void 0, void 0, function* () {
            var cell = yield make_cell.apply(this, [{ value: [['Hello']] }]);
            var view = yield utils_1.make_view.call(this);
            yield view._table_constructed;
            chai_1.expect(view.el.querySelector('td[class*="htSearchResult"]')).to.equal(null);
            this.sheet.set('search_token', 'Hell');
            chai_1.expect(view.el.querySelector('td[class*="htSearchResult"]')).to.not.equal(null);
        });
    });
    it('should search after change', function () {
        return __awaiter(this, void 0, void 0, function* () {
            var cell = yield make_cell.apply(this, [{ value: [['Yop']] }]);
            var view = yield utils_1.make_view.call(this);
            yield view._table_constructed;
            this.sheet.set('search_token', 'Hell');
            chai_1.expect(view.el.querySelector('td[class*="htSearchResult"]')).to.equal(null);
            cell.set('value', [['Hello']]);
            yield view._last_data_set;
            chai_1.expect(view.el.querySelector('td[class*="htSearchResult"]')).to.not.equal(null);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9zaGVldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZXN0L3Rlc3Rfc2hlZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFFQSxxQ0FBcUM7QUFDckMsbURBQTZDO0FBQzdDLCtCQUE4QjtBQUM5QixtQ0FBNkQ7QUFFN0QsSUFBSSxXQUFXLEdBQUc7SUFDZCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQTtJQUMxQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0FBQzNDLENBQUMsQ0FBQTtBQUVELFFBQVEsQ0FBQyxPQUFPLEVBQUU7SUFDZCxVQUFVLENBQUM7O1lBQ1AsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLDRCQUFZLENBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztZQUN0RCxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUM7WUFDMUIsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO2dCQUN2QyxZQUFZLEVBQUUsVUFBVTtnQkFDeEIsVUFBVSxFQUFFLFlBQVk7Z0JBQ3hCLG9CQUFvQixFQUFHLEdBQUc7Z0JBQzFCLFdBQVcsRUFBRSxpQkFBaUI7Z0JBQzlCLFNBQVMsRUFBRSxlQUFlO2dCQUMxQixtQkFBbUIsRUFBRSxHQUFHO2dCQUN4QiwrQkFBK0I7Z0JBQy9CLDJCQUEyQjtnQkFDM0IsUUFBUSxFQUFFLE9BQU87YUFDcEIsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBQyxDQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMscUJBQXFCO1lBQ2xFLElBQUksQ0FBQyxLQUFLLENBQUMs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QUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsaUNBQWlDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzFGLGFBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsaUNBQWlDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZHLGFBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsaUNBQWlDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZHLGFBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsaUNBQWlDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZHLGFBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsaUNBQWlDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZHLElBQUksSUFBSSxHQUFHLE1BQU0sU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtZQUN2RyxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUM3QixhQUFNLENBQUMs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