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
  /*
    [A, B]
  */
  expect(getTextNodes(root)).toEqual([
    root.firstChild.firstChild,
    root.lastChild.lastChild,
  ]);
});

cases(
  'get text nodes divided by block',
  (opts: any) => {
    root.innerHTML = opts.name;
    expect(getTextNodesDividedByBlock(root)).toEqual(opts.expecting(root));
  },
  [
    {
      name: `A<br>B`,
      /*
        [
          [A],
          [B]
        ]
      */
      expecting: (root: Element): Array<Array<Node>> => [
        [root.firstChild],
        [root.lastChild],
      ],
    },

    {
      name: `A<hr>B`,
      /*
        [
          [A],
          [B]
        ]
       */
      expecting: (root: Element): Array<Array<Node>> => [
        [root.firstChild],
        [root.lastChild],
      ],
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
      /*
        [
          [A, B],
          [C, D],
          [E]
        ]
      */
      expecting: (root: Element): Array<Array<Node>> => [
        [
          root.firstChild.firstChild.firstChild,
          root.firstChild.lastChild.firstChild,
        ],
        [
          root.childNodes[1].firstChild.firstChild,
          root.childNodes[1].lastChild.firstChild,
        ],
        [root.childNodes[2].firstChild],
      ],
    },

    {
      name: `<br>A<br>B`,
      /*
        [
          [A],
          [B]
        ]
       */
      expecting: (root: Element): Array<Array<Node>> => [
        [root.childNodes[1]],
        [root.lastChild],
      ],
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
      /*
        [
          [A],
          [B],
          [C]
        ]
       */
      expecting: (root: Element): Array<Array<Node>> => [
        [root.firstChild.childNodes[1].firstChild],
        [root.firstChild.childNodes[3]],
        [root.firstChild.childNodes[5]],
      ],
    },

    {
      name: `A<img>B`,
      /*
        [
          [A],
          [B]
        ]
       */
      expecting: (root: Element): Array<Array<Node>> => [
        [root.firstChild],
        [root.lastChild],
      ],
    },

    {
      name: `A<svg></svg>B`,
      /*
        [
          [A],
          [B]
        ]
       */
      expecting: (root: Element): Array<Array<Node>> => [
        [root.firstChild],
        [root.lastChild],
      ],
    },

    {
      name: `A<div>B</div><span>C</span>`,
      /*
        [
          [A],
          [B],
          [C]
        ]
       */
      expecting: (root: Element): Array<Array<Node>> => [
        [root.firstChild],
        [root.childNodes[1].firstChild],
        [root.lastChild.firstChild],
      ],
    },

    {
      name: removeTagSpaceInHTML(`
        <div>A</div>
        B
        <div>C</div>
        <span>D</span>
      `),
      /*
        [
          [A],
          [B],
          [C],
          [D]
        ]
       */
      expecting: (root: Element): Array<Array<Node>> => [
        [root.firstChild.firstChild],
        [root.childNodes[1]],
        [root.childNodes[2].firstChild],
        [root.lastChild.firstChild],
      ],
    },

    {
      name: removeTagSpaceInHTML(`
        A
        <a>B</a>
        C
      `),
      /*
        [
          [A, B, C]
        ]
       */
      expecting: (root: Element): Array<Array<Node>> => [
        [root.firstChild, root.childNodes[1].firstChild, root.lastChild],
      ],
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
      /*
        [
          [A, B, C]
        ]
       */
      expecting: (root: Element): Array<Array<Node>> => [
        [
          root.firstChild.firstChild,
          root.childNodes[1],
          root.lastChild.firstChild,
        ],
      ],
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
      /*
        [
          [A]
        ]
       */
      expecting: (root: Element): Array<Array<Node>> => [
        [
          root.firstChild.firstChild.firstChild.firstChild.firstChild
            .firstChild,
        ],
      ],
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
      /*
        [
          [A, B],
          [C, D]
        ]
       */
      expecting: (root: Element): Array<Array<Node>> => [
        [root.firstChild.firstChild, root.childNodes[1].firstChild],
        [root.childNodes[1].lastChild, root.lastChild.firstChild],
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
      /*
        [
          [A],
          [B],
          [C]
        ]
       */
      expecting: (root: Element): Array<Array<Node>> => [
        [root.firstChild.firstChild.firstChild.firstChild.firstChild],
        [root.firstChild.firstChild.firstChild.lastChild.firstChild],
        [root.firstChild.firstChild.lastChild.firstChild.firstChild],
      ],
    },
  ],
);

cases(
  'gather text with text boundary from text nodes',
  (opts: any) => {
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
