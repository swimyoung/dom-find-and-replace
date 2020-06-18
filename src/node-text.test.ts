import cases from 'jest-in-case';
import {
  getTextNodes,
  getTextNodesDividedByBlock,
  getTextWithRanges,
  TextNodeWithRange,
} from './node-text';

const removeTagSpaceInHTML = (html: string): string =>
  html
    .replace(/>[\s]+</g, '><')
    .replace(/>[\s]+/g, '>')
    .replace(/[\s]+</g, '<');
const root = document.createElement('div');

test('get text nodes from root node', () => {
  root.innerHTML = `<b>A</b><b>B</b>`;
  expect(getTextNodes(root).map((node) => node.nodeValue)).toEqual(['A', 'B']);
});

cases(
  'get text nodes divided by block',
  (opts) => {
    root.innerHTML = opts.name;
    expect(
      getTextNodesDividedByBlock(root).map((nodes: Text[]) =>
        nodes.map((node) => (node.nodeValue as string).trim()),
      ),
    ).toEqual(opts.expected);
  },
  [
    {
      name: `A<br>B`,
      expected: [['A'], ['B']],
    },

    {
      name: `A<hr>B`,
      expected: [['A'], ['B']],
    },

    {
      name: removeTagSpaceInHTML(`
        <div>
          <span>A</span>
          <span>B</span>
        </div>
        <div>
          <span>C</span>
          <span>D</span>
        </div>
        <span>E</span>
      `),
      expected: [['A', 'B'], ['C', 'D'], ['E']],
    },

    {
      name: `<br>A<br>B`,
      expected: [['A'], ['B']],
    },

    {
      name: removeTagSpaceInHTML(`
        <p>
          <br>
          <b>A</b>
          <br>
          B
          <br>
          C
        </p>
      `),
      expected: [['A'], ['B'], ['C']],
    },

    {
      name: `A<img>B`,
      expected: [['A'], ['B']],
    },

    {
      name: `A<svg></svg>B`,
      expected: [['A'], ['B']],
    },

    {
      name: `A<div>B</div><span>C</span>`,
      expected: [['A'], ['B'], ['C']],
    },

    {
      name: removeTagSpaceInHTML(`
        <div>A</div>
        B
        <div>C</div>
        <span>D</span>
      `),
      expected: [['A'], ['B'], ['C'], ['D']],
    },

    {
      name: removeTagSpaceInHTML(`
        A
        <a>B</a>
        C
      `),
      expected: [['A', 'B', 'C']],
    },

    {
      name: removeTagSpaceInHTML(`
        <span>
          A
          <a></a>
        </span>
        B
        <span>C</span>
      `),
      expected: [['A', 'B', 'C']],
    },

    {
      name: removeTagSpaceInHTML(`
        <div>
          <p>
            <b>
              <span style="color: rgb(0, 0, 0);">
                <u>A</u>
              </span>
            </b>
          </p>
        </div>
      `),
      expected: [['A']],
    },

    {
      name: removeTagSpaceInHTML(`
        <span>A</span>
        <span>
          B
          <br>
          C
        </span>
        <span>D</span>
      `),
      expected: [
        ['A', 'B'],
        ['C', 'D'],
      ],
    },

    {
      name: removeTagSpaceInHTML(`
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
      `),
      expected: [['A'], ['B'], ['C']],
    },
  ],
);

cases(
  'gather text with text boundary from text nodes',
  (opts) => {
    root.innerHTML = opts.name;
    const textNodes = getTextNodes(root);
    expect(getTextWithRanges(textNodes)).toEqual(opts.expecting(textNodes));
  },
  [
    {
      name: `<b>A</b><b>B</b>`,
      expecting: (
        textNodes: Text[],
      ): { text: string; ranges: TextNodeWithRange[] } => ({
        text: 'AB',
        ranges: [
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
        ],
      }),
    },
  ],
);
