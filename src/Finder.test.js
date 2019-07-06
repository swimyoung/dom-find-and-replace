import Finder from './Finder';

describe('Finder', () => {
  it('should create an instance', () => {
    const finder = new Finder(document.createElement('div'));
    expect(finder).not.toBeNull();
    expect(finder).toBeInstanceOf(Finder);
  });

  it(`should throw error when element param is empty`, () => {
    expect(() => {
      new Finder();
    }).toThrow('Target element is required');
  });

  describe('find', () => {
    let finder;
    let el;
    let textNode;

    beforeEach(() => {
      el = document.createElement('div');
      textNode = document.createTextNode('HelloWorldHelloWorld');
      el.appendChild(textNode);

      finder = new Finder(el);
    });

    it(`shouldn't find anything when keyword parameter is empty`, () => {
      expect(finder.find().length).toBe(0);
    });

    it(`shouldn't find anything when keyword parameter is zero length regular expression`, () => {
      expect(finder.find('a?').length).toBe(0);
    });

    it(`should return zero length array when there aren't any matched text`, () => {
      expect(finder.find('おはよう').length).toBe(0);
    });

    it('should find when there is matched text', () => {
      const matches = finder.find('Hello');

      // [] => Matched text
      // Match 1: [Hello]WorldHelloWorld
      // Match 2: HelloWorld[Hello]World
      expect(matches.length).toBe(2);
      // Match 1
      expect(matches[0].textNodeRanges.length).toBe(1);
      expect(matches[0].textNodeRanges[0]).toEqual({
        startOffset: 0,
        endOffset: 5,
        textNode,
        isModified: false,
        isDirty: false,
        next: matches[1].textNodeRanges[0],
        previous: null,
        nextVersion: null,
        previousVersion: null,
      });
      // Match 2
      expect(matches[1].textNodeRanges.length).toBe(1);
      expect(matches[1].textNodeRanges[0]).toEqual({
        startOffset: 10,
        endOffset: 15,
        textNode,
        isModified: false,
        isDirty: false,
        next: null,
        previous: matches[0].textNodeRanges[0],
        nextVersion: null,
        previousVersion: null,
      });

      expect(matches[0].textNodeRanges[0].next).toBe(
        matches[1].textNodeRanges[0],
      );
      expect(matches[0].textNodeRanges[0].previous).toBeNull();
      expect(matches[1].textNodeRanges[0].previous).toBe(
        matches[0].textNodeRanges[0],
      );
      expect(matches[1].textNodeRanges[0].next).toBeNull();
    });

    it('should find when element is text node', () => {
      finder = new Finder(textNode);
      const matches = finder.find('Hello');
      expect(matches.length).toBe(2);
      // Match 1
      expect(matches[0].textNodeRanges.length).toBe(1);
      expect(matches[0].textNodeRanges[0]).toEqual({
        startOffset: 0,
        endOffset: 5,
        textNode,
        isModified: false,
        isDirty: false,
        next: matches[1].textNodeRanges[0],
        previous: null,
        nextVersion: null,
        previousVersion: null,
      });
      // Match 2
      expect(matches[1].textNodeRanges.length).toBe(1);
      expect(matches[1].textNodeRanges[0]).toEqual({
        startOffset: 10,
        endOffset: 15,
        textNode,
        isModified: false,
        isDirty: false,
        next: null,
        previous: matches[0].textNodeRanges[0],
        nextVersion: null,
        previousVersion: null,
      });
    });
  });

  describe('replace', () => {
    let finder;
    let root;
    let textNode;

    beforeEach(() => {
      root = document.createElement('div');
      textNode = document.createTextNode('HelloWorldHelloWorld');
      root.appendChild(textNode);

      finder = new Finder(root);
    });

    it(`should replace (case 1)`, () => {
      const matches = finder.find('Hello');

      finder.replace(matches, 'HELLO');
      expect(root.innerHTML).toBe('HELLOWorldHELLOWorld');
      expect(matches[0].textNodeRanges[0].isModified).toBe(true);
    });

    it(`should replace (case 2)`, () => {
      const matchesA = finder.find('Hello');
      const matchesB = finder.find('World');

      finder.replace(matchesA, 'World');
      expect(root.innerHTML).toBe('WorldWorldWorldWorld');

      const matchesC = finder.find('World');
      finder.replace(matchesB, '世界');
      expect(root.innerHTML).toBe('World世界World世界');

      // matchesB modified matchesC's textNodeRange.
      expect(matchesC[1].textNodeRanges[0].isDirty).toBe(true);
      expect(matchesC[3].textNodeRanges[0].isDirty).toBe(true);

      finder.replace(matchesC, 'せかい');
      expect(root.innerHTML).toBe('せかい世界せかい世界');
    });

    it(`shouldn't replace when matched text node is modified`, () => {
      const matches = finder.find('Hello');

      finder.replace(matches, 'World');
      expect(root.innerHTML).toBe('WorldWorldWorldWorld');
      expect(matches[0].textNodeRanges[0].isModified).toBe(true);

      finder.replace(matches, 'Hello');
      expect(root.innerHTML).toBe('WorldWorldWorldWorld');
    });
  });
});
