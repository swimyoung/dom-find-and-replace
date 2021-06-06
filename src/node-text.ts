import {
  isElementNode,
  isSelfClosingNode,
  isTextNode,
  isBlockNode,
} from 'dom-node-type';
import { Range } from './Range';

export interface TextNodeWithRange {
  textNode: Text;
  text: string;
  range: Range;
}

function getTextNodes(node: Node): Text[] {
  const textNodes: Text[] = [];

  if (isTextNode(node)) {
    textNodes.push(node as Text);
    return textNodes;
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
    const { node, parentBlock } = stack.pop() as NodeWithClosestParentBlock;
    const { firstChild, nextSibling, parentNode } = node;

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
          parentBlock: isBlockNode(parentNode)
            ? (parentNode as Element)
            : parentBlock,
        });
      }
    } else if (nextSibling) {
      stack.push({
        node: nextSibling,
        parentBlock: isBlockNode(parentNode)
          ? (parentNode as Element)
          : parentBlock,
      });
    } else if (pendStack.length > 0) {
      stack.push(pendStack.pop() as NodeWithClosestParentBlock);
    }
  }

  return result;
}

function getTextWithRanges(
  textNodes: Text[],
): { text: string; ranges: TextNodeWithRange[] } {
  const ranges: TextNodeWithRange[] = [];
  let text = '';

  for (let i = 0; i < textNodes.length; i++) {
    const textNode = textNodes[i];
    ranges.push({
      textNode,
      text: textNode.nodeValue,
      range: {
        start: text.length,
        end: text.length + (textNode.nodeValue as string).length,
      },
    });
    text = `${text}${textNode.nodeValue as string}`;
  }

  return { text, ranges };
}

export { getTextNodes, getTextNodesDividedByBlock, getTextWithRanges };
