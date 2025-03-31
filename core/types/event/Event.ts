/* Copyright© 2000 - 2024 SuperMap Software Co.Ltd. All rights reserved.
 * This program are made available under the terms of the Apache License, Version 2.0
 * which accompanies this distribution and is available at http://www.apache.org/licenses/LICENSE-2.0.html. */

import { Util } from 'vue-iclient-core/types/event/Util';

interface EventObserver {
  element: HTMLElement;
  name: string;
  observer: (event: Event) => void;
  useCapture: boolean;
}

interface EventCache {
  [cacheID: string]: EventObserver[];
}

export const Event = {
  /**
   * @description  A hash table cache of the event observers. Keyed by element._eventCacheID
   * @type {EventCache}
   * @default {}
   */
  observers: {} as EventCache,

  /**
   * @description KEY_SPACE
   * @type {number}
   * @default 32
   */
  KEY_SPACE: 32,

  /**
   * @description KEY_BACKSPACE
   * @type {number}
   * @default 8
   */
  KEY_BACKSPACE: 8,

  /**
   * @description KEY_TAB
   * @type {number}
   * @default 9
   */
  KEY_TAB: 9,

  /**
   * @description KEY_RETURN
   * @type {number}
   * @default 13
   */
  KEY_RETURN: 13,

  /**
   * @description KEY_ESC
   * @type {number}
   * @default 27
   */
  KEY_ESC: 27,

  /**
   * @description KEY_LEFT
   * @type {number}
   * @default 37
   */
  KEY_LEFT: 37,

  /**
   * @description KEY_UP
   * @type {number}
   * @default 38
   */
  KEY_UP: 38,

  /**
   * @description KEY_RIGHT
   * @type {number}
   * @default 39
   */
  KEY_RIGHT: 39,

  /**
   * @description KEY_DOWN
   * @type {number}
   * @default 40
   */
  KEY_DOWN: 40,

  /**
   * @description KEY_DELETE
   * @type {number}
   * @default 46
   */
  KEY_DELETE: 46,

  /**
   * @description Cross browser event element detection.
   * @param {Event} event - The event
   * @returns {HTMLElement} The element that caused the event
   */
  element: function (event: Event): HTMLElement {
    return (event.target as HTMLElement) || ((event as any).srcElement as HTMLElement);
  },

  /**
   * @description Determine whether event was caused by a single touch
   * @param {Event} event - The event
   * @returns {boolean}
   */
  isSingleTouch: function (event: TouchEvent): boolean {
    return event.touches && event.touches.length === 1;
  },

  /**
   * @description Determine whether event was caused by a multi touch
   * @param {Event} event - The event
   * @returns {boolean}
   */
  isMultiTouch: function (event: TouchEvent): boolean {
    return event.touches && event.touches.length > 1;
  },

  /**
   * @description Determine whether event was caused by a left click.
   * @param {MouseEvent} event - The event
   * @returns {boolean}
   */
  isLeftClick: function (event: MouseEvent): boolean {
    return (event.which && event.which === 1) || (event.button && event.button === 1);
  },

  /**
   * @description Determine whether event was caused by a right mouse click.
   * @param {MouseEvent} event - The event
   * @returns {boolean}
   */
  isRightClick: function (event: MouseEvent): boolean {
    return (event.which && event.which === 3) || (event.button && event.button === 2);
  },

  /**
   * @description Stops an event from propagating.
   * @param {Event} event - The event
   * @param {boolean} allowDefault - If true, we stop the event chain but still allow the default browser  behaviour (text selection, radio-button clicking, etc) Default false
   */
  stop: function (event: Event, allowDefault: boolean = false): void {
    if (!allowDefault) {
      if (event.preventDefault) {
        event.preventDefault();
      } else {
        (event as any).returnValue = false;
      }
    }

    if (event.stopPropagation) {
      event.stopPropagation();
    } else {
      (event as any).cancelBubble = true;
    }
  },

  /**
   * @param {Event} event - The event
   * @param {string} tagName - html 标签名。
   * @returns {HTMLElement} The first node with the given tagName, starting from the node the event was triggered on and traversing the DOM upwards
   */
  findElement: function (event: Event, tagName: string): HTMLElement {
    let element = Event.element(event);
    while (
      element.parentNode &&
      (!element.tagName || element.tagName.toUpperCase() !== tagName.toUpperCase())
    ) {
      element = element.parentNode as HTMLElement;
    }
    return element;
  },

  /**
   * @description 监听事件，注册事件处理方法。
   * @param {(HTMLElement|string)} elementParam - 待监听的 DOM 对象或者其 ID 标识。
   * @param {string} name - 监听事件的类别名称。
   * @param {(event: Event) => void} observer - 注册的事件处理方法。
   * @param {boolean} [useCapture=false] - 是否捕获。
   */
  observe: function (
    elementParam: HTMLElement | string,
    name: string,
    observer: (event: Event) => void,
    useCapture: boolean = false
  ): void {
    let element = Util.getElement(elementParam)[0] as HTMLElement;
    useCapture = useCapture || false;

    if (
      name === 'keypress' &&
      // @ts-ignore
      (navigator.userAgent.match(/Konqueror|Safari|KHTML/) || element.attachEvent)
    ) {
      name = 'keydown';
    }

    if (!this.observers) {
      this.observers = {} as EventCache;
    }
    // @ts-ignore
    if (!element._eventCacheID) {
      let idPrefix = 'eventCacheID_';
      if (element.id) {
        idPrefix = element.id + '_' + idPrefix;
      }
      // @ts-ignore
      element._eventCacheID = Util.createUniqueID(idPrefix);
    }
    // @ts-ignore
    let cacheID = element._eventCacheID;

    if (!this.observers[cacheID]) {
      this.observers[cacheID] = [];
    }

    this.observers[cacheID].push({
      element: element,
      name: name,
      observer: observer,
      useCapture: useCapture
    });

    if (element.addEventListener) {
      if (name === 'mousewheel') {
        // @ts-ignore
        element.addEventListener(name, observer, { useCapture: useCapture, passive: false });
      } else {
        element.addEventListener(name, observer, useCapture);
      }
      // @ts-ignore
    } else if (element.attachEvent) {
      // @ts-ignore

      element.attachEvent('on' + name, observer);
    }
  },

  /**
   * @description Given the id of an element to stop observing, cycle through the
   *   element's cached observers, calling stopObserving on each one,
   *   skipping those entries which can no longer be removed.
   *
   * @param {(HTMLElement|string)} elementParam -
   */
  stopObservingElement: function (elementParam: HTMLElement | string): void {
    let element = Util.getElement(elementParam)[0] as HTMLElement;
    // @ts-ignore

    let cacheID = element._eventCacheID;

    this._removeElementObservers(Event.observers[cacheID]);
  },

  /**
   * @param {Array.<EventObserver>} elementObservers - Array of (element, name,
   *                                         observer, usecapture) objects,
   *                                         taken directly from hashtable
   */
  _removeElementObservers: function (elementObservers: EventObserver[]): void {
    if (elementObservers) {
      for (let i = elementObservers.length - 1; i >= 0; i--) {
        let entry = elementObservers[i];
        let args = [entry.element, entry.name, entry.observer, entry.useCapture];
        Event.stopObserving.apply(this, args);
      }
    }
  },

  /**
   * @description 移除事件监听和注册的事件处理方法。注意：事件的移除和监听相对应，移除时的各属性信息必须监听时
   * 保持一致才能确保事件移除成功。
   * @param {(HTMLElement|string)} elementParam - 被监听的 DOM 元素或者其 ID。
   * @param {string} name - 需要移除的被监听事件名称。
   * @param {(event: Event) => void} observer - 需要移除的事件处理方法。
   * @param {boolean} [useCapture=false] - 是否捕获。
   * @returns {boolean} Whether or not the event observer was removed
   */
  stopObserving: function (
    elementParam: HTMLElement | string,
    name: string,
    observer: (event: Event) => void,
    useCapture: boolean = false
  ): boolean {
    useCapture = useCapture || false;

    let element = Util.getElement(elementParam)[0];
    // @ts-ignore

    let cacheID = element._eventCacheID;

    if (name === 'keypress') {
      // @ts-ignore

      if (navigator.userAgent.match(/Konqueror|Safari|KHTML/) || element.detachEvent) {
        name = 'keydown';
      }
    }

    // find element's entry in this.observers cache and remove it
    let foundEntry = false;
    let elementObservers = Event.observers[cacheID];
    if (elementObservers) {
      // find the specific event type in the element's list
      let i = 0;
      while (!foundEntry && i < elementObservers.length) {
        let cacheEntry = elementObservers[i];

        if (
          cacheEntry.name === name &&
          cacheEntry.observer === observer &&
          cacheEntry.useCapture === useCapture
        ) {
          elementObservers.splice(i, 1);
          if (elementObservers.length === 0) {
            delete Event.observers[cacheID];
          }
          foundEntry = true;
          break;
        }
        i++;
      }
    }

    // actually remove the event listener from browser
    if (foundEntry) {
      if (element.removeEventListener) {
        element.removeEventListener(name, observer, useCapture);
        // @ts-ignore
      } else if (element && element.detachEvent) {
        // @ts-ignore
        element.detachEvent('on' + name, observer);
      }
    }
    return foundEntry;
  },

  /**
   * @description Cycle through all the element entries in the events cache and call
   *   stopObservingElement on each.
   */
  unloadCache: function (): void {
    // created
    if (Event && Event.observers) {
      for (let cacheID in Event.observers) {
        let elementObservers = Event.observers[cacheID];
        Event._removeElementObservers.apply(this, [elementObservers]);
      }
      Event.observers = {} as EventCache;
    }
  },

  CLASS_NAME: 'Event'
};

/* prevent memory leaks in IE */
// @ts-ignore
Event.observe(window, 'unload', Event.unloadCache, false);
