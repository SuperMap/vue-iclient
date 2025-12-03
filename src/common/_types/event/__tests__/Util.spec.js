import { Util } from '../Util';

describe('Util.js', () => {
  describe('extend', () => {
    it('should extend destination object with source properties', () => {
      const dest = { a: 1 };
      const src = { b: 2 };
      Util.extend(dest, src);
      
      expect(dest).toEqual({ a: 1, b: 2 });
    });

    it('should handle undefined source', () => {
      const dest = { a: 1 };
      Util.extend(dest, undefined);
      
      expect(dest).toEqual({ a: 1 });
    });

    it('should handle null destination', () => {
      const result = Util.extend(null, { a: 1 });
      expect(result).toEqual({ a: 1 });
    });

    it('should not copy undefined values', () => {
      const dest = { a: 1 };
      const src = { a: undefined, b: 2 };
      Util.extend(dest, src);
      
      expect(dest).toEqual({ a: 1, b: 2 });
    });

    it('should copy toString method if present', () => {
      const dest = {};
      const src = {};
      src.toString = () => 'test';
      
      Util.extend(dest, src);
      expect(dest.toString).toBeDefined();
      expect(typeof dest.toString).toBe('function');
    });

    it('should handle source being an Event instance', () => {
      const dest = {};
      const src = new Event('test');
      
      Util.extend(dest, src);
      // Should not throw error and dest should still be an object
      expect(typeof dest).toBe('object');
    });
  });

  describe('copy', () => {
    it('should copy properties from source to destination', () => {
      const dest = { a: 1, b: 2 };
      const src = { a: 10, c: 3 };
      Util.copy(dest, src);
      
      // Only properties that exist in dest should be copied
      expect(dest).toEqual({ a: 10, b: 2 });
    });

    it('should handle undefined source', () => {
      const dest = { a: 1 };
      Util.copy(dest, undefined);
      
      expect(dest).toEqual({ a: 1 });
    });

    it('should handle null destination', () => {
      Util.copy(null, { a: 1 });
      // Should not throw error
      expect(true).toBe(true);
    });

    it('should not copy undefined values', () => {
      const dest = { a: 1, b: 2 };
      const src = { a: undefined, c: 3 };
      Util.copy(dest, src);
      
      // Undefined values should not overwrite existing values
      expect(dest).toEqual({ a: 1, b: 2 });
    });
  });

  describe('reset', () => {
    it('should reset object properties to null', () => {
      const obj = { 
        a: 1, 
        b: 'string',
        c: { value: 1 }
      };
      Util.reset(obj);
      
      expect(obj.a).toBeNull();
      expect(obj.b).toBeNull();
      expect(obj.c).toBeNull();
    });

    it('should call destroy method on array items if exists', () => {
      const destroySpy = jest.fn();
      const obj = {
        arr: [
          { destroy: destroySpy },
          { value: 1 }
        ]
      };
      Util.reset(obj);
      
      expect(destroySpy).toHaveBeenCalled();
      // After reset, the property should be null
      expect(obj.arr).toBeNull();
    });

    it('should call destroy method on object properties if exists', () => {
      const destroySpy = jest.fn();
      const obj = {
        prop: { 
          destroy: destroySpy,
          value: 1 
        }
      };
      Util.reset(obj);
      
      expect(destroySpy).toHaveBeenCalled();
      expect(obj.prop).toBeNull();
    });

    it('should handle null object', () => {
      Util.reset(null);
      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('getElement', () => {
    beforeEach(() => {
      // Setup DOM
      document.body.innerHTML = `
        <div id="element1">Element 1</div>
        <div id="element2">Element 2</div>
      `;
    });

    it('should get element by id when string is provided', () => {
      const element = Util.getElement('element1');
      expect(element.id).toBe('element1');
      expect(element.textContent).toBe('Element 1');
    });

    it('should return the element directly when element is provided', () => {
      const originalElement = document.getElementById('element1');
      const element = Util.getElement(originalElement);
      expect(element).toBe(originalElement);
    });

    it('should return array of elements when multiple arguments provided', () => {
      const elements = Util.getElement('element1', 'element2');
      expect(elements).toHaveLength(2);
      expect(elements[0].id).toBe('element1');
      expect(elements[1].id).toBe('element2');
    });

    it('should handle non-existent element id', () => {
      const element = Util.getElement('nonexistent');
      expect(element).toBeNull();
    });

    it('should return single element when only one argument provided', () => {
      const element = Util.getElement('element1');
      expect(element).not.toBeNull();
      expect(element.id).toBe('element1');
    });

    it('should return array when multiple arguments including direct elements', () => {
      const el1 = document.getElementById('element1');
      const elements = Util.getElement(el1, 'element2');
      expect(elements).toHaveLength(2);
      expect(elements[0]).toBe(el1);
      expect(elements[1].id).toBe('element2');
    });

    it('should handle case when first argument is string and second is element', () => {
      const el2 = document.getElementById('element2');
      const elements = Util.getElement('element1', el2);
      expect(elements).toHaveLength(2);
      expect(elements[0].id).toBe('element1');
      expect(elements[1]).toBe(el2);
    });

    it('should handle case with three arguments', () => {
      const elements = Util.getElement('element1', 'element2', 'nonexistent');
      expect(elements).toHaveLength(3);
      expect(elements[0].id).toBe('element1');
      expect(elements[1].id).toBe('element2');
      expect(elements[2]).toBeNull();
    });

    it('should handle empty string argument', () => {
      const element = Util.getElement('');
      expect(element).toBeNull();
    });

    it('should handle null argument', () => {
      const element = Util.getElement(null);
      expect(element).toBeNull();
    });

    it('should handle undefined argument', () => {
      const element = Util.getElement(undefined);
      expect(element).toBeUndefined();
    });

    it('should return element directly when single element argument provided', () => {
      const el1 = document.getElementById('element1');
      const element = Util.getElement(el1);
      expect(element).toBe(el1);
    });
  });

  describe('isElement', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="test-element">Test</div>';
    });

    it('should return true for DOM elements', () => {
      const element = document.getElementById('test-element');
      expect(Util.isElement(element)).toBe(true);
    });

    it('should return false for non-elements', () => {
      expect(Util.isElement({})).toBe(false);
      expect(Util.isElement(null)).toBe(false);
      expect(Util.isElement(undefined)).toBe(false);
      expect(Util.isElement('string')).toBe(false);
      expect(Util.isElement(123)).toBe(false);
    });

    it('should return false for objects with nodeType !== 1', () => {
      const obj = { nodeType: 2 };
      expect(Util.isElement(obj)).toBe(false);
    });
  });

  describe('isArray', () => {
    it('should return true for arrays', () => {
      expect(Util.isArray([])).toBe(true);
      expect(Util.isArray([1, 2, 3])).toBe(true);
    });

    it('should return false for non-arrays', () => {
      expect(Util.isArray({})).toBe(false);
      expect(Util.isArray('string')).toBe(false);
      expect(Util.isArray(123)).toBe(false);
      expect(Util.isArray(null)).toBe(false);
      expect(Util.isArray(undefined)).toBe(false);
    });
  });

  describe('removeItem', () => {
    it('should remove all occurrences of item from array', () => {
      const array = [1, 2, 3, 2, 4];
      const result = Util.removeItem(array, 2);
      
      // The function removes ALL occurrences, so result should be [1, 3, 4]
      expect(result).toEqual([1, 3, 4]);
      expect(result).toBe(array); // Should modify and return the original array
    });

    it('should remove all instances of the item', () => {
      const array = [1, 2, 3, 2, 4];
      Util.removeItem(array, 2);
      
      expect(array).toEqual([1, 3, 4]); // All '2' values removed
    });

    it('should return same array unmodified if item not found', () => {
      const array = [1, 2, 3];
      const result = Util.removeItem(array, 4);
      
      expect(result).toEqual([1, 2, 3]);
      expect(result).toBe(array); // Should return the same array
    });

    it('should handle empty array', () => {
      const array = [];
      const result = Util.removeItem(array, 1);
      
      expect(result).toEqual([]);
      expect(result).toBe(array);
    });
  });

  describe('indexOf', () => {
    it('should return index of item in array', () => {
      const array = [1, 2, 3];
      const index = Util.indexOf(array, 2);
      
      expect(index).toBe(1);
    });

    it('should return -1 if item not found', () => {
      const array = [1, 2, 3];
      const index = Util.indexOf(array, 4);
      
      expect(index).toBe(-1);
    });

    it('should return -1 for null array', () => {
      const index = Util.indexOf(null, 1);
      expect(index).toBe(-1);
    });

    it('should use native indexOf if available', () => {
      const array = [1, 2, 3];
      const spy = jest.spyOn(Array.prototype, 'indexOf');
      const index = Util.indexOf(array, 2);
      
      expect(spy).toHaveBeenCalledWith(2);
      expect(index).toBe(1);
      spy.mockRestore();
    });

    it('should work without native indexOf', () => {
      // Save the original indexOf
      const originalIndexOf = Array.prototype.indexOf;
      
      // Temporarily remove native indexOf to test fallback
      Array.prototype.indexOf = undefined;
      
      const array = [1, 2, 3];
      const index = Util.indexOf(array, 2);
      
      expect(index).toBe(1);
      
      // Restore native indexOf
      Array.prototype.indexOf = originalIndexOf;
    });

    it('should return -1 when item not found without native indexOf', () => {
      // Save the original indexOf
      const originalIndexOf = Array.prototype.indexOf;
      
      // Temporarily remove native indexOf to test fallback
      Array.prototype.indexOf = undefined;
      
      const array = [1, 2, 3];
      const index = Util.indexOf(array, 4);
      
      expect(index).toBe(-1);
      
      // Restore native indexOf
      Array.prototype.indexOf = originalIndexOf;
    });
  });

  describe('createUniqueID', () => {
    it('should create unique IDs with default prefix', () => {
      const id1 = Util.createUniqueID();
      const id2 = Util.createUniqueID();
      
      expect(id1).toMatch(/^id_\d+$/);
      expect(id2).toMatch(/^id_\d+$/);
      expect(id1).not.toBe(id2);
    });

    it('should create unique IDs with custom prefix', () => {
      const id = Util.createUniqueID('custom_');
      expect(id).toMatch(/^custom_\d+$/);
    });

    it('should increment sequence ID', () => {
      const initialSeqID = Util.lastSeqID;
      Util.createUniqueID();
      const afterSeqID = Util.lastSeqID;
      
      expect(afterSeqID).toBe(initialSeqID + 1);
    });
  });
});