import { isElementNode } from 'dom-node-type';
import { getTextNodesDividedByBlock, getTextWithRanges } from './node-text';
import { Replacement, ReplaceFunction } from './Replacement';
import { Replacer } from './Replacer';
import { SinglyLinkedList } from './SinglyLinkedList';

interface Options {
  flag?: string;
  find: string;
  replace: string | ReplaceFunction;
}

interface Recover {
  (): void;
}

function withinElement(
  element: Element,
  { flag, find, replace }: Options,
): Recover {
  const textNodesDividedByBlock = getTextNodesDividedByBlock(element);

  // find and replace line by line
  const recovers: Array<() => void | null> = textNodesDividedByBlock.map(
    (textNodes) => {
      const { text: oneLineOfText, ranges } = getTextWithRanges(textNodes);
      const regex = new RegExp(find, flag);
      const map = new Map();
      let singlyLinkedList = new SinglyLinkedList<Replacer>();

      let regexpExecResult = regex.exec(oneLineOfText);
      if (!regexpExecResult) {
        return null;
      }

      // find
      while (regexpExecResult) {
        // Avoid zero length matches
        if (!regexpExecResult[0]) {
          break;
        }

        const { index: regexpStartIndex } = regexpExecResult;
        const [foundText] = regexpExecResult;
        const regexpEndIndex = regexpStartIndex + foundText.length;

        let copyOfReplaceText = typeof replace === 'string' ? replace : '';
        let copyOfFoundText = typeof replace === 'string' ? foundText : '';
        let slicedReplaceText = '';

        for (let i = 0; i < ranges.length; i++) {
          const {
            textNode,
            text,
            range: { start, end },
          } = ranges[i];

          // there isn't overlap between node range and regular expression range
          if (start > regexpEndIndex || end < regexpStartIndex) {
            continue;
          }

          const replacement: Replacement = new Replacement(text, foundText);
          // calculate overlap range between node range and regular expression range
          // and change the result to textNode.nodeValue size based range
          replacement.range = {
            start: Math.max(start, regexpStartIndex) - start,
            end: Math.min(end, regexpEndIndex) - start,
          };

          // make replace function
          if (typeof replace === 'string') {
            const { range } = replacement;
            slicedReplaceText = copyOfReplaceText.slice(
              0,
              range.end - range.start,
            );
            copyOfReplaceText = copyOfReplaceText.slice(
              range.end - range.start,
            );
            copyOfFoundText = copyOfFoundText.slice(range.end - range.start);

            // replace text is longer than found text.
            // put all replace text to last offset text of found text.
            if (!copyOfFoundText && copyOfReplaceText.length > 0) {
              slicedReplaceText = `${slicedReplaceText}${copyOfReplaceText}`;
              copyOfReplaceText = '';
            }
            replacement.replaceFunction = ((slicedReplaceText) => (): Text =>
              document.createTextNode(slicedReplaceText))(slicedReplaceText);
          } else {
            replacement.replaceFunction = replace as ReplaceFunction;
          }

          let replacer: Replacer = map.get(textNode);
          if (!replacer) {
            replacer = new Replacer(textNode);
            singlyLinkedList.add(replacer);
            map.set(textNode, replacer);
          }

          replacer.addReplacement(replacement);
        }

        regexpExecResult = regex.exec(oneLineOfText);
      }
      // remove text node reference
      map.clear();

      // replace
      let replacer = singlyLinkedList.head;
      while (replacer) {
        replacer.replace();
        replacer = replacer.next;
      }

      // recover
      return (): void => {
        let replacer = singlyLinkedList?.head;
        while (replacer) {
          replacer.recover();
          replacer = replacer.next;
        }

        // release linked list memory
        singlyLinkedList = null;
      };
    },
  );

  // recover
  return (): void =>
    recovers.forEach((recover) => {
      recover?.();
    });
}

function withinHTML(html: string, options: Options): string {
  const element = document.createElement('div');
  element.innerHTML = html;
  withinElement(element, options);
  return element.innerHTML;
}

export default function findAndReplace(
  target: Element | string,
  options: Options,
): Recover | string | null {
  const optionsWithDefault = Object.assign(
    {},
    {
      flag: 'g',
    },
    options,
  );

  if (typeof target === 'string') {
    return withinHTML(target, optionsWithDefault);
  } else if (isElementNode(target as Node)) {
    return withinElement(target as Element, optionsWithDefault);
  } else {
    return null;
  }
}

export { findAndReplace, Recover };
