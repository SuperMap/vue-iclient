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

    function combineGeometry(packedParameters, transferableObjects) {
        var parameters = PrimitivePipeline.PrimitivePipeline.unpackCombineGeometryParameters(packedParameters);
        var results = PrimitivePipeline.PrimitivePipeline.combineGeometry(parameters);
        return PrimitivePipeline.PrimitivePipeline.packCombineGeometryResults(results, transferableObjects);
    }

    var combineGeometry$1 = createTaskProcessorWorker(combineGeometry);

    return combineGeometry$1;

});
