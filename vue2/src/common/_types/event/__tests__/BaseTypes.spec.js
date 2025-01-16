import { FunctionExt } from '../BaseTypes';

describe('BaseTypes', () => {
  const fnc = function () {
    this.test = 10
  }
  const obj1 = {test: 20}
  const obj2 = {test: 20}
  it('bind', () => {
    FunctionExt.bind(fnc, obj1)()
    expect(obj1.test).toBe(10)
  });
  it('bindAsEventListener', () => {
    FunctionExt.bindAsEventListener(fnc, obj2)()
    expect(obj2.test).toBe(10)
  });
});