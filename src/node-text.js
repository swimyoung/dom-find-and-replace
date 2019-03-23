import {
  isElementNode,
  isSelfClosingNode,
  isTextNode,
  isBlockNode,
} from './node-type';

export function getTextNodes(node) {
  if (node.nodeType === Node.TEXT_NODE) return [node];

  const iterator = document.createNodeIterator(
    node,
    NodeFilter.SHOW_TEXT,
    null,
    false,
  );
  const textNodes = [];

  let textNode = iterator.nextNode();
  while (textNode) {
    textNodes.push(textNode);
    textNode = iterator.nextNode();
  }

  return textNodes;
}

const isTextDivisionNode = node =>
  isSelfClosingNode(node) ||
  (isElementNode(node) && ['SVG'].indexOf(node.tagName.toUpperCase()) !== -1);

const gatherTextNodes = (store, nodes, nodesByBlockMap, blockCompareFunction) =>
  nodes.reduce((textNodes, node) => {
    if (isTextDivisionNode(node)) {
      if (textNodes.length === 0) return [];

      store.push(textNodes);
      return [];
    } else if (blockCompareFunction(node)) {
      if (textNodes.length > 0) store.push(textNodes);

      const nextNodes = nodesByBlockMap.get(node);
      if (!nextNodes) return [];

      nodesByBlockMap.delete(node);
      const gatheredTextNodes = gatherTextNodes(
        store,
        nextNodes,
        nodesByBlockMap,
        blockCompareFunction,
      );
      if (gatheredTextNodes.length > 0) store.push(gatheredTextNodes);

      return [];
    }

    textNodes.push(node);
    return textNodes;
  }, []);

export function getTextNodesDividedByBlock(
  root,
  blockCompareFunction = node => {
    return isElementNode(node) && (isBlockNode(node) || node.tagName === 'A');
  },
) {
  const progressStack = [];
  const pendStack = [];
  const nodesByBlockMap = new Map();

  progressStack.push({
    node: root,
    block: root,
  });

  while (progressStack.length > 0) {
    const poppedData = progressStack.pop();
    const { node, block } = poppedData;
    const { firstChild, nextSibling } = node;
    let nodes = nodesByBlockMap.get(block);
    if (!nodes) {
      nodes = [];
      nodesByBlockMap.set(block, nodes);
    }

    if (
      isTextNode(node) ||
      isTextDivisionNode(node) ||
      (blockCompareFunction(node) && node !== block)
    ) {
      nodes.push(node);
    }

    if (firstChild) {
      progressStack.push({
        node: firstChild,
        block: blockCompareFunction(node) ? node : block,
      });

      if (node !== root && nextSibling) {
        const { parentNode } = nextSibling;
        pendStack.push({
          node: nextSibling,
          block: blockCompareFunction(parentNode) ? parentNode : block,
        });
      }
    } else if (nextSibling) {
      const { parentNode } = nextSibling;
      progressStack.push({
        node: nextSibling,
        block: blockCompareFunction(parentNode) ? parentNode : block,
      });
    } else if (pendStack.length > 0) {
      progressStack.push(pendStack.pop());
    }
  }

  const textNodesDividedByBlock = Array.from(nodesByBlockMap).reduce(
    (arr, [block, nodes]) => {
      if (!nodesByBlockMap.has(block)) return arr;

      const textNodes = gatherTextNodes(
        arr,
        nodes,
        nodesByBlockMap,
        blockCompareFunction,
      );
      if (textNodes.length !== 0) arr.push(textNodes);

      return arr;
    },
    [],
  );

  nodesByBlockMap.clear();
  return textNodesDividedByBlock;
}

export function getTextWithTextBoundaryFromTextNodes(textNodes) {
  return textNodes.reduce(
    (result, textNode) => {
      result.textBoundary.push(result.text.length);
      result.text = `${result.text}${textNode.nodeValue}`;
      return result;
    },
    { text: '', textBoundary: [] },
  );
}
