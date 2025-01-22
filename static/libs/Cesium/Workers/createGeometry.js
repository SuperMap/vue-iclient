/**
 * Cesium - https://github.com/AnalyticalGraphicsInc/cesium
 *
 * Copyright 2011-2017 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/AnalyticalGraphicsInc/cesium/blob/master/LICENSE.md for full licensing details.
 */
define(['./when-a55a8a4c', './Check-bc1d37d9', './Math-edfe2d1c', './Cartesian2-52d9479f', './BoundingSphere-ab31357a', './RuntimeError-7c184ac0', './WebGLConstants-4c11ee5f', './ComponentDatatype-919a7463', './GeometryAttribute-ba19792d', './PrimitiveType-97893bc7', './FeatureDetection-bac17d71', './Transforms-794e44e6', './buildModuleUrl-02e5236f', './GeometryAttributes-1c7ce91d', './AttributeCompression-4a5b893f', './GeometryPipeline-5d611954', './EncodedCartesian3-daa1cb04', './IndexDatatype-18a8cae6', './IntersectionTests-afd4a13d', './Plane-68b37818', './PrimitivePipeline-a59f787d', './WebMercatorProjection-65629b9f', './createTaskProcessorWorker'], function (when, Check, _Math, Cartesian2, BoundingSphere, RuntimeError, WebGLConstants, ComponentDatatype, GeometryAttribute, PrimitiveType, FeatureDetection, Transforms, buildModuleUrl, GeometryAttributes, AttributeCompression, GeometryPipeline, EncodedCartesian3, IndexDatatype, IntersectionTests, Plane, PrimitivePipeline, WebMercatorProjection, createTaskProcessorWorker) { 'use strict';

    /* global require */

    var moduleCache = {};

    function getModule(moduleName) {
        var module = moduleCache[moduleName];
        if (!when.defined(module)) {
            if (typeof exports === 'object') {
                // Use CommonJS-style require.
                moduleCache[module] = module = require('Workers/' + moduleName);
            } else {
                // Use AMD-style require.
                // in web workers, require is synchronous
                require(['Workers/' + moduleName], function(f) {
                    module = f;
                    moduleCache[module] = f;
                });
            }
        }
        return module;
    }

    function createGeometry(parameters, transferableObjects) {
        var subTasks = parameters.subTasks;
        var length = subTasks.length;
        var resultsOrPromises = new Array(length);

        for (var i = 0; i < length; i++) {
            var task = subTasks[i];
            var geometry = task.geometry;
            var moduleName = task.moduleName;

            if (when.defined(moduleName)) {
                var createFunction = getModule(moduleName);
                resultsOrPromises[i] = createFunction(geometry, task.offset);
            } else {
                //Already created geometry
                resultsOrPromises[i] = geometry;
            }
        }

        return when.when.all(resultsOrPromises, function(results) {
            return PrimitivePipeline.PrimitivePipeline.packCreateGeometryResults(results, transferableObjects);
        });
    }
    var createGeometry$1 = createTaskProcessorWorker(createGeometry);

    return createGeometry$1;

});
