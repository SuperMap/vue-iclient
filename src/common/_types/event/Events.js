/* Copyright© 2000 - 2023 SuperMap Software Co.Ltd. All rights reserved.
 * This program are made available under the terms of the Apache License, Version 2.0
 * which accompanies this distribution and is available at http://www.apache.org/licenses/LICENSE-2.0.html. */
import { Pixel } from 'vue-iclient/src/common/_types/event/Pixel';
import { Event } from 'vue-iclient/src/common/_types/event/Event';
import { FunctionExt } from 'vue-iclient/src/common/_types/event/BaseTypes';
import { Util } from 'vue-iclient/src/common/_types/event/Util';

/**
 * @class Events
 * @classdesc 事件类。
 * @param {Object} object - 当前事件对象被添加到的 JS 对象。
 * @param {HTMLElement} element - 响应浏览器事件的 DOM 元素。
 * @param {Array.<string>} eventTypes - 自定义应用事件的数组。
 * @param {boolean} [fallThrough=false] - 是否允许事件处理之后向上传递（冒泡），为 false 的时候阻止事件冒泡。
 * @param {Object} options - 事件对象选项。
 */
export class Events {
  constructor(object, element, eventTypes, fallThrough, options) {
    /**
     * @member {Array.<string>} Events.prototype.BROWSER_EVENTS
     * @description 支持的事件。
     * @constant
     * @default [
     "mouseover", "mouseout","mousedown", "mouseup", "mousemove",
     "click", "dblclick", "rightclick", "dblrightclick","resize",
     "focus", "blur","touchstart", "touchmove", "touchend","keydown",
     "MSPointerDown", "MSPointerUp", "pointerdown", "pointerup",
     "MSGestureStart", "MSGestureChange", "MSGestureEnd","contextmenu"
     ]
     */
    this.BROWSER_EVENTS = [
      'mouseover', 'mouseout',
      'mousedown', 'mouseup', 'mousemove',
      'click', 'dblclick', 'rightclick', 'dblrightclick',
      'resize', 'focus', 'blur',
      'touchstart', 'touchmove', 'touchend',
      'keydown', 'MSPointerDown', 'MSPointerUp', 'pointerdown', 'pointerup',
      'MSGestureStart', 'MSGestureChange', 'MSGestureEnd',
      'contextmenu'
    ];

    this.listeners = {};

    this.object = object;

    this.element = null;

    this.eventTypes = [];

    this.eventHandler = null;

    this.fallThrough = fallThrough;

    this.includeXY = false;
    this.extensions = {};

    this.extensionCount = {};

    this.clearMouseListener = null;

    Util.extend(this, options);

    if (eventTypes != null) {
      for (let i = 0, len = eventTypes.length; i < len; i++) {
        this.addEventType(eventTypes[i]);
      }
    }

    if (element != null) {
      this.attachToElement(element);
    }

    this.CLASS_NAME = 'Events';
  }

  /**
   * @function Events.prototype.destroy
   * @description 移除当前要素 element 上的所有事件监听和处理。
   */
  destroy() {
    for (let e in this.extensions) {
      if (typeof this.extensions[e] !== 'boolean') {
        this.extensions[e].destroy();
      }
    }
    this.extensions = null;
    if (this.element) {
      Event.stopObservingElement(this.element);
      if (this.element.hasScrollEvent) {
        Event.stopObserving(
          window, 'scroll', this.clearMouseListener
        );
      }
    }
    this.element = null;

    this.listeners = null;
    this.object = null;
    this.eventTypes = null;
    this.fallThrough = null;
    this.eventHandler = null;
  }

  /**
   * @function Events.prototype.addEventType
   * @description 在此事件对象中添加新的事件类型，如果这个事件类型已经添加过了，则不做任何事情。
   * @param {string} eventName - 事件名。
   */
  addEventType(eventName) {
    if (!this.listeners[eventName]) {
      this.eventTypes.push(eventName);
      this.listeners[eventName] = [];
    }
  }

  /**
   * @function Events.prototype.attachToElement
   * @description 给 DOM 元素绑定浏览器事件。
   * @param {HTMLDOMElement} element - 绑定浏览器事件的 DOM 元素。
   */
  attachToElement(element) {
    if (this.element) {
      Event.stopObservingElement(this.element);
    } else {
      // keep a bound copy of handleBrowserEvent() so that we can
      // pass the same function to both Event.observe() and .stopObserving()
      this.eventHandler = FunctionExt.bindAsEventListener(
        this.handleBrowserEvent, this
      );

      // to be used with observe and stopObserving
      this.clearMouseListener = FunctionExt.bind(
        this.clearMouseCache, this
      );
    }
    this.element = element;
    for (let i = 0, len = this.BROWSER_EVENTS.length; i < len; i++) {
      let eventType = this.BROWSER_EVENTS[i];

      // every browser event has a corresponding application event
      // (whether it's listened for or not).
      this.addEventType(eventType);

      // use Prototype to register the event cross-browser
      Event.observe(element, eventType, this.eventHandler);
    }
    // disable dragstart in IE so that mousedown/move/up works normally
    Event.observe(element, 'dragstart', Event.stop);
  }

  on(object) {
    for (let type in object) {
      if (type !== 'scope' && Object.prototype.hasOwnProperty.call(object, type)) {
        this.register(type, object.scope, object[type]);
      }
    }
  }

  register(type, obj, func, priority) {
    if (type in Events && !this.extensions[type]) {
      this.extensions[type] = new Events[type](this);
    }
    if ((func != null) && (Util.indexOf(this.eventTypes, type) !== -1)) {
      if (obj == null) {
        obj = this.object;
      }
      let listeners = this.listeners[type];
      if (!listeners) {
        listeners = [];
        this.listeners[type] = listeners;
        this.extensionCount[type] = 0;
      }
      let listener = { obj: obj, func: func };
      if (priority) {
        listeners.splice(this.extensionCount[type], 0, listener);
        if (typeof priority === 'object' && priority.extension) {
          this.extensionCount[type]++;
        }
      } else {
        listeners.push(listener);
      }
    }
  }

  registerPriority(type, obj, func) {
    this.register(type, obj, func, true);
  }

  un(object) {
    for (let type in object) {
      if (type !== 'scope' && Object.prototype.hasOwnProperty.call(object, type)) {
        this.unregister(type, object.scope, object[type]);
      }
    }
  }

  unregister(type, obj, func) {
    if (obj == null) {
      obj = this.object;
    }
    let listeners = this.listeners[type];
    if (listeners != null) {
      for (let i = 0, len = listeners.length; i < len; i++) {
        if (listeners[i].obj === obj && listeners[i].func === func) {
          listeners.splice(i, 1);
          break;
        }
      }
    }
  }

  /**
   * @function Events.prototype.remove
   * @description 删除某个事件类型的所有监听，如果该事件类型没有注册，则不做任何操作。
   * @param {string} type - 事件类型。
   */
  remove(type) {
    if (this.listeners[type] != null) {
      this.listeners[type] = [];
    }
  }

  triggerEvent(type, evt) {
    let listeners = this.listeners[type];

    // fast path
    if (!listeners || listeners.length === 0) {
      return undefined;
    }

    // prep evt object with object & div references
    if (evt == null) {
      evt = {};
    }
    evt.object = this.object;
    evt.element = this.element;
    if (!evt.type) {
      evt.type = type;
    }

    // execute all callbacks registered for specified type
    // get a clone of the listeners array to
    // allow for splicing during callbacks
    listeners = listeners.slice();
    let continueChain;
    for (let i = 0, len = listeners.length; i < len; i++) {
      let callback = listeners[i];
      // bind the context to callback.obj
      continueChain = callback.func.apply(callback.obj, [evt]);

      if ((continueChain !== undefined) && (continueChain === false)) {
        // if callback returns false, execute no more callbacks.
        break;
      }
    }
    // don't fall through to other DOM elements
    if (!this.fallThrough) {
      Event.stop(evt, true);
    }
    return continueChain;
  }

  handleBrowserEvent(evt) {
    let type = evt.type;
    let listeners = this.listeners[type];
    if (!listeners || listeners.length === 0) {
      // noone's listening, bail out
      return;
    }
    // add clientX & clientY to all events - corresponds to average x, y
    let touches = evt.touches;
    if (touches && touches[0]) {
      let x = 0;
      let y = 0;
      let num = touches.length;
      let touch;
      for (let i = 0; i < num; ++i) {
        touch = touches[i];
        x += touch.clientX;
        y += touch.clientY;
      }
      evt.clientX = x / num;
      evt.clientY = y / num;
    }
    if (this.includeXY) {
      evt.xy = this.getMousePosition(evt);
    }
    this.triggerEvent(type, evt);
  }

  /**
   * @function Events.prototype.clearMouseCache
   * @description 清除鼠标缓存。
   */
  clearMouseCache() {
    this.element.scrolls = null;
    this.element.lefttop = null;
    let body = document.body;
    if (body && !((body.scrollTop !== 0 || body.scrollLeft !== 0) &&
      navigator.userAgent.match(/iPhone/i))) {
      this.element.offsets = null;
    }
  }

  /**
   * @function Events.prototype.getMousePosition
   * @returns {Pixel} 当前的鼠标的 xy 坐标点。
   */
  getMousePosition(evt) {
    if (!this.includeXY) {
      this.clearMouseCache();
    } else if (!this.element.hasScrollEvent) {
      Event.observe(window, 'scroll', this.clearMouseListener);
      this.element.hasScrollEvent = true;
    }

    if (!this.element.scrolls) {
      let viewportElement = Util.getViewportElement();
      this.element.scrolls = [
        viewportElement.scrollLeft,
        viewportElement.scrollTop
      ];
    }

    if (!this.element.lefttop) {
      this.element.lefttop = [
        (document.documentElement.clientLeft || 0),
        (document.documentElement.clientTop || 0)
      ];
    }

    if (!this.element.offsets) {
      this.element.offsets = Util.pagePosition(this.element);
    }

    return new Pixel(
      (evt.clientX + this.element.scrolls[0]) - this.element.offsets[0] - this.element.lefttop[0],
      (evt.clientY + this.element.scrolls[1]) - this.element.offsets[1] - this.element.lefttop[1]
    );
  }
}

Events.prototype.BROWSER_EVENTS = [
  'mouseover', 'mouseout',
  'mousedown', 'mouseup', 'mousemove',
  'click', 'dblclick', 'rightclick', 'dblrightclick',
  'resize', 'focus', 'blur',
  'touchstart', 'touchmove', 'touchend',
  'keydown', 'MSPointerDown', 'MSPointerUp', 'pointerdown', 'pointerup',
  'MSGestureStart', 'MSGestureChange', 'MSGestureEnd',
  'contextmenu'
];
