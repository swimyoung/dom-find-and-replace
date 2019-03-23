import _ from 'lodash';
import DoublyLinkedList from './DoublyLinkedList';
import TextNodeRange from './TextNodeRange';
import {
  getTextWithTextBoundaryFromTextNodes,
  getTextNodesDividedByBlock,
} from './node-text';
import { isElementNode, isTextNode } from './node-type';

export default class Finder {
  constructor(el) {
    if (!el) throw new Error('Target element is required');

    this.el = el;
    this.textNodeRangeMap = new WeakMap();
  }

  addToTextNodeRangeMap(textNodeRange) {
    const { textNode } = textNodeRange;
    let list = this.textNodeRangeMap.get(textNode);

    if (!list) {
      list = new DoublyLinkedList();
      this.textNodeRangeMap.set(textNode, list);
    }
    list.add(textNodeRange);

    return textNodeRange;
  }

  find(keyword, flag = 'g') {
    if (!keyword) return [];

    return getTextNodesDividedByBlock(this.el).reduce(
      (arr, textNodes) => [
        ...arr,
        ...this.findMatches(keyword, flag, textNodes),
      ],
      [],
    );
  }

  findMatches(keyword, flag, textNodes) {
    const matches = [];
    const regex = new RegExp(keyword, flag);
    const { text, textBoundary } = getTextWithTextBoundaryFromTextNodes(
      textNodes,
    );

    let regExpExecArray = regex.exec(text);
    if (!regExpExecArray) return [];

    while (regExpExecArray) {
      // Avoid zero length matches
      if (!regExpExecArray[0]) return [];

      const match = {
        keyword,
        regExpExecArray,
        textNodeRanges: [],
      };
      matches.push(match);

      const startIndexOfMatchedText = regExpExecArray.index;
      const endIndexOfMatchedText =
        startIndexOfMatchedText + regExpExecArray[0].length;

      let startIndex = _.sortedLastIndex(textBoundary, startIndexOfMatchedText);
      startIndex =
        textBoundary[startIndex] === startIndexOfMatchedText
          ? startIndex
          : startIndex - 1 < 0
          ? 0
          : startIndex - 1;

      let endIndex = _.sortedIndex(textBoundary, endIndexOfMatchedText) - 1;
      endIndex = endIndex !== -1 ? endIndex : 0;

      const startTextNode = textNodes[startIndex];
      const startOffset = startIndexOfMatchedText - textBoundary[startIndex];
      const endTextNode = textNodes[endIndex];
      const endOffset = endIndexOfMatchedText - textBoundary[endIndex];

      regExpExecArray = regex.exec(text);

      let textNodeRange;
      if (startTextNode === endTextNode) {
        textNodeRange = new TextNodeRange({
          textNode: startTextNode,
          startOffset,
          endOffset,
        });
        match.textNodeRanges.push(textNodeRange);
        this.addToTextNodeRangeMap(textNodeRange);
        continue;
      }

      textNodeRange = new TextNodeRange({
        textNode: startTextNode,
        startOffset,
        endOffset: startTextNode.nodeValue.length,
      });
      match.textNodeRanges.push(textNodeRange);
      this.addToTextNodeRangeMap(textNodeRange);

      for (let index = startIndex + 1; index < endIndex; index++) {
        const node = textNodes[index];
        const { nodeValue } = node;
        if (nodeValue.length === 0) continue;

        textNodeRange = new TextNodeRange({
          textNode: node,
          startOffset: 0,
          endOffset: nodeValue.length,
        });
        match.textNodeRanges.push(textNodeRange);
        this.addToTextNodeRangeMap(textNodeRange);
      }

      textNodeRange = new TextNodeRange({
        textNode: endTextNode,
        startOffset: 0,
        endOffset,
      });
      match.textNodeRanges.push(textNodeRange);
      this.addToTextNodeRangeMap(textNodeRange);
    }

    return matches;
  }

  replace(matches, textOrReplaceFunc) {
    if (_.isString(textOrReplaceFunc)) {
      matches.forEach(match => {
        const len = match.textNodeRanges.length;
        let text = textOrReplaceFunc;

        match.textNodeRanges.forEach((textNodeRange, index) => {
          this.modify(
            textNodeRange,
            ({ offsetText }) => {
              const textNode = document.createTextNode('');
              textNode.nodeValue = text.slice(0, offsetText.length);
              text = text.slice(offsetText.length);

              if (index + 1 === len && text.length !== 0) {
                textNode.nodeValue += text;
              }

              return textNode;
            },
            match.regExpExecArray,
          );
        });
      });

      return;
    }

    matches.forEach(({ textNodeRanges, regExpExecArray }) =>
      textNodeRanges.forEach(textNodeRange =>
        this.modify(textNodeRange, textOrReplaceFunc, regExpExecArray),
      ),
    );
  }

  modify(textNodeRange, textOrReplaceFunc, regExpExecArray) {
    while (textNodeRange.nextVersion) {
      textNodeRange = textNodeRange.nextVersion;
    }

    if (textNodeRange.isDirty || textNodeRange.isModified) {
      return textNodeRange;
    }

    const [first, middle, last] = textNodeRange.split();

    let current = textNodeRange;
    while (current.previous) {
      current = current.previous;
    }
    
    while (current) {
      const { next } = current;
      if (current === textNodeRange) {
        current = next;
        continue;
      }

      if (
        !textNodeRange.isExclusiveOffset(current.startOffset) ||
        !textNodeRange.isExclusiveOffset(current.endOffset) ||
        textNodeRange.isEqual(current)
      ) {
        current.isDirty = true;
        current = next;
        continue;
      }

      if (current.endOffset <= textNodeRange.startOffset) {
        const newTextNodeRange = new TextNodeRange({
          textNode: first,
          startOffset: current.startOffset,
          endOffset: current.endOffset,
        });
        newTextNodeRange.previousVersion = current;
        current.nextVersion = newTextNodeRange;
        this.addToTextNodeRangeMap(newTextNodeRange);
      } else if (current.endOffset >= textNodeRange.endOffset) {
        const newTextNodeRange = new TextNodeRange({
          textNode: last,
          startOffset: current.startOffset - textNodeRange.endOffset,
          endOffset: current.endOffset - textNodeRange.endOffset,
        });
        newTextNodeRange.previousVersion = current;
        current.nextVersion = newTextNodeRange;
        this.addToTextNodeRangeMap(newTextNodeRange);
      }

      current = next;
    }

    const result = _.isFunction(textOrReplaceFunc)
      ? textOrReplaceFunc({
          offsetText: middle.nodeValue,
          offsetNode: middle,
          regExpExecArray,
        })
      : textOrReplaceFunc;
    const fragment = document.createDocumentFragment();

    let node;
    fragment.appendChild(first);
    if (_.isString(result)) {
      node = document.createElement('span');
      node.innerHTML = result;
      while (node.firstChild) fragment.appendChild(node.firstChild);
    } else if (isElementNode(result) || isTextNode(result)) {
      node = result;
      fragment.appendChild(result);
    }
    fragment.appendChild(last);

    textNodeRange.isModified = true;
    textNodeRange.modifiedNode = node;
    textNodeRange.textNode.parentNode.replaceChild(
      fragment,
      textNodeRange.textNode,
    );
    return textNodeRange;
  }
}
