"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const widgets = require("@jupyter-widgets/base");
const Handsontable = require("handsontable");
const lodash_1 = require("lodash");
const version_1 = require("./version");
class ExecuteRequest {
    constructor(code) {
        this.id = widgets.uuid();
        this.code = code;
        this.execute_promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}
exports.ExecuteRequest = ExecuteRequest;
;
class SafeJSKernel {
    constructor() {
        this.requests = {};
        this.initialize();
    }
    execute(code) {
        const request = new ExecuteRequest(code);
        this.requests[request.id] = request;
        this.worker.postMessage({ id: request.id, code: request.code });
        return request.execute_promise;
    }
    initialize() {
        const blobURL = URL.createObjectURL(new Blob([
            '(',
            function () {
                const _postMessage = postMessage;
                const _addEventListener = addEventListener;
                ((obj) => {
                    'use strict';
                    let current = obj;
                    const keepProperties = [
                        // required
                        'Object', 'Function', 'Infinity', 'NaN', 'undefined', 'caches', 'TEMPORARY', 'PERSISTENT',
                        // optional, but trivial to get back
                        'Array', 'Boolean', 'Number', 'String', 'Symbol',
                        // optional
                        'Map', 'Math', 'Set',
                    ];
                    do {
                        Object.getOwnPropertyNames(current).forEach((name) => {
                            if (keepProperties.indexOf(name) === -1) {
                                delete current[name];
                            }
                        });
                        current = Object.getPrototypeOf(current);
                    } while (current !== Object.prototype);
                })(this);
                _addEventListener('message', ({ data }) => {
                    const f = new Function('', `return (${data.code}\n);`);
                    _postMessage({ id: data.id, result: f() }, undefined);
                });
            }.toString(),
            ')()'
        ], {
            type: 'application/javascript'
        }));
        this.worker = new Worker(blobURL);
        this.worker.onmessage = ({ data }) => {
            // Resolve the right Promise with the return value
            this.requests[data.id].resolve(data.result);
            delete this.requests[data.id];
        };
        this.worker.onerror = ({ message }) => {
            // Reject all the pending promises, terminate the worker and start again
            lodash_1.forEach(this.requests, (request) => {
                request.reject(message);
            });
            this.requests = {};
            this.worker.terminate();
            this.initialize();
        };
        URL.revokeObjectURL(blobURL);
    }
}
exports.SafeJSKernel = SafeJSKernel;
class RendererModel extends widgets.WidgetModel {
    defaults() {
        return Object.assign(Object.assign({}, widgets.WidgetModel.prototype.defaults()), { _model_name: 'RendererModel', _model_module: 'ipysheet', _model_module_version: version_1.semver_range, name: '', code: '' });
    }
    initialize(attributes, options) {
        super.initialize(attributes, options);
        this.kernel = new SafeJSKernel();
        const that = this;
        this.rendering_function = function (instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);
            that.kernel.execute(`(${that.get('code')})(${value})`).then((style) => {
                Object.assign(td.style, style);
            });
        };
        Handsontable.renderers.registerRenderer(this.get('name'), this.rendering_function);
    }
}
exports.RendererModel = RendererModel;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpREFBa0Q7QUFDbEQsNkNBQTZDO0FBQzdDLG1DQUF1QztBQUN2Qyx1Q0FBdUM7QUFHdkMsTUFBYSxjQUFjO0lBQ3ZCLFlBQVksSUFBWTtRQUNwQixJQUFJLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUVqQixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25ELElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQU9KO0FBaEJELHdDQWdCQztBQUFBLENBQUM7QUFHRixNQUFhLFlBQVk7SUFDckI7UUErRUEsYUFBUSxHQUF1QyxFQUFFLENBQUM7UUE5RTlDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQVk7UUFDaEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFekMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBRXBDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRWhFLE9BQU8sT0FBTyxDQUFDLGVBQWUsQ0FBQztJQUNuQyxDQUFDO0lBRUQsVUFBVTtRQUNOLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxlQUFl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