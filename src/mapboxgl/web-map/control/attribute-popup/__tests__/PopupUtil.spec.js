import PopupUtil, {formatValue2String} from '../util/PopupUtil';

describe('PopupUtil', () => {
  describe('formatValue2String', () => {
    it('returns empty string for undefined', () => {
      expect(formatValue2String(undefined)).toBe('');
    });

    it('returns string as is', () => {
      expect(formatValue2String('test')).toBe('test');
    });

    it('converts number to string', () => {
      expect(formatValue2String(123)).toBe('123');
    });

    it('converts boolean to string', () => {
      expect(formatValue2String(true)).toBe('true');
    });
  });

  describe('getLayoutElements', () => {
    it('handles FIELD elements', () => {
      const elements = [{ type: 'FIELD', fieldName: 'name' }];
      const result = PopupUtil.getLayoutElements(elements);
      expect(result).toEqual([{ type: 'FIELD', infos: [{ type: 'FIELD', fieldName: 'name' }] }]);
    });

    it('handles TEXT elements', () => {
      const elements = [{ type: 'TEXT', infos: [{ insert: 'Hello' }] }];
      const result = PopupUtil.getLayoutElements(elements);
      expect(result).toEqual([{ type: 'TEXT', infos: [{ insert: 'Hello' }] }]);
    });

    it('handles IMAGE elements', () => {
      const elements = [{ type: 'IMAGE', value: 'url/to/image.png' }];
      const result = PopupUtil.getLayoutElements(elements);
      expect(result).toEqual([{ type: 'MEDIA', infos: [{ type: 'IMAGE', value: 'url/to/image.png' }] }]);
    });

    it('handles VIDEO elements', () => {
      const elements = [{ type: 'VIDEO', value: 'url/to/video.mp4' }];
      const result = PopupUtil.getLayoutElements(elements);
      expect(result).toEqual([{ type: 'MEDIA', infos: [{ type: 'VIDEO', value: 'url/to/video.mp4' }] }]);
    });

    it('handles DIVIDER elements', () => {
      const elements = [{ type: 'DIVIDER' }];
      const result = PopupUtil.getLayoutElements(elements);
      expect(result).toEqual([{ type: 'DIVIDER' }]);
    });

    it('groups consecutive IMAGE and VIDEO as MEDIA', () => {
      const elements = [
        { type: 'IMAGE', value: 'img1.png' },
        { type: 'IMAGE', value: 'img2.png' },
        { type: 'VIDEO', value: 'video.mp4' }
      ];
      const result = PopupUtil.getLayoutElements(elements);
      expect(result).toEqual([{
        type: 'MEDIA',
        infos: [
          { type: 'IMAGE', value: 'img1.png' },
          { type: 'IMAGE', value: 'img2.png' },
          { type: 'VIDEO', value: 'video.mp4' }
        ]
      }]);
    });

    it('separates MEDIA and FIELD groups', () => {
      const elements = [
        { type: 'IMAGE', value: 'img.png' },
        { type: 'FIELD', fieldName: 'name' }
      ];
      const result = PopupUtil.getLayoutElements(elements);
      expect(result).toEqual([
        { type: 'MEDIA', infos: [{ type: 'IMAGE', value: 'img.png' }] },
        { type: 'FIELD', infos: [{ type: 'FIELD', fieldName: 'name' }] }
      ]);
    });

    it('handles empty array', () => {
      const result = PopupUtil.getLayoutElements([]);
      expect(result).toEqual([]);
    });
  });

  describe('getResult', () => {
    it('returns empty string when attributes is undefined', () => {
      expect(PopupUtil.getResult('test', undefined)).toBe('');
    });

    it('returns string value directly', () => {
      expect(PopupUtil.getResult('test', {})).toBe('test');
    });

    it('evaluates expression array', () => {
      const attributes = { name: 'John', age: 25 };
      expect(PopupUtil.getResult(['get', 'name'], attributes)).toBe('John');
      expect(PopupUtil.getResult(['get', 'age'], attributes)).toBe(25);
    });

    it('returns undefined as empty string', () => {
      const attributes = {};
      expect(PopupUtil.getResult(['get', 'unknown'], attributes)).toBe('');
    });
  });

  describe('getResultElement', () => {
    it('returns empty array for empty input', () => {
      const result = PopupUtil.getResultElement([], {});
      expect(result).toEqual([]);
    });

    it('processes FIELD elements', () => {
      const layoutElements = [{ type: 'FIELD', infos: [{ fieldName: 'name' }] }];
      const attributes = { name: 'John' };
      const result = PopupUtil.getResultElement(layoutElements, attributes);

      expect(result[0].infos[0].value).toBe('John');
    });

    it('processes MEDIA elements', () => {
      const layoutElements = [{
        type: 'MEDIA',
        infos: [{ title: ['get', 'titleKey'], value: ['get', 'imageUrl'] }]
      }];
      const attributes = { titleKey: 'My Title', imageUrl: 'http://example.com/img.png' };
      const result = PopupUtil.getResultElement(layoutElements, attributes);

      expect(result[0].infos[0].title).toBe('My Title');
      expect(result[0].infos[0].value).toBe('http://example.com/img.png');
    });

    it('processes TEXT elements', () => {
      const layoutElements = [{
        type: 'TEXT',
        infos: [{ insert: ['get', 'content'] }]
      }];
      const attributes = { content: 'Hello World' };
      const result = PopupUtil.getResultElement(layoutElements, attributes);

      expect(result[0].infos[0].insert).toBe('Hello World');
    });

    it('handles fieldCaptions', () => {
      const layoutElements = [{ type: 'FIELD', infos: [{ fieldName: 'name' }] }];
      const attributes = { name: 'John' };
      const fieldCaptions = { name: 'Name Label' };
      const result = PopupUtil.getResultElement(layoutElements, attributes, undefined, fieldCaptions);

      expect(result[0].infos[0].caption).toBe('Name Label');
    });

    it('marks editable fields', () => {
      const layoutElements = [{ type: 'FIELD', infos: [{ fieldName: 'name' }] }];
      const attributes = { name: 'John' };
      const editableFields = ['name'];
      const result = PopupUtil.getResultElement(layoutElements, attributes, editableFields);

      expect(result[0].infos[0].editable).toBe(true);
    });
  });
});
