"use strict";
/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var vue_router_1 = require("vue-router");
var vue_1 = require("vue");
var demoRoutes_1 = require("./router/demoRoutes");
var index_common_1 = require("@supermapgis/common/utils/index.common");
var Button_1 = require("@supermapgis/common/components/button/Button");
var dayjs_1 = require("dayjs");
require("dayjs/locale/zh-cn");
dayjs_1.default.locale('zh-cn');
var routes = (0, vue_1.reactive)(demoRoutes_1.default);
var theme = (0, vue_1.ref)('light');
(0, vue_1.onBeforeMount)(function () {
    (0, index_common_1.setTheme)({ themeStyle: theme.value });
});
var changeStyle = function () {
    (0, index_common_1.setTheme)({ themeStyle: 'dark' });
};
var changeStyle1 = function () {
    (0, index_common_1.setTheme)({ themeStyle: 'light' });
};
var changeStyle2 = function () {
    var transparent = {
        themeType: 'dark',
        blue: 'purple',
        green: '#00bc00',
        red: '#e41318',
        gold: '#f2b200',
        colorPrimary: 'purple',
        colorSuccess: '#00bc00',
        colorWarning: '#f2b200',
        colorError: '#e41318',
        colorInfo: 'purple',
        colorTextBase: 'pink',
        colorBgBase: 'orange',
        gisControlBg: 'green',
        gisControlHeaderBg: 'red',
        // gisControlItemBgSelected: 'black',
        gisControlItemBgHover: 'blue'
    };
    (0, index_common_1.setTheme)({ themeStyle: transparent });
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({});
for (var _i = 0, _a = __VLS_getVForSourceType((__VLS_ctx.routes)); _i < _a.length; _i++) {
    var _b = _a[_i], route = _b[0], key = _b[1];
    var __VLS_0 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        to: (route.path),
    }));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
            to: (route.path),
        }], __VLS_functionalComponentArgsRest(__VLS_1), false));
    __VLS_3.slots.default;
    (key);
    (route.name);
    var __VLS_3;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "changeTheme" }));
var __VLS_4 = {}.Button;
/** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
// @ts-ignore
var __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4(__assign({ 'onClick': {} })));
var __VLS_6 = __VLS_5.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_5), false));
var __VLS_8;
var __VLS_9;
var __VLS_10;
var __VLS_11 = {
    onClick: (__VLS_ctx.changeStyle)
};
__VLS_7.slots.default;
var __VLS_7;
var __VLS_12 = {}.Button;
/** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
// @ts-ignore
var __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12(__assign({ 'onClick': {} })));
var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_13), false));
var __VLS_16;
var __VLS_17;
var __VLS_18;
var __VLS_19 = {
    onClick: (__VLS_ctx.changeStyle1)
};
__VLS_15.slots.default;
var __VLS_15;
var __VLS_20 = {}.Button;
/** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20(__assign({ 'onClick': {} }, { background: "red" })));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { background: "red" })], __VLS_functionalComponentArgsRest(__VLS_21), false));
var __VLS_24;
var __VLS_25;
var __VLS_26;
var __VLS_27 = {
    onClick: (__VLS_ctx.changeStyle2)
};
__VLS_23.slots.default;
var __VLS_23;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "view" }));
var __VLS_28 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.RouterView, ]} */ ;
// @ts-ignore
var __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
var __VLS_30 = __VLS_29.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_29), false));
{
    var __VLS_thisSlot = __VLS_31.slots.default;
    var _c = __VLS_getSlotParams(__VLS_thisSlot)[0], Component = _c.Component, route = _c.route;
    var __VLS_32 = ((Component));
    // @ts-ignore
    var __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        key: (route.path),
    }));
    var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([{
            key: (route.path),
        }], __VLS_functionalComponentArgsRest(__VLS_33), false));
    __VLS_31.slots['' /* empty slot name completion */];
}
var __VLS_31;
/** @type {__VLS_StyleScopedClasses['changeTheme']} */ ;
/** @type {__VLS_StyleScopedClasses['view']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            RouterLink: vue_router_1.RouterLink,
            RouterView: vue_router_1.RouterView,
            Button: Button_1.default,
            routes: routes,
            changeStyle: changeStyle,
            changeStyle1: changeStyle1,
            changeStyle2: changeStyle2,
        };
    },
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
