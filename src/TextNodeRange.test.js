import TextNodeRange from './TextNodeRange';

describe('TextNodeRange', () => {
  let textNode;
  let textNodeRange;

  beforeEach(() => {
    textNode = document.createTextNode('boo');
  });

  it('should create an instance', () => {
    textNodeRange = new TextNodeRange({
      textNode,
      startOffset: 1,
      endOffset: 2,
    });

    expect(textNodeRange).not.toBeNull();
    expect(textNodeRange).toBeInstanceOf(TextNodeRange);
  });

  it('should split text node', () => {
    textNodeRange = new TextNodeRange({
      textNode,
      startOffset: 1,
      endOffset: 2,
    });
    let textNodes = textNodeRange.split();
    expect(textNodes.length).toBe(3);
    expect(textNodes[0].nodeValue).toBe('b');
    expect(textNodes[1].nodeValue).toBe('o');
    expect(textNodes[2].nodeValue).toBe('o');

    textNodeRange = new TextNodeRange({
      textNode,
      startOffset: 1,
      endOffset: 1,
    });
    textNodes = textNodeRange.split();
    expect(textNodes.length).toBe(2);
    expect(textNodes[0].nodeValue).toBe('b');
    expect(textNodes[1].nodeValue).toBe('oo');
  });

  it('should check exclusive offset', () => {
    textNodeRange = new TextNodeRange({
      textNode,
      startOffset: 0,
      endOffset: 2,
    });

    expect(textNodeRange.isExclusiveOffset(0)).toBe(true);
    expect(textNodeRange.isExclusiveOffset(1)).toBe(false);
    expect(textNodeRange.isExclusiveOffset(2)).toBe(true);
    expect(textNodeRange.isExclusiveOffset(3)).toBe(true);
  });

  it('should compare equal', () => {
    textNodeRange = new TextNodeRange({
      textNode,
      startOffset: 0,
      endOffset: 2,
    });

    expect(
      textNodeRange.isEqual(
        new TextNodeRange({
          textNode,
          startOffset: 0,
          endOffset: 2,
        }),
      ),
    ).toBe(true);
    expect(
      textNodeRange.isEqual(
        new TextNodeRange({
          textNode: document.createTextNode('boo'),
          startOffset: 0,
          endOffset: 2,
        }),
      ),
    ).toBe(false);
    expect(
      textNodeRange.isEqual(
        new TextNodeRange({
          textNode,
          startOffset: 1,
          endOffset: 2,
        }),
      ),
    ).toBe(false);
    expect(
      textNodeRange.isEqual(
        new TextNodeRange({
          textNode,
          startOffset: 0,
          endOffset: 1,
        }),
      ),
    ).toBe(false);
  });
});
