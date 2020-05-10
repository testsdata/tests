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
const ipysheet_renderer = require("../renderer");
const dummy_manager_1 = require("./dummy-manager");
const chai_1 = require("chai");
const lodash_1 = require("lodash");
const utils_1 = require("./utils");
// @ts-ignore
const Handsontable = require("handsontable");
describe('custom', function () {
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            this.manager = new dummy_manager_1.DummyManager({ ipysheet: lodash_1.extend(ipysheet, ipysheet_renderer) });
            const modelId = 'u-u-i-d';
            this.sheet = yield this.manager.new_widget({
                model_module: 'ipysheet',
                model_name: 'SheetModel',
                model_module_version: '*',
                view_module: 'jupyter-widgets',
                view_name: 'DOMWidgetView',
                view_module_version: '*',
                model_id: modelId,
            }, { rows: 2, columns: 4 });
            this.sheet.state_change = Promise.resolve(); // bug in ipywidgets?
            this.sheet.views = {};
            this.renderer = yield this.manager.new_widget({
                model_module: 'ipysheet',
                model_name: 'RendererModel',
                model_module_version: '*',
                view_module: 'jupyter-widgets',
                view_name: 'WidgetView',
                view_module_version: '*',
                model_id: modelId,
            }, { code: `function (instance, td, row, col, prop, value, cellProperties) {
                Handsontable.renderers.TextRenderer.apply(this, arguments);
                if (value < 0)
                    td.style.backgroundColor = 'red'
                else
                    td.style.backgroundColor = 'green'
            }`, name: 'test_renderer' });
        });
    });
    it('register', function () {
        chai_1.expect(this.renderer.rendering_function).to.not.equal(undefined);
        chai_1.expect(Handsontable.renderers.getRenderer('test_renderer')).to.not.equal(undefined);
    });
});
describe('widget_renderer', function () {
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            this.manager = new dummy_manager_1.DummyManager({ ipysheet: lodash_1.extend(ipysheet, ipysheet_renderer) });
            const modelId = 'u-u-i-d';
            this.sheet = yield this.manager.new_widget({
                model_module: 'ipysheet',
                model_name: 'SheetModel',
                model_module_version: '*',
                view_module: 'jupyter-widgets',
                view_name: 'DOMWidgetView',
                view_module_version: '*',
                model_id: modelId,
            }, { rows: 2, columns: 4 });
            this.sheet.state_change = Promise.resolve(); // bug in ipywidgets?
            this.sheet.views = {};
            const modelId1 = 'u-u-i-d1';
            this.first = yield this.manager.new_widget({
                model_module: 'test-widgets',
                model_name: 'TestWidget',
                model_module_version: '1.0.0',
                view_module: 'test-widgets',
                view_name: 'TestWidgetView',
                view_module_version: '1.0.0',
                model_id: modelId1,
            }, { value: 2, _view_count: 0 });
            const modelId2 = 'u-u-i-d2';
            this.second = yield this.manager.new_widget({
                model_module: 'test-widgets',
                model_name: 'TestWidget',
                model_module_version: '1.0.0',
                view_module: 'test-widgets',
                view_name: 'TestWidgetView',
                view_module_version: '1.0.0',
                model_id: modelId2,
            }, { value: 5, _view_count: 0 });
            this.renderer = Handsontable.renderers.getRenderer('widget');
        });
    });
    it('renderer_registered', function () {
        chai_1.expect(Handsontable.renderers.getRenderer('widget')).to.not.equal(undefined);
    });
    it('widgets views should only be created once', function () {
        return __awaiter(this, void 0, void 0, function* () {
            var view = yield utils_1.make_view.call(this);
            var cell1 = yield utils_1.make_cell.apply(this, [{ row_start: 1, row_end: 1, value: 0 }]);
            cell1.set({ value: this.first, type: 'widget' });
            yield view._last_data_set;
            let view_widget_first = view.widget_views[[1, 2].join()];
            chai_1.expect(view.widget_views[[1, 2].join()].model.cid).to.equal(this.first.cid);
            // we manually call building the widget views
            yield view._build_widgets_views();
            chai_1.expect(view.widget_views[[1, 2].join()].cid).to.equal(view_widget_first.cid);
        });
    });
    it('widgets views should not be removed when updated', function () {
        return __awaiter(this, void 0, void 0, function* () {
            var view = yield utils_1.make_view.call(this);
            var cell1 = yield utils_1.make_cell.apply(this, [{ row_start: 1, row_end: 1, value: 0 }]);
            cell1.set({ value: this.first, type: 'widget' });
            yield view._last_data_set;
            let view_widget_first = view.widget_views[[1, 2].join()];
            chai_1.expect(view.widget_views[[1, 2].join()].model.cid).to.equal(this.first.cid);
            // we manually call building the widget views
            let wid = view.widget_views[[1, 2].join()];
            yield view._build_widgets_views();
            this.first.set('value', 36);
            chai_1.expect(this.first.get('_view_count')).to.equal(1);
        });
    });
    it('widgets should disappear', function () {
        return __awaiter(this, void 0, void 0, function* () {
            var view = yield utils_1.make_view.call(this);
            var cell1 = yield utils_1.make_cell.apply(this, [{ row_start: 1, row_end: 1, value: 0 }]);
            chai_1.expect(this.first.get('_view_count')).to.equal(0);
            cell1.set({ value: this.first, type: 'widget' });
            yield view._last_data_set;
            let view_widget_first = view.widget_views[[1, 2].join()];
            chai_1.expect(view.widget_views[[1, 2].join()].model.cid).to.equal(this.first.cid);
            chai_1.expect(this.first.get('_view_count')).to.equal(1);
            cell1.set({ value: '1', type: 'text' });
            yield view._last_data_set;
            chai_1.expect(view.widget_views[[1, 2].join()]).to.be.undefined;
            chai_1.expect(this.first.get('_view_count')).to.equal(0);
        });
    });
    it('widgets can change', function () {
        return __awaiter(this, void 0, void 0, function* () {
            var view = yield utils_1.make_view.call(this);
            var cell1 = yield utils_1.make_cell.apply(this, [{ row_start: 1, row_end: 1, value: 0 }]);
            cell1.set({ value: this.first, type: 'widget' });
            yield view._last_data_set;
            let view_widget_first = view.widget_views[[1, 2].join()];
            chai_1.expect(view.widget_views[[1, 2].join()].model.cid).to.equal(this.first.cid);
            chai_1.expect(this.first.get('_view_count')).to.equal(1);
            cell1.set({ value: this.second, type: 'widget' });
            yield view._last_data_set;
            chai_1.expect(view.widget_views[[1, 2].join()].model.cid).to.equal(this.second.cid);
            chai_1.expect(this.first.get('_view_count')).to.equal(0);
            chai_1.expect(this.second.get('_view_count')).to.equal(1);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9yZW5kZXJlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZXN0L3Rlc3RfcmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFFQSxxQ0FBcUM7QUFDckMsaURBQWlEO0FBQ2pELG1EQUE2QztBQUM3QywrQkFBOEI7QUFDOUIsbUNBQWdDO0FBQ2hDLG1DQUE2RDtBQUU3RCxhQUFhO0FBQ2IsNkNBQTZDO0FBRzdDLFFBQVEsQ0FBQyxRQUFRLEVBQUU7SUFDZixVQUFVLENBQUM7O1lBQ1AsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLDRCQUFZLENBQUMsRUFBQyxRQUFRLEVBQUUsZUFBTSxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxFQUFDLENBQUMsQ0FBQztZQUNqRixNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUM7WUFDMUIsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO2dCQUN2QyxZQUFZLEVBQUUsVUFBVTtnQkFDeEIsVUFBVSxFQUFFLFlBQVk7Z0JBQ3hCLG9CQUFvQixFQUFHLEdBQUc7Z0JBQzFCLFdBQVcsRUFBRSxpQkFBaUI7Z0JBQzlCLFNBQVMsRUFBRSxlQUFlO2dCQUMxQixtQkFBbUIsRUFBRSxHQUFHO2dCQUN4QixRQUFRLEVBQUUsT0FBTzthQUNwQixFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFDLENBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxxQkFBcUI7WUFDbEUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFBO1lBRXJCLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztnQkFDMUMsWUFBWSxFQUFFLFVBQVU7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TSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQzNFLGFBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFFakQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFBO1lBQy9DLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUMxQixhQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDNUUsYUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNqRCxhQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3RELENBQUM7S0FBQSxDQUFDLENBQUE7QUFDTixDQUFDLENBQUMsQ0FBQyJ9