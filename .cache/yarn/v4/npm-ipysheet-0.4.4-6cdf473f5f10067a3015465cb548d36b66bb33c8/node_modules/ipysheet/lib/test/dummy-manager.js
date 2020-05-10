"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const widgets = require("@jupyter-widgets/base");
let numComms = 0;
class MockComm {
    constructor() {
        this._on_msg = null;
        this._on_open = null;
        this._on_close = null;
        this.comm_id = `mock-comm-id-${numComms}`;
        numComms += 1;
    }
    on_open(fn) {
        this._on_open = fn;
    }
    on_close(fn) {
        this._on_close = fn;
    }
    on_msg(fn) {
        this._on_msg = fn;
    }
    _process_msg(msg) {
        if (this._on_msg) {
            return this._on_msg(msg);
        }
        else {
            return Promise.resolve();
        }
    }
    open() {
        if (this._on_open) {
            this._on_open();
        }
        return '';
    }
    close() {
        if (this._on_close) {
            this._on_close();
        }
        return '';
    }
    send() {
        return '';
    }
}
exports.MockComm = MockComm;
class DummyManager extends widgets.ManagerBase {
    constructor(library) {
        super();
        this.el = window.document.createElement('div');
        window.document.body.appendChild(this.el);
        this.library = library;
    }
    display_view(msg, view, options) {
        // TODO: make this a spy
        // TODO: return an html element
        return Promise.resolve(view).then(view => {
            this.el.appendChild(view.el);
            view.on('remove', () => console.log('view removed', view));
            window.last_view = view;
            //view.render()
            view.trigger('displayed');
            return view.el;
        });
    }
    loadClass(className, moduleName, moduleVersion) {
        if (moduleName === '@jupyter-widgets/controls') {
            if (widgets[className]) {
                return Promise.resolve(widgets[className]);
            }
            else {
                return Promise.reject(`Cannot find class ${className}`);
            }
        }
        else if (moduleName === 'test-widgets') {
            if (testWidgets[className]) {
                return Promise.resolve(testWidgets[className]);
            }
            else {
                return Promise.reject(`Cannot find class ${className}`);
            }
        }
        else if (moduleName in this.library) {
            return Promise.resolve(this.library[moduleName][className]);
        }
        else {
            return Promise.reject(`Cannot find module ${moduleName}`);
        }
    }
    _get_comm_info() {
        return Promise.resolve({});
    }
    _create_comm() {
        return Promise.resolve(new MockComm());
    }
    setViewOptions(options) {
        // mimics widgetsnbextension's manager that goes with ipywidgets<=7.3.2
        var options = options || {};
        if (!options.output && options.parent) {
            // use the parent output if we don't have one
            options.output = options.parent.options.output;
        }
        options.iopub_callbacks = {
            output: options.output.handle_output.bind(options.output),
            clear_output: options.output.handle_clear_output.bind(options.output)
        };
        return options;
    }
}
exports.DummyManager = DummyManager;
// Dummy widget with custom serializer and binary field
let typesToArray = {
    int8: Int8Array,
    int16: Int16Array,
    int32: Int32Array,
    uint8: Uint8Array,
    uint16: Uint16Array,
    uint32: Uint32Array,
    float32: Float32Array,
    float64: Float64Array
};
let JSONToArray = function (obj, manager) {
    return new typesToArray[obj.dtype](obj.buffer.buffer);
};
let arrayToJSON = function (obj, manager) {
    let dtype = Object.keys(typesToArray).filter(i => typesToArray[i] === obj.constructor)[0];
    return { dtype, buffer: obj };
};
let array_serialization = {
    deserialize: JSONToArray,
    serialize: arrayToJSON
};
class TestWidget extends widgets.WidgetModel {
    defaults() {
        return Object.assign(Object.assign({}, super.defaults()), { _model_module: 'test-widgets', _model_name: 'TestWidget', _model_module_version: '1.0.0', _view_module: 'test-widgets', _view_name: 'TestWidgetView', _view_module_version: '1.0.0', value: 0 });
    }
}
class TestWidgetView extends widgets.WidgetView {
    render() {
        this.el.innerHTML = this.model.get('value');
        this.model.on('change:value', () => {
            this.el.innerHTML = this.model.get('value');
        });
    }
}
let testWidgets = { TestWidget, TestWidgetView };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHVtbXktbWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZXN0L2R1bW15LW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDBDQUEwQztBQUMxQywyREFBMkQ7O0FBTTNELGlEQUFpRDtBQUdqRCxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFFakIsTUFDTSxRQUFRO0lBQ1Y7UUFxQ0EsWUFBTyxHQUFhLElBQUksQ0FBQztRQUN6QixhQUFRLEdBQWEsSUFBSSxDQUFDO1FBQzFCLGNBQVMsR0FBYSxJQUFJLENBQUM7UUF0Q3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsZ0JBQWdCLFFBQVEsRUFBRSxDQUFDO1FBQzFDLFFBQVEsSUFBSSxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUNELE9BQU8sQ0FBQyxFQUFFO1FBQ04sSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUNELFFBQVEsQ0FBQyxFQUFFO1FBQ1AsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUNELE1BQU0sQ0FBQyxFQUFFO1FBQ0wsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUNELFlBQVksQ0FBQyxHQUFHO1FBQ1osSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzVCO2FBQU07WUFDSCxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUM1QjtJQUNMLENBQUM7SUFDRCxJQUFJO1FBQ0EsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2YsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ25CO1FBQ0QsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0lBQ0QsS0FBSztRQUNELElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNoQixJQUFJLENBQUMsU0FB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