import {
  getTextNodes,
  getTextNodesDividedByBlock,
  getTextWithTextBoundaryFromTextNodes,
} from './node-text';

const removeTagSpaceInHTML = html =>
  html
    .replace(/>[\s]+</g, '><')
    .replace(/>[\s]+/g, '>')
    .replace(/[\s]+</g, '<');

describe('getTextNodes', () => {
  it('should get text nodes from single root node', () => {
    const dom = document.createElement('div');
    dom.innerHTML = `<b>A</b><b>B</b>`;
    const textNodes = getTextNodes(dom);

    expect(textNodes).toHaveLength(2);
    expect(textNodes[0]).toEqual(dom.firstChild.firstChild);
    expect(textNodes[1]).toEqual(dom.lastChild.lastChild);
  });
});

describe('getTextNodesDividedByBlock', () => {
  let dom;

  beforeEach(() => {
    dom = document.createElement('div');
  });

  it('should get text nodes which divided by block', () => {
    dom.innerHTML = `A<br>B`;
    const textNodesArray = getTextNodesDividedByBlock(dom);

    /*
      A
      B
    */
    expect(textNodesArray).toHaveLength(2);
    expect(textNodesArray[0]).toEqual([dom.firstChild]);
    expect(textNodesArray[1]).toEqual([dom.lastChild]);
  });

  // cases
  it('case 1', () => {
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
    const textNodesArray = getTextNodesDividedByBlock(dom);

    /*
      AB
      CD
      E
    */
    expect(textNodesArray).toHaveLength(3);
    expect(textNodesArray).toEqual([
      // AB
      [
        dom.firstChild.firstChild.firstChild,
        dom.firstChild.lastChild.firstChild,
      ],
      // CD
      [
        dom.childNodes[1].firstChild.firstChild,
        dom.childNodes[1].lastChild.firstChild,
      ],
      // E
      [dom.childNodes[2].firstChild],
    ]);
  });

  it('case 2', () => {
    dom.innerHTML = removeTagSpaceInHTML(`
      <br>A<br>B
    `);
    const textNodesArray = getTextNodesDividedByBlock(dom);

    /*
      
      A
      B
    */
    expect(textNodesArray).toHaveLength(2);
    expect(textNodesArray).toEqual([
      // A
      [dom.childNodes[1]],
      // B
      [dom.lastChild],
    ]);
  });

  it('case 3', () => {
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
    const textNodesArray = getTextNodesDividedByBlock(dom);

    /*
      A
      B
      C
    */
    expect(textNodesArray).toHaveLength(3);
    expect(textNodesArray).toEqual([
      // A
      [dom.firstChild.childNodes[1].firstChild],
      // B
      [dom.firstChild.childNodes[3]],
      // C
      [dom.firstChild.childNodes[5]],
    ]);
  });

  it('case 4', () => {
    dom.innerHTML = removeTagSpaceInHTML(`
      A<img>B
    `);
    const textNodesArray = getTextNodesDividedByBlock(dom);

    /*
      A
      B
    */
    expect(textNodesArray).toHaveLength(2);
    expect(textNodesArray).toEqual([
      // A
      [dom.firstChild],
      // B
      [dom.lastChild],
    ]);
  });

  it('case 5', () => {
    dom.innerHTML = removeTagSpaceInHTML(`
      A<svg></svg>B
    `);
    const textNodesArray = getTextNodesDividedByBlock(dom);

    /*
      A
      B
    */
    expect(textNodesArray).toHaveLength(2);
    expect(textNodesArray).toEqual([
      // A
      [dom.firstChild],
      // B
      [dom.lastChild],
    ]);
  });

  it('case 6', () => {
    dom.innerHTML = removeTagSpaceInHTML(`
      A
      <div>B</div>
      <span>C</span>
    `);
    const textNodesArray = getTextNodesDividedByBlock(dom);

    /*
      A
      B
      C
    */
    expect(textNodesArray).toHaveLength(3);
    expect(textNodesArray).toEqual([
      // A
      [dom.firstChild],
      // B
      [dom.childNodes[1].firstChild],
      // C
      [dom.lastChild.firstChild],
    ]);
  });

  it('case 7', () => {
    dom.innerHTML = removeTagSpaceInHTML(`
      <div>A</div>
      B
      <div>C</div>
      <span>D</span>
    `);
    const textNodesArray = getTextNodesDividedByBlock(dom);

    /*
      A
      B
      C
      D
    */
    expect(textNodesArray).toHaveLength(4);
    expect(textNodesArray).toEqual([
      // A
      [dom.firstChild.firstChild],
      // B
      [dom.childNodes[1]],
      // C
      [dom.childNodes[2].firstChild],
      // D
      [dom.lastChild.firstChild],
    ]);
  });

  it('case 8', () => {
    dom.innerHTML = removeTagSpaceInHTML(`
      <button>A</button>
      B
      <button>C</button>
      D
    `);
    const textNodesArray = getTextNodesDividedByBlock(dom);

    /*
      A
      B
      C
      D
    */
    expect(textNodesArray).toHaveLength(4);
    expect(textNodesArray).toEqual([
      // A
      [dom.firstChild.firstChild],
      // B
      [dom.childNodes[1]],
      // C
      [dom.childNodes[2].firstChild],
      // D
      [dom.childNodes[3]],
    ]);
  });

  it('case 9', () => {
    dom.innerHTML = removeTagSpaceInHTML(`
      A
      <a>B</a>
      C
    `);
    const textNodesArray = getTextNodesDividedByBlock(dom);

    /*
      A
      B
      C
    */
    expect(textNodesArray).toHaveLength(3);
    expect(textNodesArray).toEqual([
      // A
      [dom.firstChild],
      // B
      [dom.childNodes[1].firstChild],
      // C
      [dom.lastChild],
    ]);
  });

  it('case 10', () => {
    dom.innerHTML = removeTagSpaceInHTML(`
      <span>
        A
        <a></a>
      </span>
      B
      <span>C</span>
    `);
    const textNodesArray = getTextNodesDividedByBlock(dom);

    /*
      A
      BC
    */
    expect(textNodesArray).toHaveLength(2);
    expect(textNodesArray).toEqual([
      // A
      [dom.firstChild.firstChild],
      // BC
      [dom.childNodes[1], dom.lastChild.firstChild],
    ]);
  });

  it('case 11', () => {
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
    const textNodesArray = getTextNodesDividedByBlock(dom);

    /*
      A
    */
    expect(textNodesArray).toHaveLength(1);
    expect(textNodesArray).toEqual([
      // A
      [dom.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild],
    ]);
  });

  it('case 12', () => {
    dom.innerHTML = removeTagSpaceInHTML(`
      <span>A</span>
      <span>
        B
        <br>
        C
      </span>
      <span>D</span>
    `);
    const textNodesArray = getTextNodesDividedByBlock(dom);

    /*
      AB
      CD
    */
    expect(textNodesArray).toHaveLength(2);
    expect(textNodesArray).toEqual([
      // AB
      [dom.firstChild.firstChild, dom.childNodes[1].firstChild],
      // CD
      [dom.childNodes[1].lastChild, dom.lastChild.firstChild],
    ]);
  });

  it('case 13', () => {
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
    const textNodesArray = getTextNodesDividedByBlock(dom);

    /*
      A
      B
      C
    */
    expect(textNodesArray).toHaveLength(3);
    expect(textNodesArray).toEqual([
      // A
      [dom.firstChild.firstChild.firstChild.firstChild.firstChild],
      // B
      [dom.firstChild.firstChild.firstChild.lastChild.firstChild],
      // C
      [dom.firstChild.firstChild.lastChild.firstChild.firstChild],
    ]);
  });

  it('case 14', () => {
    dom.innerHTML = removeTagSpaceInHTML(`
      A<hr>B
    `);
    const textNodesArray = getTextNodesDividedByBlock(dom);

    /*
      A
      B
    */
    expect(textNodesArray).toHaveLength(2);
    expect(textNodesArray).toEqual([
      // A
      [dom.firstChild],
      // B
      [dom.lastChild],
    ]);
  });
});

describe('getTextWithTextBoundaryFromTextNodes', () => {
  let dom;

  beforeEach(() => {
    dom = document.createElement('div');
  });

  it('should gather text with text boundary from text nodes', () => {
    dom.innerHTML = `<b>A</b><b>B</b>`;
    const textNodes = getTextNodes(dom);
    const { text, textBoundary } = getTextWithTextBoundaryFromTextNodes(
      textNodes,
    );

    expect(text).toBe('AB');
    expect(textBoundary).toEqual([0, 1]);
  });
});
