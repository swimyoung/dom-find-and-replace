import {
  isElementNode,
  isSelfClosingNode,
  isTextNode,
  isBlockNode,
} from './node-type';

export interface TextRanges {
  textNode: Text;
  range: { start: number; end: number };
}

function getTextNodes(node: Node): Text[] {
  if (isTextNode(node)) {
    return [node] as Text[];
  }

  const iterator = document.createNodeIterator(
    node,
    NodeFilter.SHOW_TEXT,
    null,
    // TypeScript bug
    // eslint-disable-next-line
    // @ts-ignore
    false,
  );
  const textNodes: Text[] = [];

  let textNode = iterator.nextNode();
  while (textNode) {
    textNodes.push(textNode as Text);
    textNode = iterator.nextNode();
  }

  return textNodes;
}

function isTextDivisionNode(node: Node): boolean {
  return (
    isElementNode(node) &&
    (isSelfClosingNode(node as Element) ||
      ['SVG'].indexOf((node as Element).tagName.toUpperCase()) !== -1)
  );
}

interface NodeWithClosestParentBlock {
  node: Node;
  parentBlock: Element;
}

function getTextNodesDividedByBlock(root: Element): Text[][] {
  const stack: NodeWithClosestParentBlock[] = [];
  const pendStack: NodeWithClosestParentBlock[] = [];
  const result: Text[][] = [];

  if (!root.firstChild || !isBlockNode(root)) {
    return result;
  }

  stack.push({
    node: root.firstChild,
    parentBlock: root,
  });
  let latestParentBlock = root;
  result.push([]);
  while (stack.length > 0) {
    const { node, parentBlock } = stack.pop();
    const { firstChild, nextSibling } = node;

    if (
      latestParentBlock !== parentBlock &&
      result[result.length - 1].length !== 0
    ) {
      result.push([]);
    }
    latestParentBlock = parentBlock;

    if (isTextNode(node)) {
      result[result.length - 1].push(node as Text);
    } else if (
      isTextDivisionNode(node) &&
      result[result.length - 1].length !== 0
    ) {
      result.push([]);
    }

    if (firstChild) {
      stack.push({
        node: firstChild,
        parentBlock: isBlockNode(node) ? (node as Element) : parentBlock,
      });

      if (nextSibling) {
        pendStack.push({
          node: nextSibling,
          parentBlock: isBlockNode(nextSibling.parentNode)
            ? (nextSibling.parentNode as Element)
            : parentBlock,
        });
      }
    } else if (nextSibling) {
      stack.push({
        node: nextSibling,
        parentBlock: isBlockNode(nextSibling.parentNode)
          ? (nextSibling.parentNode as Element)
          : parentBlock,
      });
    } else if (pendStack.length > 0) {
      stack.push(pendStack.pop());
    }
  }

  return result;
}

function getTextWithRanges(
  textNodes: Text[],
): { text: string; ranges: TextRanges[] } {
  const ranges: TextRanges[] = [];
  let text = '';

  for (let i = 0; i < textNodes.length; i++) {
    const textNode = textNodes[i];
    const { nodeValue } = textNode;
    ranges.push({
      textNode,
      range: {
        start: text.length,
        end: text.length + nodeValue.length,
      },
    });
    text = `${text}${nodeValue}`;
  }

  return { text, ranges };
}

export { getTextNodes, getTextNodesDividedByBlock, getTextWithRanges };
