import {
  getTextNodes,
  getTextNodesDividedByBlock,
  getTextWithTextRanges,
} from './node-text';

const removeTagSpaceInHTML = html =>
  html
    .replace(/>[\s]+</g, '><')
    .replace(/>[\s]+/g, '>')
    .replace(/[\s]+</g, '<');
const dom = document.createElement('div');

test('get text nodes from root node', () => {
  /*
    [A, B]
  */
  dom.innerHTML = `<b>A</b><b>B</b>`;
  expect(getTextNodes(dom)).toEqual([
    dom.firstChild.firstChild,
    dom.lastChild.lastChild,
  ]);
});

test('get text nodes divided by block', () => {
  /*
    [
      [A],
      [B]
    ]
  */
  dom.innerHTML = `A<br>B`;
  expect(getTextNodesDividedByBlock(dom)).toEqual([
    [dom.firstChild],
    [dom.lastChild],
  ]);

  /*
    [
      [A, B],
      [C, D],
      [E]
    ]
  */
  dom.innerHTML = removeTagSpaceInHTML(`
    <div>
      <span>A</span>
      <span>B</span>
    </div>
    <div>
      <span>C</span>
      <span>D</span>
    </div>
    <span>E</span>
  `);
  expect(getTextNodesDividedByBlock(dom)).toEqual([
    [dom.firstChild.firstChild.firstChild, dom.firstChild.lastChild.firstChild],
    [
      dom.childNodes[1].firstChild.firstChild,
      dom.childNodes[1].lastChild.firstChild,
    ],
    [dom.childNodes[2].firstChild],
  ]);

  /*
    [
      [A],
      [B]
    ]
  */
  dom.innerHTML = `<br>A<br>B`;
  expect(getTextNodesDividedByBlock(dom)).toEqual([
    [dom.childNodes[1]],
    [dom.lastChild],
  ]);

  /*
    [
      [A],
      [B],
      [C]
    ]
  */
  dom.innerHTML = removeTagSpaceInHTML(`
    <p>
      <br>
      <b>A</b>
      <br>
      B
      <br>
      C
    </p>
  `);
  expect(getTextNodesDividedByBlock(dom)).toEqual([
    [dom.firstChild.childNodes[1].firstChild],
    [dom.firstChild.childNodes[3]],
    [dom.firstChild.childNodes[5]],
  ]);

  /*
    [
      [A],
      [B]
    ]
  */
  dom.innerHTML = `A<img>B`;
  expect(getTextNodesDividedByBlock(dom)).toEqual([
    [dom.firstChild],
    [dom.lastChild],
  ]);

  /*
    [
      [A],
      [B]
    ]
  */
  dom.innerHTML = `A<svg></svg>B`;
  expect(getTextNodesDividedByBlock(dom)).toEqual([
    [dom.firstChild],
    [dom.lastChild],
  ]);

  /*
    [
      [A],
      [B],
      [C]
    ]
  */
  dom.innerHTML = removeTagSpaceInHTML(`
    A
    <div>B</div>
    <span>C</span>
  `);
  expect(getTextNodesDividedByBlock(dom)).toEqual([
    [dom.firstChild],
    [dom.childNodes[1].firstChild],
    [dom.lastChild.firstChild],
  ]);

  /*
    [
      [A],
      [B],
      [C],
      [D]
    ]
  */
  dom.innerHTML = removeTagSpaceInHTML(`
    <div>A</div>
    B
    <div>C</div>
    <span>D</span>
  `);
  expect(getTextNodesDividedByBlock(dom)).toEqual([
    [dom.firstChild.firstChild],
    [dom.childNodes[1]],
    [dom.childNodes[2].firstChild],
    [dom.lastChild.firstChild],
  ]);

  /*
    [
      [A, B, C]
    ]
  */
  dom.innerHTML = removeTagSpaceInHTML(`
    A
    <a>B</a>
    C
  `);
  expect(getTextNodesDividedByBlock(dom)).toEqual([
    [dom.firstChild, dom.childNodes[1].firstChild, dom.lastChild],
  ]);

  /*
    [
      [A, B, C]
    ]
  */
  dom.innerHTML = removeTagSpaceInHTML(`
    <span>
      A
      <a></a>
    </span>
    B
    <span>C</span>
  `);
  expect(getTextNodesDividedByBlock(dom)).toEqual([
    [dom.firstChild.firstChild, dom.childNodes[1], dom.lastChild.firstChild],
  ]);

  /*
    [
      [A]
    ]
  */
  dom.innerHTML = removeTagSpaceInHTML(`
    <div>
      <p>
        <b>
          <span style="color: rgb(0, 0, 0);">
            <u>A</u>
          </span>
        </b>
      </p>
    </div>
  `);
  expect(getTextNodesDividedByBlock(dom)).toEqual([
    [dom.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild],
  ]);

  /*
    [
      [A, B],
      [C, D]
    ]
  */
  dom.innerHTML = removeTagSpaceInHTML(`
    <span>A</span>
    <span>
      B
      <br>
      C
    </span>
    <span>D</span>
  `);
  expect(getTextNodesDividedByBlock(dom)).toEqual([
    [dom.firstChild.firstChild, dom.childNodes[1].firstChild],
    [dom.childNodes[1].lastChild, dom.lastChild.firstChild],
  ]);

  /*
    [
      [A],
      [B],
      [C]
    ]
  */
  dom.innerHTML = removeTagSpaceInHTML(`
    <table>
      <tbody>
        <tr>
          <td>A</td>
          <td>B</td>
        </tr>
        <tr>
          <td>C</td>
        </tr>
      </tbody>
    </table>
  `);
  expect(getTextNodesDividedByBlock(dom)).toEqual([
    [dom.firstChild.firstChild.firstChild.firstChild.firstChild],
    [dom.firstChild.firstChild.firstChild.lastChild.firstChild],
    [dom.firstChild.firstChild.lastChild.firstChild.firstChild],
  ]);

  /*
    [
      [A],
      [B]
    ]
  */
  dom.innerHTML = `A<hr>B`;
  expect(getTextNodesDividedByBlock(dom)).toEqual([
    [dom.firstChild],
    [dom.lastChild],
  ]);
});

test('gather text with text boundary from text nodes', () => {
  dom.innerHTML = `<b>A</b><b>B</b>`;
  const textNodes = getTextNodes(dom);
  const { text, ranges } = getTextWithTextRanges(textNodes);

  expect(text).toBe('AB');
  expect(ranges).toEqual([
    {
      textNode: textNodes[0],
      range: {
        start: 0,
        end: 1,
      },
    },
    {
      textNode: textNodes[1],
      range: {
        start: 1,
        end: 2,
      },
    },
  ]);
});
