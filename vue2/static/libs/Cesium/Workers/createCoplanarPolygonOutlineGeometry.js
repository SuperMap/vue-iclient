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
define(['./when-a55a8a4c', './Check-bc1d37d9', './Math-edfe2d1c', './Cartesian2-52d9479f', './BoundingSphere-ab31357a', './RuntimeError-7c184ac0', './WebGLConstants-4c11ee5f', './ComponentDatatype-919a7463', './GeometryAttribute-ba19792d', './PrimitiveType-97893bc7', './FeatureDetection-bac17d71', './Transforms-794e44e6', './buildModuleUrl-02e5236f', './GeometryAttributes-1c7ce91d', './AttributeCompression-4a5b893f', './GeometryPipeline-5d611954', './EncodedCartesian3-daa1cb04', './IndexDatatype-18a8cae6', './IntersectionTests-afd4a13d', './Plane-68b37818', './GeometryInstance-2015f767', './arrayRemoveDuplicates-aafa59fd', './EllipsoidTangentPlane-7eb9b50e', './OrientedBoundingBox-80ab75fe', './CoplanarPolygonGeometryLibrary-1a473f13', './ArcType-66bc286a', './EllipsoidRhumbLine-c9b776a6', './earcut-2.2.1-b404d9e6', './PolygonPipeline-0532ac9c', './PolygonGeometryLibrary-adc41ee0'], function (when, Check, _Math, Cartesian2, BoundingSphere, RuntimeError, WebGLConstants, ComponentDatatype, GeometryAttribute, PrimitiveType, FeatureDetection, Transforms, buildModuleUrl, GeometryAttributes, AttributeCompression, GeometryPipeline, EncodedCartesian3, IndexDatatype, IntersectionTests, Plane, GeometryInstance, arrayRemoveDuplicates, EllipsoidTangentPlane, OrientedBoundingBox, CoplanarPolygonGeometryLibrary, ArcType, EllipsoidRhumbLine, earcut2_2_1, PolygonPipeline, PolygonGeometryLibrary) { 'use strict';

    function createGeometryFromPositions(positions){
            var length = positions.length;
            var flatPositions = new Float64Array(length * 3);
            var indices = IndexDatatype.IndexDatatype.createTypedArray(length, length * 2);

            var positionIndex = 0;
            var index = 0;

            for (var i = 0; i < length; i++) {
                var position = positions[i];
                flatPositions[positionIndex++] = position.x;
                flatPositions[positionIndex++] = position.y;
                flatPositions[positionIndex++] = position.z;

                indices[index++] = i;
                indices[index++] = (i + 1) % length;
            }

            var attributes = new GeometryAttributes.GeometryAttributes({
                position: new GeometryAttribute.GeometryAttribute({
                    componentDatatype : ComponentDatatype.ComponentDatatype.DOUBLE,
                    componentsPerAttribute : 3,
                    values : flatPositions
                })
            });

            return new GeometryAttribute.Geometry({
                attributes : attributes,
                indices : indices,
                primitiveType : PrimitiveType.PrimitiveType.LINES
            });
        }

        /**
         * A description of the outline of a polygon composed of arbitrary coplanar positions.
         *
         * @alias CoplanarPolygonOutlineGeometry
         * @constructor
         *
         * @param {Object} options Object with the following properties:
         * @param {PolygonHierarchy} options.polygonHierarchy A polygon hierarchy that can include holes.
         *
         * @see CoplanarPolygonOutlineGeometry.createGeometry
         *
         * @example
         * var polygonOutline = new Cesium.CoplanarPolygonOutlineGeometry({
         *   positions : Cesium.Cartesian3.fromDegreesArrayHeights([
         *      -90.0, 30.0, 0.0,
         *      -90.0, 30.0, 1000.0,
         *      -80.0, 30.0, 1000.0,
         *      -80.0, 30.0, 0.0
         *   ])
         * });
         * var geometry = Cesium.CoplanarPolygonOutlineGeometry.createGeometry(polygonOutline);
         */
        function CoplanarPolygonOutlineGeometry(options) {
            options = when.defaultValue(options, when.defaultValue.EMPTY_OBJECT);
            var polygonHierarchy = options.polygonHierarchy;
            //>>includeStart('debug', pragmas.debug);
            Check.Check.defined('options.polygonHierarchy', polygonHierarchy);
            //>>includeEnd('debug');

            this._polygonHierarchy = polygonHierarchy;
            this._workerName = 'createCoplanarPolygonOutlineGeometry';

            /**
             * The number of elements used to pack the object into an array.
             * @type {Number}
             */
            this.packedLength = PolygonGeometryLibrary.PolygonGeometryLibrary.computeHierarchyPackedLength(polygonHierarchy) + 1;
        }

        /**
         * A description of a coplanar polygon outline from an array of positions.
         *
         * @param {Object} options Object with the following properties:
         * @param {Cartesian3[]} options.positions An array of positions that defined the corner points of the polygon.
         * @returns {CoplanarPolygonOutlineGeometry}
         */
        CoplanarPolygonOutlineGeometry.fromPositions = function(options) {
            options = when.defaultValue(options, when.defaultValue.EMPTY_OBJECT);

            //>>includeStart('debug', pragmas.debug);
            Check.Check.defined('options.positions', options.positions);
            //>>includeEnd('debug');

            var newOptions = {
                polygonHierarchy : {
                    positions : options.positions
                }
            };
            return new CoplanarPolygonOutlineGeometry(newOptions);
        };

        /**
         * Stores the provided instance into the provided array.
         *
         * @param {CoplanarPolygonOutlineGeometry} value The value to pack.
         * @param {Number[]} array The array to pack into.
         * @param {Number} [startingIndex=0] The index into the array at which to start packing the elements.
         *
         * @returns {Number[]} The array that was packed into
         */
        CoplanarPolygonOutlineGeometry.pack = function(value, array, startingIndex) {
            //>>includeStart('debug', pragmas.debug);
            Check.Check.typeOf.object('value', value);
            Check.Check.defined('array', array);
            //>>includeEnd('debug');

            startingIndex = when.defaultValue(startingIndex, 0);

            startingIndex = PolygonGeometryLibrary.PolygonGeometryLibrary.packPolygonHierarchy(value._polygonHierarchy, array, startingIndex);

            array[startingIndex] = value.packedLength;

            return array;
        };

        var scratchOptions = {
            polygonHierarchy : {}
        };
        /**
         * Retrieves an instance from a packed array.
         *
         * @param {Number[]} array The packed array.
         * @param {Number} [startingIndex=0] The starting index of the element to be unpacked.
         * @param {CoplanarPolygonOutlineGeometry} [result] The object into which to store the result.
         * @returns {CoplanarPolygonOutlineGeometry} The modified result parameter or a new CoplanarPolygonOutlineGeometry instance if one was not provided.
         */
        CoplanarPolygonOutlineGeometry.unpack = function(array, startingIndex, result) {
            //>>includeStart('debug', pragmas.debug);
            Check.Check.defined('array', array);
            //>>includeEnd('debug');

            startingIndex = when.defaultValue(startingIndex, 0);

            var polygonHierarchy = PolygonGeometryLibrary.PolygonGeometryLibrary.unpackPolygonHierarchy(array, startingIndex);
            startingIndex = polygonHierarchy.startingIndex;
            delete polygonHierarchy.startingIndex;
            var packedLength = array[startingIndex];

            if (!when.defined(result)) {
                result = new CoplanarPolygonOutlineGeometry(scratchOptions);
            }

            result._polygonHierarchy = polygonHierarchy;
            result.packedLength = packedLength;

            return result;
        };

        /**
         * Computes the geometric representation of an arbitrary coplanar polygon, including its vertices, indices, and a bounding sphere.
         *
         * @param {CoplanarPolygonOutlineGeometry} polygonGeometry A description of the polygon.
         * @returns {Geometry|undefined} The computed vertices and indices.
         */
        CoplanarPolygonOutlineGeometry.createGeometry = function(polygonGeometry) {
            var polygonHierarchy = polygonGeometry._polygonHierarchy;

            var outerPositions = polygonHierarchy.positions;
            outerPositions = arrayRemoveDuplicates.arrayRemoveDuplicates(outerPositions, Cartesian2.Cartesian3.equalsEpsilon, true);
            if (outerPositions.length < 3) {
                return;
            }
            var isValid = CoplanarPolygonGeometryLibrary.CoplanarPolygonGeometryLibrary.validOutline(outerPositions);
            if (!isValid) {
                return undefined;
            }

            var polygons = PolygonGeometryLibrary.PolygonGeometryLibrary.polygonOutlinesFromHierarchy(polygonHierarchy, false);

            if (polygons.length === 0) {
                return undefined;
            }

            var geometries = [];

            for (var i = 0; i < polygons.length; i++) {
                var geometryInstance = new GeometryInstance.GeometryInstance({
                    geometry : createGeometryFromPositions(polygons[i])
                });
                geometries.push(geometryInstance);
            }

            var geometry = GeometryPipeline.GeometryPipeline.combineInstances(geometries)[0];
            var boundingSphere = BoundingSphere.BoundingSphere.fromPoints(polygonHierarchy.positions);

            return new GeometryAttribute.Geometry({
                attributes : geometry.attributes,
                indices : geometry.indices,
                primitiveType : geometry.primitiveType,
                boundingSphere : boundingSphere
            });
        };

    function createCoplanarPolygonOutlineGeometry(polygonGeometry, offset) {
        if (when.defined(offset)) {
            polygonGeometry = CoplanarPolygonOutlineGeometry.unpack(polygonGeometry, offset);
        }
        polygonGeometry._ellipsoid = Cartesian2.Ellipsoid.clone(polygonGeometry._ellipsoid);
        return CoplanarPolygonOutlineGeometry.createGeometry(polygonGeometry);
    }

    return createCoplanarPolygonOutlineGeometry;

});
