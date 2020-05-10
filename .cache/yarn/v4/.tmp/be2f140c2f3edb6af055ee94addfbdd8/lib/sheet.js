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
const widgets = require("@jupyter-widgets/base");
const lodash_1 = require("lodash");
const version_1 = require("./version");
const renderer_1 = require("./renderer");
exports.RendererModel = renderer_1.RendererModel;
require("./widget_cell_type");
// @ts-ignore
const Handsontable = require("handsontable");
// CSS
require("pikaday/css/pikaday.css");
require("handsontable/dist/handsontable.min.css");
require("../css/custom.css");
let CellRangeModel = widgets.WidgetModel.extend({
    defaults: function () {
        return lodash_1.extend(CellRangeModel.__super__.defaults.call(this), {
            _model_name: 'CellRangeModel',
            _model_module: 'ipysheet',
            _model_module_version: version_1.semver_range,
            value: null,
            row_start: 1,
            column_start: 1,
            row_end: 1,
            column_end: 1,
            type: null,
            name: null,
            style: {},
            renderer: null,
            read_only: false,
            choice: null,
            squeeze_row: true,
            squeeze_column: true,
            transpose: false,
            numeric_format: '0.000',
            date_format: 'YYYY/MM/DD',
            time_format: 'h:mm:ss a'
        });
    },
}, {
    serializers: lodash_1.extend({
        value: { deserialize: widgets.unpack_models }
    }, widgets.WidgetModel.serializers)
});
exports.CellRangeModel = CellRangeModel;
let SheetModel = widgets.DOMWidgetModel.extend({
    defaults: function () {
        return lodash_1.extend(SheetModel.__super__.defaults.call(this), {
            _model_name: 'SheetModel',
            _view_name: 'SheetView',
            _model_module: 'ipysheet',
            _view_module: 'ipysheet',
            _model_module_version: version_1.semver_range,
            _view_module_version: version_1.semver_range,
            rows: 3,
            columns: 4,
            cells: [],
            named_cells: {},
            row_headers: true,
            column_headers: true,
            stretch_headers: 'all',
            column_width: null,
            column_resizing: true,
            row_resizing: true,
            search_token: ''
        });
    },
    initialize: function () {
        SheetModel.__super__.initialize.apply(this, arguments);
        this.data = [[]];
        this.update_data_grid(false);
        this._updating_grid = false;
        this.on('change:rows change:columns', this.update_data_grid, this);
        this.on('change:cells', this.on_change_cells, this);
        this.on('data_change', this.grid_to_cell, this);
        lodash_1.each(this.get('cells'), (cell) => this.cell_bind(cell));
        this.cells_to_grid();
    },
    on_change_cells: function () {
        this._updating_grid = true;
        try {
            let previous_cells = this.previous('cells');
            let cells = this.get('cells');
            for (let i = 0; i < cells.length; i++) {
                let cell = cells[i];
                if (!lodash_1.includes(previous_cells, cell)) {
                    this.cell_bind(cell);
                }
            }
            this.cells_to_grid();
            //this.save_changes();
        }
        finally {
            this._updating_grid = false;
        }
        this.grid_to_cell();
    },
    cell_bind: function (cell) {
        cell.on_some_change(['value', 'style', 'type', 'renderer', 'read_only', 'choice', 'numeric_format', 'date_format', 'time_format'], () => {
            this.cells_to_grid();
        });
    },
    cells_to_grid: function () {
        this.data = [[]];
        this.update_data_grid(false);
        lodash_1.each(this.get('cells'), (cell) => {
            this._cell_data_to_grid(cell);
        });
        this.trigger('data_change');
    },
    _cell_data_to_grid: function (cell) {
        let value = cell.get('value');
        for (let i = cell.get('row_start'); i <= cell.get('row_end'); i++) {
            for (let j = cell.get('column_start'); j <= cell.get('column_end'); j++) {
                let value = cell.get('value');
                let cell_row = i - cell.get('row_start');
                let cell_col = j - cell.get('column_start');
                if ((i >= this.data.length) || (j >= this.data[i].length))
                    continue; // skip cells that are out of the sheet
                let cell_data = this.data[i][j];
                if (cell.get('transpose')) {
                    if (!cell.get('squeeze_column'))
                        value = value[cell_col];
                    if (!cell.get('squeeze_row'))
                        value = value[cell_row];
                }
                else {
                    if (!cell.get('squeeze_row'))
                        value = value[cell_row];
                    if (!cell.get('squeeze_column'))
                        value = value[cell_col];
                }
                if (value != null)
                    cell_data.value = value;
                if (cell.get('type') != null)
                    cell_data.options['type'] = cell.get('type');
                if (cell.get('renderer') != null)
                    cell_data.options['renderer'] = cell.get('renderer');
                if (cell.get('read_only') != null)
                    cell_data.options['readOnly'] = cell.get('read_only');
                if (cell.get('choice') != null)
                    cell_data.options['source'] = cell.get('choice');
                if (cell.get('numeric_format') && cell.get('type') == 'numeric')
                    cell_data.options['numericFormat'] = { 'pattern': cell.get('numeric_format') };
                if (cell.get('date_format') && cell.get('type') == 'date') {
                    cell_data.options['correctFormat'] = true;
                    cell_data.options['dateFormat'] = cell.get('date_format') || cell_data.options['dateFormat'];
                }
                if (cell.get('time_format') && cell.get('type') == 'time') {
                    cell_data.options['correctFormat'] = true;
                    cell_data.options['timeFormat'] = cell.get('time_format') || cell_data.options['timeFormat'];
                }
                cell_data.options['style'] = lodash_1.extend({}, cell_data.options['style'], cell.get('style'));
            }
        }
    },
    grid_to_cell: function () {
        if (this._updating_grid) {
            return;
        }
        this._updating_grid = true;
        try {
            lodash_1.each(this.get('cells'), (cell) => {
                let rows = [];
                for (let i = cell.get('row_start'); i <= cell.get('row_end'); i++) {
                    let row = [];
                    for (let j = cell.get('column_start'); j <= cell.get('column_end'); j++) {
                        //let cell_row = i - cell.get('row_start');
                        //let cell_col = j - cell.get('column_start');
                        if ((i >= this.data.length) || (j >= this.data[i].length))
                            continue; // skip cells that are out of the sheet
                        let cell_data = this.data[i][j];
                        row.push(cell_data.value);
                        /*cell.set('value', cell_data.value);
                        cell.set('type', cell_data.options['type']);
                        cell.set('style', cell_data.options['style']);
                        cell.set('renderer', cell_data.options['renderer']);
                        cell.set('read_only', cell_data.options['readOnly']);
                        cell.set('choice', cell_data.options['source']);
                        cell.set('format', cell_data.options['format']);*/
                    }
                    if (cell.get('squeeze_column')) {
                        row = row[0];
                    }
                    rows.push(row);
                }
                if (cell.get('squeeze_row')) {
                    rows = rows[0];
                }
                if (cell.get('transpose')) {
                    cell.set('value', lodash_1.unzip(rows));
                }
                else {
                    cell.set('value', rows);
                }
                cell.save_changes();
            });
        }
        finally {
            this._updating_grid = false;
        }
    },
    update_data_grid: function (trigger_change_event = true) {
        // create a row x column array of arrays filled with null
        let rows = this.get('rows');
        let columns = this.get('columns');
        let empty_cell = () => {
            return { value: null, options: {} };
        };
        let empty_row = () => {
            return lodash_1.times(this.get('columns'), empty_cell);
        };
        if (rows < this.data.length) {
            this.data = this.data.slice(0, rows);
        }
        else if (rows > this.data.length) {
            for (let i = this.data.length; i < rows; i++) {
                this.data.push(empty_row());
            }
        }
        for (let i = 0; i < rows; i++) {
            let row = this.data[i];
            if (columns < row.length) {
                row = row.slice(0, columns);
            }
            else if (columns > row.length) {
                for (let j = row.length; j < columns; j++) {
                    row.push(empty_cell());
                }
            }
            this.data[i] = row;
        }
        if (trigger_change_event) {
            this.trigger('data_change');
        }
    }
}, {
    serializers: lodash_1.extend({
        cells: { deserialize: widgets.unpack_models },
        data: { deserialize: widgets.unpack_models }
    }, widgets.DOMWidgetModel.serializers)
});
exports.SheetModel = SheetModel;
// go from 2d array with objects to a 2d grid containing just attribute `attr` from those objects
let extract2d = function (grid, attr) {
    return lodash_1.map(grid, function (column) {
        return lodash_1.map(column, function (value) {
            return value[attr];
        });
    });
};
// inverse of above
let put_values2d = function (grid, values) {
    // TODO: the Math.min should not be needed, happens with the custom-build
    for (let i = 0; i < Math.min(grid.length, values.length); i++) {
        for (let j = 0; j < Math.min(grid[i].length, values[i].length); j++) {
            grid[i][j].value = values[i][j];
        }
    }
};
// calls the original renderer and then applies custom styling
Handsontable.renderers.registerRenderer('styled', function customRenderer(hotInstance, td, row, column, prop, value, cellProperties) {
    let name = cellProperties.original_renderer || cellProperties.type || 'text';
    let original_renderer = Handsontable.renderers.getRenderer(name);
    original_renderer.apply(this, arguments);
    lodash_1.each(cellProperties.style, function (value, key) {
        td.style[key] = value;
    });
});
let SheetView = widgets.DOMWidgetView.extend({
    render: function () {
        // this.widget_view_promises = {}
        this.widget_views = {};
        this.el.classList.add("handsontable");
        this.el.classList.add("jupyter-widgets");
        this.table_container = document.createElement('div');
        this.el.appendChild(this.table_container);
        // promise used for unittesting
        this._table_constructed = this.displayed.then(() => __awaiter(this, void 0, void 0, function* () {
            this.hot = yield this._build_table();
            this.model.on('data_change', this.on_data_change, this);
            this.model.on('change:column_headers change:row_headers', this._update_hot_settings, this);
            this.model.on('change:stretch_headers change:column_width', this._update_hot_settings, this);
            this.model.on('change:column_resizing change:row_resizing', this._update_hot_settings, this);
            this.model.on('change:search_token', this._search, this);
            this._search();
        }));
    },
    processPhosphorMessage: function (msg) {
        SheetView.__super__.processPhosphorMessage.apply(this, arguments);
        switch (msg.type) {
            case 'resize':
            case 'after-show':
                this._table_constructed.then(() => {
                    this.hot.render();
                    // working around table not re-rendering fully upon resize.
                    this.hot._refreshBorders(null);
                });
                break;
        }
    },
    _build_widgets_views() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = this.model.data;
            let rows = data.length;
            let cols = data[0].length;
            let widget_view_promises = {};
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    let idx = [row, col].join();
                    if (data[row][col] && data[row][col].options['type'] == 'widget') {
                        let widget = data[row][col].value;
                        let previous_view = this.widget_views[idx];
                        if (previous_view) {
                            if (previous_view.model.cid == widget.cid) { // if this a proper comparison?
                                widget_view_promises[idx] = Promise.resolve(previous_view);
                            }
                            else {
                                previous_view.remove();
                                previous_view = null;
                            }
                        }
                        if (!previous_view && widget) {
                            widget_view_promises[idx] = this.create_child_view(widget);
                        }
                    }
                }
            }
            for (let key in this.widget_views) {
                if (this.widget_views.hasOwnProperty(key)) {
                    // Ugly, this should be properly done
                    let [row, col] = String(key).split(',').map(x => parseInt(x));
                    let widget_view = this.widget_views[key];
                    if (data[row][col] && data[row][col].value && data[row][col].value.cid == widget_view.model.cid) {
                        // good, the previous widget_view should be reused
                    }
                    else {
                        // we have a leftover view from the previous run
                        widget_view.remove();
                    }
                }
            }
            this.widget_views = yield widgets.resolvePromisesDict(widget_view_promises);
        });
    },
    _build_table() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._build_widgets_views();
            return new Handsontable(this.table_container, lodash_1.extend({
                data: this._get_cell_data(),
                rowHeaders: true,
                colHeaders: true,
                search: true,
                columnSorting: {
                    sortEmptyCells: false,
                    indicator: true,
                    headerAction: true,
                    compareFunctionFactory: this._compareFunctionFactory
                },
                cells: (...args) => this._cell(...args),
                afterChange: (changes, source) => { this._on_change(changes, source); },
                afterRemoveCol: (changes, source) => { this._on_change_grid(changes, source); },
                afterRemoveRow: (changes, source) => { this._on_change_grid(changes, source); }
            }, this._hot_settings()));
        });
    },
    _compareFunctionFactory: function (sortOrder, columnMeta) {
        return function (value, nextValue) {
            let a, b;
            if (sortOrder == 'desc') {
                a = value;
                b = nextValue;
            }
            else {
                a = nextValue;
                b = value;
            }
            if (a instanceof widgets.WidgetModel) {
                a = a.get("value");
            }
            if (b instanceof widgets.WidgetModel) {
                b = b.get("value");
            }
            if (a == undefined || b == undefined) {
                return 0;
            }
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
            return 0;
        };
    },
    _update_hot_settings: function () {
        this.hot.updateSettings(this._hot_settings());
    },
    _hot_settings: function () {
        return {
            colHeaders: this.model.get('column_headers'),
            rowHeaders: this.model.get('row_headers'),
            stretchH: this.model.get('stretch_headers'),
            colWidths: this.model.get('column_width') || undefined,
            manualColumnResize: this.model.get('column_resizing'),
            manualRowResize: this.model.get('row_resizing')
        };
    },
    _search: function (render = true, ignore_empty_string = false) {
        let token = this.model.get('search_token');
        if (ignore_empty_string && token == '') {
            return;
        }
        let res = this.hot.getPlugin('search').query(token);
        if (render) {
            this.hot.render();
        }
    },
    _get_cell_data: function () {
        return extract2d(this.model.data, 'value');
    },
    _cell: function (row, col) {
        let data = this.model.data;
        let cellProperties = lodash_1.cloneDeep(data[row][col].options);
        if (!((row < data.length) && (col < data[row].length))) {
            console.error('cell out of range');
        }
        if (cellProperties['type'] == null)
            delete cellProperties['type'];
        if (cellProperties['style'] == null)
            delete cellProperties['style'];
        if (cellProperties['source'] == null)
            delete cellProperties['source'];
        if ('renderer' in cellProperties)
            cellProperties.original_renderer = cellProperties['renderer'];
        cellProperties.renderer = 'styled';
        if (this.widget_views[[row, col].join()]) {
            cellProperties.widget_view = this.widget_views[[row, col].join()];
        }
        return cellProperties;
    },
    _on_change_grid: function (changes, source) {
        let data = this.hot.getSourceDataArray();
        this.model.set({ 'rows': data.length, 'columns': data[0].length });
        this.model.save_changes();
    },
    _on_change: function (changes, source) {
        if (this.hot === undefined || source == 'loadData' || source == 'ObserveChanges.change') {
            return;
        }
        if (source == 'alter') {
            let data = this.hot.getSourceDataArray();
            this.model.set({ 'rows': data.length, 'columns': data[0].length });
            this.model.save_changes();
            return;
        }
        //this.hot.validateCells()
        //*
        //this.hot.validateCells(_.bind(function(valid){
        //    console.log('valid?', valid)
        //    if(valid) {
        let data = this.model.data;
        let value_data = this.hot.getSourceDataArray();
        put_values2d(data, value_data);
        this.model.trigger('data_change');
        //    }
        //}, this))
        /**/
    },
    on_data_change: function () {
        // we create a promise here such that the unittests can wait till the data is really set
        this._last_data_set = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let data = extract2d(this.model.data, 'value');
            let rows = data.length;
            let cols = data[0].length;
            let rows_previous = this.hot.countRows();
            let cols_previous = this.hot.countCols();
            //*
            if (rows > rows_previous) {
                this.hot.alter('insert_row', rows - 1, rows - rows_previous);
            }
            if (rows < this.hot.countRows()) {
                this.hot.alter('remove_row', rows - 1, rows_previous - rows);
            }
            if (cols > cols_previous) {
                this.hot.alter('insert_col', cols - 1, cols - cols_previous);
            }
            if (cols < cols_previous) {
                this.hot.alter('remove_col', cols - 1, cols_previous - cols);
            } /**/
            yield this._build_widgets_views();
            this.hot.loadData(data);
            // if headers are not shows, loadData will make them show again, toggling
            // will fix this (handsontable bug?)
            this.hot.updateSettings({ colHeaders: true, rowHeaders: true });
            this.hot.updateSettings({
                colHeaders: this.model.get('column_headers'),
                rowHeaders: this.model.get('row_headers')
            });
            this._search(false, true);
            this.hot.render();
            resolve();
        }));
    },
    set_cell: function (row, column, value) {
        this.hot.setDataAtCell(row, column, value);
    },
    get_cell: function (row, column) {
        return this.hot.getDataAtCell(row, column);
    }
});
exports.SheetView = SheetView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hlZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc2hlZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxpREFBa0Q7QUFDbEQsbUNBQStHO0FBQy9HLHVDQUF1QztBQUN2Qyx5Q0FBeUM7QUFzZ0JyQyx3QkF0Z0JJLHdCQUFhLENBc2dCSjtBQXJnQmpCLDhCQUE0QjtBQUU1QixhQUFhO0FBQ2IsNkNBQTZDO0FBRTdDLE1BQU07QUFDTixtQ0FBaUM7QUFDakMsa0RBQWdEO0FBQ2hELDZCQUEyQjtBQUczQixJQUFJLGNBQWMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztJQUM1QyxRQUFRLEVBQUU7UUFDTixPQUFPLGVBQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDeEQsV0FBVyxFQUFHLGdCQUFnQjtZQUM5QixhQUFhLEVBQUcsVUFBVTtZQUMxQixxQkFBcUIsRUFBRyxzQkFBWTtZQUNwQyxLQUFLLEVBQUcsSUFBSTtZQUNaLFNBQVMsRUFBRSxDQUFDO1lBQ1osWUFBWSxFQUFFLENBQUM7WUFDZixPQUFPLEVBQUUsQ0FBQztZQUNWLFVBQVUsRUFBRSxDQUFDO1lBQ2IsSUFBSSxFQUFFLElBQUk7WUFDVixJQUFJLEVBQUUsSUFBSTtZQUNWLEtBQUssRUFBRSxFQUFFO1lBQ1QsUUFBUSxFQUFFLElBQUk7WUFDZCxTQUFTLEVBQUUsS0FBSztZQUNoQixNQUFNLEVBQUUsSUFBSTtZQUNaLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLGNBQWMsRUFBRSxJQUFJO1lBQ3BCLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLGNBQWMsRUFBRSxPQUFPO1lBQ3ZCLFdBQVcsRUFBRSxZQUFZO1lBQ3pCLFdBQVcsRUFBRSxXQUFXO1NBQzNCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixFQUFFO0lBQ0MsV0FBVyxFQUFFLGVBQU0sQ0FBQztRQUNoQixLQUFLLEVBQUUsRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLGFBQWEsRUFBRTtLQUNoRCxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDO0NBQ3RDLENBQUMsQ0FBQztBQTRkQyx3Q0FBYztBQXpkbEIsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUM7SUFDM0MsUUFBUSxFQUFFO1FBQ04sT0FBTyxlQUFNLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3BELFdBQVcsRUFBRyxZQUFZO1lBQzFCLFVBQVUsRUFBRyxXQUFXO1lBQ3hCLGFBQWEsRUFBRyxVQUFVO1lBQzFCLFlBQVksRUFBRyxVQUFVO1lBQ3pCLHFCQUFxQixFQUFHLHNCQUFZO1lBQ3BDLG9CQUFvQixFQUFHLHNCQUFZO1lBQ25DLElBQUksRUFBRSxDQUFDO1lBQ1AsT0FBTyxFQUFFLENBQUM7WUFDVixLQUFLLEVBQUUsRUFBRTtZQUNULFdBQVcsRUFBRSxFQUFFO1lBQ2YsV0FBVyxFQUFFLElBQUk7WUFDakIsY0FBYyxFQUFFLElBQUk7WUFDcEIsZUFBZSxFQUFFLEtBQUs7WUFDdEIsWUFBWSxFQUFFLElBQUk7WUFDbEIsZUFBZSxFQUFFLElBQUk7WUFDckIsWUFBWSxFQUFFLElBQUk7WUFDbEIsWUFBWSxFQUFFLEVBQUU7U0FDbkIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUNELFVBQVUsRUFBRztRQUNULFVBQVUsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztRQUM1QixJQUFJLENBQUMsRUFBRSxDQUFDLDRCQUE0QixFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuRSxJQUFJLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDaEQsYUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtRQUN2RCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUE7SUFDeEIsQ0FBQztJQUNELGVBQWUsRUFBRTtRQUNiLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1FBQzNCLElBQUk7WUFDQSxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzVDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDOUIsS0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2xDLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsSUFBRyxDQUFDLGlCQUFRLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxFQUFFO29CQUNoQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN4QjthQUNKO1lBQ0QsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO1lBQ3BCLHNCQUFzQjtTQUN6QjtnQkFBUztZQUNOLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO1NBQy9CO1FBQ0QsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO0lBQ3ZCLENBQUM7SUFDRCxTQUFTLEVBQUUsVUFBUyxJQUFJO1FBQ3BCLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsYUFBYSxDQUFDLEVBQUUsR0FBRyxFQUFFO1lBQ3BJLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDRCxhQUFhLEVBQUU7UUFDWCxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTdCLGFBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDN0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ2pDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBQ0Qsa0JBQWtCLEVBQUUsVUFBUyxJQUFJO1FBQzdCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUIsS0FBSSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzlELEtBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDcEUsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxRQUFRLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3pDLElBQUksUUFBUSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUM1QyxJQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7b0JBQ3BELFNBQVMsQ0FBQyx1Q0FBdUM7Z0JBQ3JELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hDLElBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRTtvQkFDdEIsSUFBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7d0JBQzFCLEtBQUssR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUE7b0JBQzNCLElBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQzt3QkFDdkIsS0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQTtpQkFDOUI7cUJBQU07b0JBQ0gsSUFBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDO3dCQUN2QixLQUFLLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFBO29CQUMzQixJQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQzt3QkFDMUIsS0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQTtpQkFDOUI7Z0JBQ0QsSUFBSSxLQUFLLElBQUksSUFBSTtvQkFDYixTQUFTLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztnQkFDNUIsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUk7b0JBQ3hCLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDakQsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUk7b0JBQzVCLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDekQsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUk7b0JBQzdCLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDMUQsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUk7b0JBQzFCLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtnQkFDcEQsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxTQUFTO29CQUMzRCxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsRUFBQyxDQUFDO2dCQUNqRixJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxNQUFNLEVBQUU7b0JBQ3ZELFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEdBQUcsSUFBSSxDQUFDO29CQUMxQyxTQUFTLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztpQkFDaEc7Z0JBQ0QsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksTUFBTSxFQUFFO29CQUN2RCxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQztvQkFDMUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQ2hHO2dCQUVELFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsZUFBTSxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzthQUMxRjtTQUNKO0lBQ0wsQ0FBQztJQUVELFlBQVksRUFBRTtRQUNWLElBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNwQixPQUFPO1NBQ1Y7UUFDRCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztRQUMzQixJQUFJO1lBQ0EsYUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDN0IsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUNkLEtBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDOUQsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO29CQUNiLEtBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDcEUsMkNBQTJDO3dCQUMzQyw4Q0FBOEM7d0JBQzlDLElBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQzs0QkFDcEQsU0FBUyxDQUFDLHVDQUF1Qzt3QkFDckQsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDaEMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUE7d0JBQ3pCOzs7Ozs7MEVBTWtEO3FCQUNyRDtvQkFDRCxJQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsRUFBRTt3QkFDM0IsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDaEI7b0JBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDbEI7Z0JBQ0QsSUFBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUFFO29CQUN4QixJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNsQjtnQkFDRCxJQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUU7b0JBQ3RCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO2lCQUNyQztxQkFBTTtvQkFDSCxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQTtpQkFDMUI7Z0JBQ0QsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxDQUFDO1NBQ047Z0JBQVM7WUFDTixJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztTQUMvQjtJQUNMLENBQUM7SUFDRCxnQkFBZ0IsRUFBRSxVQUFTLG9CQUFvQixHQUFDLElBQUk7UUFDaEQseURBQXlEO1FBQ3pELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVsQyxJQUFJLFVBQVUsR0FBRyxHQUFHLEVBQUU7WUFDbEIsT0FBTyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDLEVBQUUsRUFBQyxDQUFDO1FBQ3JDLENBQUMsQ0FBQztRQUNGLElBQUksU0FBUyxHQUFHLEdBQUcsRUFBRTtZQUNqQixPQUFPLGNBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2xELENBQUMsQ0FBQztRQUNGLElBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3hCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3hDO2FBQU0sSUFBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDL0IsS0FBSSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO2FBQy9CO1NBQ0o7UUFDRCxLQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzFCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsSUFBRyxPQUFPLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRTtnQkFDckIsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQy9CO2lCQUFNLElBQUcsT0FBTyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUU7Z0JBQzVCLEtBQUksSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUN0QyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7aUJBQzFCO2FBQ0o7WUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztTQUN0QjtRQUNELElBQUksb0JBQW9CLEVBQUU7WUFDdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUMvQjtJQUNMLENBQUM7Q0FDSixFQUFFO0lBQ0MsV0FBVyxFQUFFLGVBQU0sQ0FBQztRQUNoQixLQUFLLEVBQUUsRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLGFBQWEsRUFBRTtRQUM3QyxJQUFJLEVBQUUsRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLGFBQWEsRUFBRTtLQUMvQyxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDO0NBQ3pDLENBQUMsQ0FBQztBQXFSQyxnQ0FBVTtBQW5SZCxpR0FBaUc7QUFDakcsSUFBSSxTQUFTLEdBQUcsVUFBUyxJQUFJLEVBQUUsSUFBSTtJQUMvQixPQUFPLFlBQUcsQ0FBQyxJQUFJLEVBQUUsVUFBUyxNQUFNO1FBQzVCLE9BQU8sWUFBRyxDQUFDLE1BQU0sRUFBRSxVQUFTLEtBQUs7WUFDN0IsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQztBQUVGLG1CQUFtQjtBQUNuQixJQUFJLFlBQVksR0FBRyxVQUFTLElBQUksRUFBRSxNQUFNO0lBQ3BDLHlFQUF5RTtJQUN6RSxLQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUMxRCxLQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNoRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNuQztLQUNKO0FBQ0wsQ0FBQyxDQUFDO0FBRUYsOERBQThEO0FBQzdELFlBQVksQ0FBQyxTQUFpQixDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxTQUFTLGNBQWMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxjQUFjO0lBQ3hJLElBQUksSUFBSSxHQUFHLGNBQWMsQ0FBQyxpQkFBaUIsSUFBSSxjQUFjLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQztJQUM3RSxJQUFJLGlCQUFpQixHQUFJLFlBQVksQ0FBQyxTQUFpQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxRSxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3pDLGFBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFVBQVMsS0FBSyxFQUFFLEdBQUc7UUFDMUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDMUIsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDO0lBQ3pDLE1BQU0sRUFBRTtRQUNKLGlDQUFpQztRQUNqQyxJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQTtRQUN0QixJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMxQywrQkFBK0I7UUFDL0IsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQVMsRUFBRTtZQUNyRCxJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLDBDQUEwQyxFQUFFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMzRixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyw0Q0FBNEMsRUFBRSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0YsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsNENBQTRDLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdGLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ2xCLENBQUMsQ0FBQSxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ0Qsc0JBQXNCLEVBQUUsVUFBUyxHQUFHO1FBQ2hDLFNBQVMsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNsRSxRQUFRLEdBQUcsQ0FBQyxJQUFJLEVBQUU7WUFDbEIsS0FBSyxRQUFRLENBQUM7WUFDZCxLQUFLLFlBQVk7Z0JBQ2IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ2xCLDJEQUEyRDtvQkFDM0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25DLENBQUMsQ0FBQyxDQUFDO2dCQUNILE1BQU07U0FDVDtJQUNMLENBQUM7SUFDSyxvQkFBb0I7O1lBQ3RCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQzNCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDdkIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUMxQixJQUFJLG9CQUFvQixHQUFHLEVBQUUsQ0FBQTtZQUM3QixLQUFLLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFO2dCQUNqQyxLQUFLLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFO29CQUNqQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDNUIsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxRQUFRLEVBQUU7d0JBQzlELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7d0JBQ2xDLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQzNDLElBQUksYUFBYSxFQUFFOzRCQUNmLElBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsRUFBRSxFQUFFLCtCQUErQjtnQ0FDdkUsb0JBQW9CLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQTs2QkFDN0Q7aUNBQU07Z0NBQ0gsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFBO2dDQUN0QixhQUFhLEdBQUcsSUFBSSxDQUFDOzZCQUN4Qjt5QkFDSjt3QkFDRCxJQUFJLENBQUMsYUFBYSxJQUFJLE1BQU0sRUFBRTs0QkFDMUIsb0JBQW9CLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO3lCQUM5RDtxQkFDSjtpQkFDSjthQUNKO1lBQ0QsS0FBSyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUMvQixJQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUN0QyxxQ0FBcUM7b0JBQ3JDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDOUQsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDekMsSUFBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTt3QkFDNUYsa0RBQWtEO3FCQUNyRDt5QkFBTTt3QkFDSCxnREFBZ0Q7d0JBQ2hELFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztxQkFDeEI7aUJBQ0o7YUFDSjtZQUNELElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxPQUFPLENBQUMsbUJBQW1CLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtRQUMvRSxDQUFDO0tBQUE7SUFDSyxZQUFZOztZQUNkLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUE7WUFDakMsT0FBTyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLGVBQU0sQ0FBQztnQkFDakQsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQzNCLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixVQUFVLEVBQUUsSUFBSTtnQkFDaEIsTUFBTSxFQUFFLElBQUk7Z0JBQ1osYUFBYSxFQUFFO29CQUNYLGNBQWMsRUFBRSxLQUFLO29CQUNyQixTQUFTLEVBQUUsSUFBSTtvQkFDZixZQUFZLEVBQUUsSUFBSTtvQkFDbEIsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLHVCQUF1QjtpQkFDdkQ7Z0JBQ0QsS0FBSyxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUM7Z0JBQ3ZDLFdBQVcsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkUsY0FBYyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvRSxjQUFjLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbEYsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlCLENBQUM7S0FBQTtJQUNELHVCQUF1QixFQUFFLFVBQVMsU0FBUyxFQUFFLFVBQVU7UUFDbkQsT0FBTyxVQUFTLEtBQUssRUFBRSxTQUFTO1lBQzVCLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNULElBQUksU0FBUyxJQUFJLE1BQU0sRUFBRTtnQkFDckIsQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDVixDQUFDLEdBQUcsU0FBUyxDQUFDO2FBQ2pCO2lCQUFNO2dCQUNILENBQUMsR0FBRyxTQUFTLENBQUM7Z0JBQ2QsQ0FBQyxHQUFHLEtBQUssQ0FBQzthQUNiO1lBRUQsSUFBSSxDQUFDLFlBQVksT0FBTyxDQUFDLFdBQVcsRUFBRTtnQkFDbEMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDdEI7WUFFRCxJQUFJLENBQUMsWUFBWSxPQUFPLENBQUMsV0FBVyxFQUFFO2dCQUNsQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUN0QjtZQUVELElBQUksQ0FBQyxJQUFJLFNBQVMsSUFBSSxDQUFDLElBQUksU0FBUyxFQUFFO2dCQUNsQyxPQUFPLENBQUMsQ0FBQzthQUNaO1lBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNQLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDYjtZQUNELElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDUCxPQUFPLENBQUMsQ0FBQzthQUNaO1lBRUQsT0FBTyxDQUFDLENBQUM7UUFDYixDQUFDLENBQUE7SUFDTCxDQUFDO0lBQ0Qsb0JBQW9CLEVBQUU7UUFDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUNELGFBQWEsRUFBRTtRQUNYLE9BQU87WUFDSCxVQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7WUFDNUMsVUFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQztZQUN6QyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUM7WUFDM0MsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLFNBQVM7WUFDdEQsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUM7WUFDckQsZUFBZSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQztTQUNsRCxDQUFDO0lBQ04sQ0FBQztJQUNELE9BQU8sRUFBRSxVQUFTLE1BQU0sR0FBQyxJQUFJLEVBQUUsbUJBQW1CLEdBQUMsS0FBSztRQUNwRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUMzQyxJQUFJLG1CQUFtQixJQUFJLEtBQUssSUFBSSxFQUFFLEVBQUU7WUFDcEMsT0FBTztTQUNWO1FBRUQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BELElBQUksTUFBTSxFQUFFO1lBQ1IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNyQjtJQUNMLENBQUM7SUFDRCxjQUFjLEVBQUU7UUFDWixPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBQ0QsS0FBSyxFQUFFLFVBQVMsR0FBRyxFQUFFLEdBQUc7UUFDcEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDM0IsSUFBSSxjQUFjLEdBQUcsa0JBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkQsSUFBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFO1lBQ25ELE9BQU8sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztTQUN0QztRQUNELElBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUk7WUFDN0IsT0FBTyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEMsSUFBRyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSTtZQUM5QixPQUFPLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuQyxJQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJO1lBQy9CLE9BQU8sY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BDLElBQUcsVUFBVSxJQUFJLGNBQWM7WUFDM0IsY0FBYyxDQUFDLGlCQUFpQixHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNsRSxjQUFjLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUNuQyxJQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRTtZQUNyQyxjQUFjLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtTQUNwRTtRQUNELE9BQU8sY0FBYyxDQUFDO0lBQzFCLENBQUM7SUFDRCxlQUFlLEVBQUUsVUFBUyxPQUFPLEVBQUUsTUFBTTtRQUNyQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDekMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFDakUsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBQ0QsVUFBVSxFQUFFLFVBQVMsT0FBTyxFQUFFLE1BQU07UUFDaEMsSUFBRyxJQUFJLENBQUMsR0FBRyxLQUFLLFNBQVMsSUFBSSxNQUFNLElBQUksVUFBVSxJQUFJLE1BQU0sSUFBSSx1QkFBdUIsRUFBRTtZQUNwRixPQUFPO1NBQ1Y7UUFDRCxJQUFHLE1BQU0sSUFBSSxPQUFPLEVBQUU7WUFDbEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDO1lBQ2pFLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDMUIsT0FBTztTQUNWO1FBQ0QsMEJBQTBCO1FBQzFCLEdBQUc7UUFDSCxnREFBZ0Q7UUFDaEQsa0NBQWtDO1FBQ2xDLGlCQUFpQjtRQUNqQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztRQUMzQixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDL0MsWUFBWSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNsQyxPQUFPO1FBQ1AsV0FBVztRQUNYLElBQUk7SUFDUixDQUFDO0lBQ0QsY0FBYyxFQUFFO1FBQ1osd0ZBQXdGO1FBQ3hGLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBTyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDeEQsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQy9DLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDdkIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUMxQixJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3pDLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDekMsR0FBRztZQUNILElBQUcsSUFBSSxHQUFHLGFBQWEsRUFBRTtnQkFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLElBQUksR0FBQyxDQUFDLEVBQUUsSUFBSSxHQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQzVEO1lBQ0QsSUFBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLElBQUksR0FBQyxDQUFDLEVBQUUsYUFBYSxHQUFDLElBQUksQ0FBQyxDQUFDO2FBQzVEO1lBQ0QsSUFBRyxJQUFJLEdBQUcsYUFBYSxFQUFFO2dCQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsSUFBSSxHQUFDLENBQUMsRUFBRSxJQUFJLEdBQUMsYUFBYSxDQUFDLENBQUM7YUFDNUQ7WUFDRCxJQUFHLElBQUksR0FBRyxhQUFhLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxJQUFJLEdBQUMsQ0FBQyxFQUFFLGFBQWEsR0FBQyxJQUFJLENBQUMsQ0FBQzthQUM1RCxDQUFBLElBQUk7WUFDTCxNQUFNLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFBO1lBRWpDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hCLHlFQUF5RTtZQUN6RSxvQ0FBb0M7WUFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDO2dCQUNwQixVQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7Z0JBQzVDLFVBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUM7YUFDNUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNsQixPQUFPLEVBQUUsQ0FBQTtRQUNiLENBQUMsQ0FBQSxDQUFDLENBQUE7SUFDTixDQUFDO0lBQ0QsUUFBUSxFQUFFLFVBQVMsR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLO1FBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUNELFFBQVEsRUFBRSxVQUFTLEdBQUcsRUFBRSxNQUFNO1FBQzFCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQy9DLENBQUM7Q0FDSixDQUFDLENBQUM7QUFNQyw4QkFBUyJ9