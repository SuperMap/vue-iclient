import { Event } from '../Event';

describe('Event', () => {
  let testElement;

  beforeEach(() => {
    // 创建一个测试用的DOM元素
    testElement = document.createElement('div');
    testElement.id = 'test-element';
    document.body.appendChild(testElement);
  });

  afterEach(() => {
    // 清理测试用的DOM元素
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
    // 重置Event.observers
    Event.observers = false;
  });

  it('should have correct key constants', () => {
    expect(Event.KEY_SPACE).toBe(32);
    expect(Event.KEY_BACKSPACE).toBe(8);
    expect(Event.KEY_TAB).toBe(9);
    expect(Event.KEY_RETURN).toBe(13);
    expect(Event.KEY_ESC).toBe(27);
    expect(Event.KEY_LEFT).toBe(37);
    expect(Event.KEY_UP).toBe(38);
    expect(Event.KEY_RIGHT).toBe(39);
    expect(Event.KEY_DOWN).toBe(40);
    expect(Event.KEY_DELETE).toBe(46);
  });

  it('should detect event element correctly', () => {
    const mockEvent = {
      target: testElement
    };
    expect(Event.element(mockEvent)).toBe(testElement);

    const mockEvent2 = {
      srcElement: testElement
    };
    expect(Event.element(mockEvent2)).toBe(testElement);
  });

  it('should detect single touch correctly', () => {
    const singleTouchEvent = {
      touches: [{ x: 10, y: 20 }]
    };
    expect(Event.isSingleTouch(singleTouchEvent)).toBe(true);

    const multiTouchEvent = {
      touches: [{ x: 10, y: 20 }, { x: 30, y: 40 }]
    };
    expect(Event.isSingleTouch(multiTouchEvent)).toBe(false);

    const noTouchEvent = {};
    expect(Event.isSingleTouch(noTouchEvent)).toBeFalsy();
  });

  it('should detect multi touch correctly', () => {
    const singleTouchEvent = {
      touches: [{ x: 10, y: 20 }]
    };
    expect(Event.isMultiTouch(singleTouchEvent)).toBe(false);

    const multiTouchEvent = {
      touches: [{ x: 10, y: 20 }, { x: 30, y: 40 }]
    };
    expect(Event.isMultiTouch(multiTouchEvent)).toBe(true);

    const noTouchEvent = {};
    expect(Event.isMultiTouch(noTouchEvent)).toBeFalsy();
  });

  it('should detect left click correctly', () => {
    const leftClickEvent = {
      which: 1
    };
    expect(Event.isLeftClick(leftClickEvent)).toBe(true);

    const rightClickEvent = {
      which: 3
    };
    expect(Event.isLeftClick(rightClickEvent)).toBeFalsy();

    const buttonEvent = {
      button: 1
    };
    expect(Event.isLeftClick(buttonEvent)).toBe(true);

    const noClickEvent = {};
    expect(Event.isLeftClick(noClickEvent)).toBeFalsy();
  });

  it('should detect right click correctly', () => {
    const rightClickEvent = {
      which: 3
    };
    expect(Event.isRightClick(rightClickEvent)).toBe(true);

    const leftClickEvent = {
      which: 1
    };
    expect(Event.isRightClick(leftClickEvent)).toBeFalsy();

    const buttonEvent = {
      button: 2
    };
    expect(Event.isRightClick(buttonEvent)).toBe(true);

    const noClickEvent = {};
    expect(Event.isRightClick(noClickEvent)).toBeFalsy();
  });

  it('should stop event propagation', () => {
    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn()
    };

    Event.stop(mockEvent);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();

    const mockEvent2 = {
      returnValue: true,
      cancelBubble: true
    };

    Event.stop(mockEvent2, true);
    expect(mockEvent2.returnValue).toBe(true);
    expect(mockEvent2.cancelBubble).toBe(true);
  });

  it('should stop event propagation with allowDefault', () => {
    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn()
    };

    Event.stop(mockEvent, true);
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  it('should find element by tag name', () => {
    const childElement = document.createElement('span');
    const grandChildElement = document.createElement('input');
    
    childElement.appendChild(grandChildElement);
    testElement.appendChild(childElement);

    const mockEvent = {
      target: grandChildElement
    };

    const result = Event.findElement(mockEvent, 'DIV');
    expect(result).toBe(testElement);
  });

  it('should observe events', () => {
    const mockObserver = jest.fn();
    const addEventListenerSpy = jest.spyOn(testElement, 'addEventListener');
    
    Event.observe(testElement, 'click', mockObserver);
    
    expect(Event.observers).toBeDefined();
    expect(testElement._eventCacheID).toBeDefined();
    expect(addEventListenerSpy).toHaveBeenCalledWith('click', mockObserver, false);
  });

  it('should observe events with mousewheel', () => {
    const mockObserver = jest.fn();
    const addEventListenerSpy = jest.spyOn(testElement, 'addEventListener');
    
    Event.observe(testElement, 'mousewheel', mockObserver);
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousewheel', mockObserver, { useCapture: false, passive: false });
  });

  it('should handle keypress event for Safari/Konqueror', () => {
    // 保存原始navigator对象
    const originalAppVersion = navigator.appVersion;
    
    // 使用defineProperty重新定义appVersion属性
    Object.defineProperty(navigator, 'appVersion', {
      writable: true,
      value: '5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15'
    });
    
    const mockObserver = jest.fn();
    const addEventListenerSpy = jest.spyOn(testElement, 'addEventListener');
    
    Event.observe(testElement, 'keypress', mockObserver);
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', mockObserver, false);
    
    // 恢复原始属性
    Object.defineProperty(navigator, 'appVersion', {
      writable: true,
      value: originalAppVersion
    });
  });

  it('should stop observing element', () => {
    const mockObserver = jest.fn();
    
    // 先添加观察者
    Event.observe(testElement, 'click', mockObserver);
    expect(Event.observers[testElement._eventCacheID]).toHaveLength(1);
    
    // 停止观察
    Event.stopObservingElement(testElement);
    expect(Event.observers[testElement._eventCacheID]).toBeUndefined();
  });

  it('should remove element observers', () => {
    const mockObserver = jest.fn();
    const stopObservingSpy = jest.spyOn(Event, 'stopObserving');
    
    // 先添加观察者
    Event.observe(testElement, 'click', mockObserver);
    const cacheID = testElement._eventCacheID;
    const elementObservers = Event.observers[cacheID];
    
    // 移除观察者
    Event._removeElementObservers(elementObservers);
    
    expect(stopObservingSpy).toHaveBeenCalledWith(testElement, 'click', mockObserver, false);
  });

  it('should stop observing events', () => {
    const mockObserver = jest.fn();
    const removeEventListenerSpy = jest.spyOn(testElement, 'removeEventListener');
    
    // 先添加观察者
    Event.observe(testElement, 'click', mockObserver);
    
    // 停止观察
    const result = Event.stopObserving(testElement, 'click', mockObserver);
    
    expect(result).toBe(true);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('click', mockObserver, false);
  });

  it('should handle keypress event stop observing for Safari/Konqueror', () => {
    // 保存原始navigator对象
    const originalAppVersion = navigator.appVersion;
    
    // 使用defineProperty重新定义appVersion属性
    Object.defineProperty(navigator, 'appVersion', {
      writable: true,
      value: '5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15'
    });
    
    const mockObserver = jest.fn();
    testElement.detachEvent = jest.fn();
    
    // 先添加观察者（会转为keydown）
    Event.observe(testElement, 'keypress', mockObserver);
    
    // 停止观察（也会转为keydown）
    const result = Event.stopObserving(testElement, 'keypress', mockObserver);
    
    expect(result).toBe(true);
    
    // 恢复原始属性
    Object.defineProperty(navigator, 'appVersion', {
      writable: true,
      value: originalAppVersion
    });
  });

  it('should unload cache', () => {
    const mockObserver = jest.fn();
    
    // 添加几个观察者
    Event.observe(testElement, 'click', mockObserver);
    
    const removeElementObserversSpy = jest.spyOn(Event, '_removeElementObservers');
    
    // 卸载缓存
    Event.unloadCache();
    
    expect(removeElementObserversSpy).toHaveBeenCalled();
    expect(Event.observers).toBe(false);
  });

  it('should handle unload cache when no observers', () => {
    Event.observers = false;
    expect(() => Event.unloadCache()).not.toThrow();
  });

  it('should not stop observing when observer not found', () => {
    const mockObserver1 = jest.fn();
    const mockObserver2 = jest.fn();
    
    // 添加一个观察者
    Event.observe(testElement, 'click', mockObserver1);
    
    // 尝试移除一个不存在的观察者
    const result = Event.stopObserving(testElement, 'click', mockObserver2);
    
    expect(result).toBe(false);
    expect(Event.observers[testElement._eventCacheID]).toHaveLength(1);
  });

  it('should handle stop observing when no observers', () => {
    const result = Event.stopObserving(testElement, 'click', jest.fn());
    expect(result).toBe(false);
  });

  it('should handle stop observing element when no observers', () => {
    // 确保元素没有观察者
    delete testElement._eventCacheID;
    
    expect(() => Event.stopObservingElement(testElement)).not.toThrow();
  });
  
  it('should handle attachEvent for older browsers', () => {
    // 保存原始方法
    const addEventListener = testElement.addEventListener;
    const attachEvent = testElement.attachEvent;
    
    // 模拟旧版IE环境
    delete testElement.addEventListener;
    testElement.attachEvent = jest.fn();
    
    const mockObserver = jest.fn();
    Event.observe(testElement, 'click', mockObserver);
    
    expect(testElement.attachEvent).toHaveBeenCalledWith('onclick', mockObserver);
    
    // 恢复原始方法
    if (addEventListener) {
      testElement.addEventListener = addEventListener;
    }
    if (attachEvent) {
      testElement.attachEvent = attachEvent;
    }
  });
  
  it('should handle detachEvent for older browsers', () => {
    // 保存原始方法
    const removeEventListener = testElement.removeEventListener;
    const detachEvent = testElement.detachEvent;
    
    // 模拟旧版IE环境
    delete testElement.removeEventListener;
    testElement.detachEvent = jest.fn();
    
    const mockObserver = jest.fn();
    // 先添加观察者
    Event.observe(testElement, 'click', mockObserver);
    
    // 停止观察
    Event.stopObserving(testElement, 'click', mockObserver);
    
    expect(testElement.detachEvent).toHaveBeenCalledWith('onclick', mockObserver);
    
    // 恢复原始方法
    if (removeEventListener) {
      testElement.removeEventListener = removeEventListener;
    }
    if (detachEvent) {
      testElement.detachEvent = detachEvent;
    }
  });
});