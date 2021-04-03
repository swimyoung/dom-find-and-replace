import { findAndReplace, Recover } from './index';

describe('find and replace', () => {
  let root: Element;

  beforeEach(() => {
    root = document.createElement('div');
  });

  it('should accept HTML string', () => {
    expect(
      findAndReplace('<div>hel<i>l</i>o world</div>', {
        find: 'hello',
        replace: 'HELLO',
      }),
    ).toBe('<div>HEL<i>L</i>O world</div>');
  });

  it('should find text and replace it with text', () => {
    root.appendChild(document.createTextNode('hello'));
    root.appendChild(document.createTextNode(' '));
    root.appendChild(document.createTextNode('world'));
    const recover = findAndReplace(root, {
      find: 'hello',
      replace: 'HELLO',
    }) as Recover;
    expect(root.innerHTML).toBe('HELLO world');
    recover();
    expect(root.innerHTML).toBe('hello world');
  });

  it('should find all text in node and replace it with text', () => {
    let recover;
    root.appendChild(document.createTextNode('hell'));
    root.appendChild(document.createTextNode('o!h'));
    root.appendChild(document.createTextNode('ello!'));
    recover = findAndReplace(root, {
      find: 'hello',
      replace: 'hi',
    }) as Recover;
    expect(root.innerHTML).toBe('hi!hi!');
    recover();
    expect(root.innerHTML).toBe('hello!hello!');

    root = document.createElement('div');
    root.appendChild(document.createTextNode('hello'));
    recover = findAndReplace(root, {
      find: 'l',
      replace: 'L',
    }) as Recover;
    expect(root.innerHTML).toBe('heLLo');
    recover();
    expect(root.innerHTML).toBe('hello');

    root = document.createElement('div');
    root.appendChild(document.createTextNode('h'));
    root.appendChild(document.createTextNode('e'));
    root.appendChild(document.createTextNode('l'));
    root.appendChild(document.createTextNode('l'));
    root.appendChild(document.createTextNode('o'));
    root.appendChild(document.createTextNode('!'));
    root.appendChild(document.createTextNode('hello'));
    root.appendChild(document.createTextNode('!'));
    recover = findAndReplace(root, {
      find: 'hello',
      replace: 'hi',
    }) as Recover;
    expect(root.innerHTML).toBe('hi!hi!');
    recover();
    expect(root.innerHTML).toBe('hello!hello!');

    root = document.createElement('div');
    root.appendChild(document.createTextNode('h'));
    root.appendChild(document.createTextNode('e'));
    root.appendChild(document.createTextNode('l'));
    root.appendChild(document.createTextNode('l'));
    root.appendChild(document.createTextNode('o'));
    recover = findAndReplace(root, {
      find: 'l',
      replace: 'L',
    }) as Recover;
    expect(root.innerHTML).toBe('heLLo');
    recover();
    expect(root.innerHTML).toBe('hello');
  });

  it('should find text and replace it with text when query text is shorter than replacing text', () => {
    root.appendChild(document.createTextNode('h'));
    root.appendChild(document.createTextNode('e'));
    root.appendChild(document.createTextNode('l'));
    root.appendChild(document.createTextNode('l'));
    root.appendChild(document.createTextNode('o'));

    const recover = findAndReplace(root, {
      find: 'hello',
      replace: 'hello world',
    }) as Recover;
    expect(root.innerHTML).toBe('hello world');
    recover();
    expect(root.innerHTML).toBe('hello');
  });

  it('should find text and replace it with text when query text is longer than replacing text', () => {
    root.innerHTML = 'h<span></span>ello';

    const recover = findAndReplace(root, {
      find: 'hello',
      replace: 'hi',
    }) as Recover;
    expect(root.innerHTML).toBe('h<span></span>i');
    recover();
    expect(root.innerHTML).toBe('h<span></span>ello');
  });

  it('should find text in a single text node and replace it with text', () => {
    root.innerHTML = 'hello hello hello';

    const recover = findAndReplace(root, {
      find: 'hello',
      replace: 'hi',
    }) as Recover;
    expect(root.innerHTML).toBe('hi hi hi');
    recover();
    expect(root.innerHTML).toBe('hello hello hello');
  });

  it('should find text in a multiple tag and replace it with text', () => {
    root.innerHTML = '<b>h</b><b>e</b><b>l</b><b>l</b><b>o</b>';
    const recover = findAndReplace(root, {
      find: 'hello',
      replace: 'hi',
    }) as Recover;
    expect(root.innerHTML).toBe('<b>h</b><b>i</b><b></b><b></b><b></b>');
    recover();
    expect(root.innerHTML).toBe('<b>h</b><b>e</b><b>l</b><b>l</b><b>o</b>');
  });

  it('should find text and replace it with regular expression', () => {
    root.appendChild(document.createTextNode('hello'));
    root.appendChild(document.createTextNode(' '));
    root.appendChild(document.createTextNode('world'));

    const recover = findAndReplace(root, {
      find: '\\w+',
      replace: 'word',
    }) as Recover;
    expect(root.innerHTML).toBe('word word');
    recover();
    expect(root.innerHTML).toBe('hello world');
  });

  it('should find text and replace it with flag', () => {
    root.appendChild(document.createTextNode('hello'));
    root.appendChild(document.createTextNode(' '));
    root.appendChild(document.createTextNode('HELLO'));

    const recover = findAndReplace(root, {
      flag: 'gi',
      find: 'hello',
      replace: 'Hi',
    }) as Recover;
    expect(root.innerHTML).toBe('Hi Hi');
    recover();
    expect(root.innerHTML).toBe('hello HELLO');
  });

  it('should find text and replace it without flag', () => {
    root.appendChild(document.createTextNode('hello'));
    root.appendChild(document.createTextNode(' '));
    root.appendChild(document.createTextNode('HELLO'));

    const recover = findAndReplace(root, {
      find: 'hello',
      replace: 'Hi',
    }) as Recover;
    expect(root.innerHTML).toBe('Hi HELLO');
    recover();
    expect(root.innerHTML).toBe('hello HELLO');
  });

  it('should find text and replace it with replacer', () => {
    root.innerHTML = 'hello hello hello';

    const recover = findAndReplace(root, {
      find: 'hello',
      replace: (offsetText) => {
        const bold = document.createElement('b');
        bold.textContent = offsetText;
        return bold;
      },
    }) as Recover;
    expect(root.innerHTML).toBe('<b>hello</b> <b>hello</b> <b>hello</b>');
    recover();
    expect(root.innerHTML).toBe('hello hello hello');
  });

  it('should find link text and replace with linkify', () => {
    root.innerHTML = `http://www.foo.com\nhttps://www.foo.com`;

    const recover = findAndReplace(root, {
      flag: 'gi',
      // @see https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url for url matching regular expression
      find:
        'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)',
      replace: (offsetText, foundText) => {
        const anchor = document.createElement('a');
        anchor.href = foundText;
        anchor.textContent = offsetText;
        return anchor;
      },
    }) as Recover;
    expect(root.innerHTML).toBe(
      `<a href="http://www.foo.com">http://www.foo.com</a>\n<a href="https://www.foo.com">https://www.foo.com</a>`,
    );

    recover();
    expect(root.innerHTML).toBe(`http://www.foo.com\nhttps://www.foo.com`);
  });
});
