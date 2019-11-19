import { isElementNode } from './node-type';
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
  const recovers = textNodesDividedByBlock.map(textNodes => {
    const { text: oneLineOfText, ranges } = getTextWithRanges(textNodes);
    const regex = new RegExp(find, flag);
    const map = new Map();
    const singlyLinkedList = new SinglyLinkedList<Replacer>();

    let regexpExecResult = regex.exec(oneLineOfText);
    if (!regexpExecResult) {
      return (): void => {};
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

      let copyOfReplaceText = typeof replace === 'string' && replace;
      let copyOfFoundText = typeof replace === 'string' && foundText;
      let slicedReplaceText = '';

      for (let i = 0; i < ranges.length; i++) {
        const {
          textNode,
          range: { start, end },
        } = ranges[i];

        const replacement: Replacement = new Replacement(
          textNode.nodeValue,
          foundText,
        );
        if (
          // regexpStartIndex <= start < regexpEndIndex
          start >= regexpStartIndex &&
          start < regexpEndIndex
        ) {
          replacement.range = {
            start,
            end: end < regexpEndIndex ? end : regexpEndIndex,
          };
        } else if (
          // regexpStartIndex < end <= regexpEndIndex
          end > regexpStartIndex &&
          end <= regexpEndIndex
        ) {
          replacement.range = {
            start: start < regexpStartIndex ? regexpStartIndex : start,
            end,
          };
        } else if (
          // start <= regexpStartIndex < end
          regexpStartIndex >= start &&
          regexpStartIndex < end
        ) {
          replacement.range = {
            start: regexpStartIndex,
            end: end < regexpEndIndex ? end : regexpEndIndex,
          };
        } else if (
          // start < regexpEndIndex <= end
          regexpEndIndex > start &&
          regexpEndIndex <= end
        ) {
          replacement.range = {
            start: start < regexpStartIndex ? regexpStartIndex : start,
            end: regexpEndIndex,
          };
        } else if (start === regexpStartIndex && end === regexpEndIndex) {
          replacement.range = { start, end };
        } else {
          continue;
        }

        // change range to textNode.nodeValue size based range
        replacement.range = {
          start: replacement.range.start - start,
          end: replacement.range.end - start,
        };

        if (typeof replace === 'string') {
          const { range } = replacement;
          slicedReplaceText = copyOfReplaceText.slice(
            0,
            range.end - range.start,
          );
          copyOfReplaceText = copyOfReplaceText.slice(range.end - range.start);
          copyOfFoundText = copyOfFoundText.slice(range.end - range.start);

          // replace text is longer than found text.
          // so put all replace text to last offset text of found text.
          if (!copyOfFoundText && copyOfReplaceText.length > 0) {
            slicedReplaceText = `${slicedReplaceText}${copyOfReplaceText}`;
            copyOfReplaceText = '';
          }
          replacement.replaceFunction = (slicedReplaceText => () =>
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

    // replace
    let replacer = singlyLinkedList.head;
    while (replacer) {
      replacer.replace();
      replacer = replacer.next;
    }

    // recover
    return () => {
      let replacer = singlyLinkedList.head;
      while (replacer) {
        replacer.recover();
        replacer = replacer.next;
      }
    };
  });

  // recover
  return (): void => recovers.forEach(recover => recover());
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
): Recover | string {
  const optionsWithDefault = Object.assign(
    {},
    {
      flag: 'g',
    },
    options,
  );

  if (isElementNode(target as Node)) {
    return withinElement(target as Element, optionsWithDefault);
  } else if (typeof target === 'string') {
    return withinHTML(target, optionsWithDefault);
  }

  return null;
}

export { Recover };
