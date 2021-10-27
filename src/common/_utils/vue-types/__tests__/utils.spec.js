import { getType, getNativeType, has, isInteger, isArray, withDefault, withRequired, validateType  } from '../utils';

describe('vue-types utils test', () => {
  beforeAll(() => {});
  it('getType null', done => {
    const res = getType(null);
    expect(res).toBeNull();
    done();
  });
  it('getNativeType null', done => {
    const res = getNativeType(null);
    expect(res).toBeNull();
    done();
  });
  it('getNativeType undefined', done => {
    const res = getNativeType();
    expect(res).toBeNull();
    done();
  });

  it('has', done => {
    const res = has({ a: 1 }, 'a');
    expect(res).toBe(true);
    done();
  });
  it('has not', done => {
    const res = has({ a: 1 }, 'b');
    expect(res).toBe(false);
    done();
  });

  it('withDefault def function ', done => {
    const obj = { def: () => {} };
    withDefault(obj);
    expect(typeof obj.def).toBe('function');
    done();
  });

  it('withDefault def num ', done => {
    const obj = { def: 5 };
    withDefault(obj);
    expect(typeof obj.def).toBe('function');
    done();
  });
  it('withRequired  get ', done => {
    const obj = { a: 5 };
    withRequired(obj);
    expect(obj.isRequired.a).toBe(obj.a);
    expect(obj.isRequired.required).toBe(true);
    done();
  });

  xit('validateType function ', done => {
    const res =validateType('function', function(){});
    expect(res).toBe(true);
    done();
  });

  it('validateType object ', done => {
    const obj = { a: 5 };
    const res =validateType({}, obj);
    expect(res).toBe(true);
    done();
  });
  it('validateType false slient ', done => {
    const obj = { a: 5 };
    const res =validateType([], obj, true);
    expect(res).toBe(false);
    done();
  });

  it('validateType false ', done => {
    const obj = { a: 5 };
    const res =validateType([], obj);
    expect(res).toBe(false);
    done();
  });
  it('isInteger not', done => {
    Number.isInteger = null;
    const res = isInteger('b');
    expect(res).toBe(false);
    done();
  });
  it('isInteger int', done => {
    Number.isInteger = null;
    const res = isInteger(5);
    expect(res).toBe(true);
    done();
  });

  it('isArray ', done => {
    Array.isArray = null;
    const res = isArray([]);
    expect(res).toBe(true);
    done();
  });
  it('isArray ', done => {
    Array.isArray = null;
    const res = isArray({});
    expect(res).toBe(false);
    done();
  });
  afterAll(() => {});
});
