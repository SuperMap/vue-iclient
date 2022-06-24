import { getType, getNativeType, has, isInteger, isArray, withDefault, withRequired, validateType, toType } from '../utils';

describe('vue-types utils test', () => {
  it('getType null', () => {
    const res = getType(null);
    expect(res).toBeNull();
  });

  it('getNativeType null', () => {
    const res = getNativeType(null);
    expect(res).toBeNull();
  });

  it('getNativeType undefined', () => {
    const res = getNativeType();
    expect(res).toBeNull();
  });

  it('has', () => {
    const res = has({ a: 1 }, 'a');
    expect(res).toBe(true);
  });

  it('has not', () => {
    const res = has({ a: 1 }, 'b');
    expect(res).toBe(false);
  });

  it('withDefault def function ', () => {
    const obj = { def: () => {} };
    withDefault(obj);
    expect(typeof obj.def).toBe('function');
  });

  it('withDefault def num ', () => {
    const obj = { def: 5 };
    withDefault(obj);
    expect(typeof obj.def).toBe('function');
  });

  it('withRequired get ', () => {
    const obj = { a: 5 };
    withRequired(obj);
    expect(obj.isRequired.a).toBe(obj.a);
    expect(obj.isRequired.required).toBe(true);
  });

  it('validateType Function ', () => {
    const res = validateType(Function, function a() {});
    expect(res).toBe(true);
  });

  it('validateType object ', () => {
    const obj = { a: 5 };
    const res = validateType(Object, obj);
    expect(res).toBe(true);
  });

  it('validateType Array', () => {
    const res = validateType([Array], []);
    expect(res).toBe(true);
  });

  it('validateType false', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const obj = { a: 5 };
    const res = validateType([], obj);
    expect(warnSpy.mock.calls).toHaveLength(1);
    expect(res).toBe(false);
  });

  it('isInteger not', () => {
    Number.isInteger = null;
    const res = isInteger('b');
    expect(res).toBe(false);
  });

  it('isInteger int', () => {
    Number.isInteger = null;
    const res = isInteger(5);
    expect(res).toBe(true);
  });

  it('toType ', () => {
    const name = 'test';
    const obj = {
      validator: () => fn()
    };
    expect(toType(name, obj)).not.toBeNull();
  });
});
