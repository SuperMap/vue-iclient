import {Pixel} from "../Pixel"

describe('Pixel', () => {
  const p0 = new Pixel()
  const p1 = new Pixel(1, 2, 'lefttop')
  const p2 = p1.clone()
  const p3 = new Pixel(2, 4)
  const p4 = new Pixel("a", "b")
  const p5 = new Pixel("aa", "bb")
  it('toString', () => {
    expect(p0.toString()).toBe('x=0,y=0');
    expect(p1.toString()).toBe('x=1,y=2');
  })
  it('toEqual', () => {
    expect(p1).toEqual(p2);
    expect(p1.equals(p2)).toBeTruthy();
    expect(p1.equals(null)).toBeFalsy();
    expect(p4.equals(p5)).toBeTruthy();
  })
  it('distanceTo', () => {
    expect(p1.distanceTo(p2)).toBe(0);
  })
  it('add', () => {
    expect(p1.add(1, 2)).toEqual(p3);
    function throwErr() {
      p1.add()
    }
    expect(throwErr).toThrow()
  })
  it('offset', () => {
    expect(p1.offset(p2)).toEqual(p3);
    expect(p1.offset()).toEqual(p1);
  })
  it('destroy', () => {
    p1.destroy()
    expect(p1.x).toBe(null);
  })

})