import findAndReplace from './index';

describe('find and replace', () => {
  it('should accept HTML string', () => {
    expect(
      findAndReplace('<div>hel<i>l</i>o world</div>', {
        find: 'hello',
        replace: 'HELLO',
      }),
    ).toBe('<div>HEL<i>L</i>O world</div>');
  });

  describe('text', () => {
    it('should find text and replace it with text', () => {
      const el = document.createElement('div');
      el.appendChild(document.createTextNode('hello'));
      el.appendChild(document.createTextNode(' '));
      el.appendChild(document.createTextNode('world'));

      findAndReplace(el, {
        find: 'hello',
        replace: 'HELLO',
      });
      expect(el.innerHTML).toBe('HELLO world');
    });

    it('should find all text in node and replace it with text', () => {
      const div = document.createElement('div');
      div.appendChild(document.createTextNode('h'));
      div.appendChild(document.createTextNode('e'));
      div.appendChild(document.createTextNode('l'));
      div.appendChild(document.createTextNode('l'));
      div.appendChild(document.createTextNode('o'));

      findAndReplace(div, {
        find: 'l',
        replace: 'L',
      });
      expect(div.innerHTML).toBe('heLLo');
    });

    it('should find text and replace it with text when query text is shorter than replacing text', () => {
      const div = document.createElement('div');
      div.appendChild(document.createTextNode('h'));
      div.appendChild(document.createTextNode('e'));
      div.appendChild(document.createTextNode('l'));
      div.appendChild(document.createTextNode('l'));
      div.appendChild(document.createTextNode('o'));

      findAndReplace(div, {
        find: 'hello',
        replace: 'hello world',
      });
      expect(div.innerHTML).toBe('hello world');
    });

    it('should find text and replace it with text when query text is longer than replacing text', () => {
      const div = document.createElement('div');
      div.innerHTML = 'h<span></span>ello';

      findAndReplace(div, {
        find: 'hello',
        replace: 'hi',
      });
      expect(div.innerHTML).toBe('h<span></span>i');
    });

    it('should find text in a single text node and replace it with text', () => {
      const div = document.createElement('div');
      div.innerHTML = 'hello hello hello';

      findAndReplace(div, {
        find: 'hello',
        replace: 'hi',
      });
      expect(div.innerHTML).toBe('hi hi hi');
    });

    it('should find text in a multiple tag and replace it with text', () => {
      const div = document.createElement('div');
      div.innerHTML = '<b>h</b><b>e</b><b>l</b><b>l</b><b>o</b>';

      findAndReplace(div, {
        find: 'hello',
        replace: 'hi',
      });
      expect(div.innerHTML).toBe('<b>h</b><b>i</b><b></b><b></b><b></b>');
    });
  });

  describe('regular expression', () => {
    it('should find text and replace it with regular expression', () => {
      const div = document.createElement('div');
      div.appendChild(document.createTextNode('hello'));
      div.appendChild(document.createTextNode(' '));
      div.appendChild(document.createTextNode('world'));

      findAndReplace(div, {
        find: '\\w+',
        replace: 'word',
      });
      expect(div.innerHTML).toBe('word word');
    });

    it('should find text and replace it with flag', () => {
      const div = document.createElement('div');
      div.appendChild(document.createTextNode('hello'));
      div.appendChild(document.createTextNode(' '));
      div.appendChild(document.createTextNode('HELLO'));

      findAndReplace(div, {
        flag: 'gi',
        find: 'hello',
        replace: 'Hi',
      });
      expect(div.innerHTML).toBe('Hi Hi');
    });

    it('should find text and replace it without flag', () => {
      const div = document.createElement('div');
      div.appendChild(document.createTextNode('hello'));
      div.appendChild(document.createTextNode(' '));
      div.appendChild(document.createTextNode('HELLO'));

      findAndReplace(div, {
        find: 'hello',
        replace: 'Hi',
      });
      expect(div.innerHTML).toBe('Hi HELLO');
    });
  });

  describe('replacer', () => {
    it('should find text and replace it with replacer', () => {
      const div = document.createElement('div');
      div.innerHTML = 'hello hello hello';

      findAndReplace(div, {
        find: 'hello',
        replace: ({ offsetText }) => `<b>${offsetText}</b>`,
      });
      expect(div.innerHTML).toBe('<b>hello</b> <b>hello</b> <b>hello</b>');
    });

    it('should find link text and replace with linkify', () => {
      const div = document.createElement('div');
      div.innerHTML = `http://www.foo.com\nhttps://www.foo.com`;

      findAndReplace(div, {
        flag: 'gi',
        // @see https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url for url matching regular expression
        find:
          'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)',
        replace: ({ offsetText, regExpExecArray }) =>
          `<a href="${regExpExecArray[0]}">${offsetText}</a>`,
      });

      expect(div.innerHTML).toBe(
        `<a href="http://www.foo.com">http://www.foo.com</a>\n<a href="https://www.foo.com">https://www.foo.com</a>`,
      );
    });
  });
});
