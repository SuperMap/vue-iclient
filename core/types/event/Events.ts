/* Copyright© 2000 - 2024 SuperMap Software Co.Ltd. All rights reserved.
 * This program are made available under the terms of the Apache License, Version 2.0
 * which accompanies this distribution and is available at http://www.apache.org/licenses/LICENSE-2.0.html. */
import { Pixel } from 'vue-iclient-core/types/event/Pixel';
import { Event } from 'vue-iclient-core/types/event/Event';
import { FunctionExt } from 'vue-iclient-core/types/event/BaseTypes';
import { Util } from 'vue-iclient-core/types/event/Util';

// 定义 Listener 接口
interface Listener {
  obj: any;
  func: (evt: any) => any;
}

// 定义 Extensions 类型
type Extensions = {
  [key: string]: any;
};

// 定义 EventHandler 类型
type EventHandler = (evt: Event) => void;

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
  readonly BROWSER_EVENTS: string[] = [
    'mouseover',
    'mouseout',
    'mousedown',
    'mouseup',
    'mousemove',
    'click',
    'dblclick',
    'rightclick',
    'dblrightclick',
    'resize',
    'focus',
    'blur',
    'touchstart',
    'touchmove',
    'touchend',
    'keydown',
    'MSPointerDown',
    'MSPointerUp',
    'pointerdown',
    'pointerup',
    'MSGestureStart',
    'MSGestureChange',
    'MSGestureEnd',
    'contextmenu'
  ];
  listeners: { [key: string]: Listener[] } = {};
  object: any;
  element: HTMLElement | null = null;
  eventTypes: string[] = [];
  eventHandler: EventHandler | null = null;
  fallThrough: boolean;
  includeXY: boolean = false;
  extensions: Extensions = {};
  extensionCount: { [key: string]: number } = {};
  clearMouseListener: (() => void) | null = null;
  CLASS_NAME: string = 'Events';

  constructor(
    object?: any,
    element?: HTMLElement | null,
    eventTypes?: string[] | null,
    // @ts-ignore
    fallThrough?: boolean = false,
    options?: any = {}
  ) {
    Util.extend(this, options);

    if (eventTypes) {
      for (let i = 0, len = eventTypes.length; i < len; i++) {
        this.addEventType(eventTypes[i]);
      }
    }

    if (element) {
      this.attachToElement(element);
    }
  }

  /**
   * @function Events.prototype.destroy
   * @description 移除当前要素 element 上的所有事件监听和处理。
   */
  destroy(): void {
    for (let e in this.extensions) {
      if (typeof this.extensions[e] !== 'boolean') {
        this.extensions[e].destroy();
      }
    }
    this.extensions = null as any;
    if (this.element) {
      Event.stopObservingElement(this.element);
      // @ts-ignore
      if (this.element.hasScrollEvent) {
        // @ts-ignore

        Event.stopObserving(window, 'scroll', this.clearMouseListener as () => void);
      }
    }
    this.element = null;
    this.listeners = null as any;
    this.object = null;
    this.eventTypes = null as any;
    this.fallThrough = null as any;
    this.eventHandler = null;
  }

  /**
   * @function Events.prototype.addEventType
   * @description 在此事件对象中添加新的事件类型，如果这个事件类型已经添加过了，则不做任何事情。
   * @param {string} eventName - 事件名。
   */
  addEventType(eventName: string): void {
    if (!this.listeners[eventName]) {
      this.eventTypes.push(eventName);
      this.listeners[eventName] = [];
    }
  }

  /**
   * @function Events.prototype.attachToElement
   * @description 给 DOM 元素绑定浏览器事件。
   * @param {HTMLElement} element - 绑定浏览器事件的 DOM 元素。
   */
  attachToElement(element: HTMLElement): void {
    if (this.element) {
      Event.stopObservingElement(this.element);
    } else {
      // keep a bound copy of handleBrowserEvent() so that we can
      // pass the same function to both Event.observe() and .stopObserving()
      this.eventHandler = FunctionExt.bindAsEventListener(
        this.handleBrowserEvent,
        this
      ) as EventHandler;

      // to be used with observe and stopObserving
      this.clearMouseListener = FunctionExt.bind(this.clearMouseCache, this);
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

  on(object: { [key: string]: (evt: any) => any; scope?: any }): void {
    for (let type in object) {
      if (type !== 'scope' && Object.prototype.hasOwnProperty.call(object, type)) {
        this.register(type, object.scope, object[type]);
      }
    }
  }

  register(type: string, obj: any | null, func: (evt: any) => any, priority: any = false): void {
    if (type in Events && !this.extensions[type]) {
      this.extensions[type] = new (Events as any)[type](this);
    }
    if (func && Util.indexOf(this.eventTypes, type) !== -1) {
      if (obj === null) {
        obj = this.object;
      }
      let listeners = this.listeners[type];
      if (!listeners) {
        listeners = [];
        this.listeners[type] = listeners;
        this.extensionCount[type] = 0;
      }
      let listener: Listener = { obj, func };
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

  registerPriority(type: string, obj: any | null, func: (evt: any) => any): void {
    this.register(type, obj, func, true);
  }

  un(object: { [key: string]: (evt: any) => any; scope?: any }): void {
    for (let type in object) {
      if (type !== 'scope' && Object.prototype.hasOwnProperty.call(object, type)) {
        this.unregister(type, object.scope, object[type]);
      }
    }
  }

  unregister(type: string, obj: any | null, func: (evt: any) => any): void {
    if (obj === null) {
      obj = this.object;
    }
    let listeners = this.listeners[type];
    if (listeners) {
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
  remove(type: string): void {
    if (this.listeners[type]) {
      this.listeners[type] = [];
    }
  }

  triggerEvent(type: string, evt: any = {}): any {
    let listeners = this.listeners[type];

    // fast path
    if (!listeners || listeners.length === 0) {
      return undefined;
    }

    // prep evt object with object & div references
    if (!evt) {
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
    let continueChain: any;
    for (let i = 0, len = listeners.length; i < len; i++) {
      let callback = listeners[i];
      // bind the context to callback.obj
      continueChain = callback.func.apply(callback.obj, [evt]);

      if (continueChain !== undefined && continueChain === false) {
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

  handleBrowserEvent(evt: any): void {
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
      let touch: any;
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
  clearMouseCache(): void {
    if (this.element) {
      // @ts-ignore
      this.element.scrolls = null;
      // @ts-ignore
      this.element.lefttop = null;
      let body = document.body;
      if (
        body &&
        !((body.scrollTop !== 0 || body.scrollLeft !== 0) && navigator.userAgent.match(/iPhone/i))
      ) {
        // @ts-ignore
        this.element.offsets = null;
      }
    }
  }

  /**
   * @function Events.prototype.getMousePosition
   * @returns {Pixel} 当前的鼠标的 xy 坐标点。
   */
  getMousePosition(evt: any): Pixel {
    if (!this.includeXY) {
      this.clearMouseCache();
      // @ts-ignore
    } else if (this.element && !this.element.hasScrollEvent) {
      // @ts-ignore
      Event.observe(window, 'scroll', this.clearMouseListener as () => void);
      // @ts-ignore
      this.element.hasScrollEvent = true;
    }

    if (this.element) {
      // @ts-ignore
      if (!this.element.scrolls) {
        let viewportElement = Util.getViewportElement();
        // @ts-ignore
        this.element.scrolls = [viewportElement.scrollLeft, viewportElement.scrollTop];
      }

      // @ts-ignore
      if (!this.element.lefttop) {
        // @ts-ignore
        this.element.lefttop = [
          document.documentElement.clientLeft || 0,
          document.documentElement.clientTop || 0
        ];
      }
      // @ts-ignore
      if (!this.element.offsets) {
        // @ts-ignore
        this.element.offsets = Util.pagePosition(this.element);
      }

      return new Pixel(
        // @ts-ignore
        evt.clientX + this.element.scrolls[0] - this.element.offsets[0] - this.element.lefttop[0],
        // @ts-ignore
        evt.clientY + this.element.scrolls[1] - this.element.offsets[1] - this.element.lefttop[1]
      );
    }
    return new Pixel(0, 0);
  }
}
