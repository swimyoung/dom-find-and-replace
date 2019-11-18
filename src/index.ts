import { isElementNode } from './node-type';
import { getTextNodesDividedByBlock, getTextWithRanges } from './node-text';
import Replacer, { ReplaceFunction } from './Replacer';
import UnitOfReplace from './UnitOfReplace';

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
    const { text: oneLineOfTexts, ranges } = getTextWithRanges(textNodes);
    const regex = new RegExp(find, flag);
    const weakMap = new WeakMap();
    let head: UnitOfReplace;
    let tail: UnitOfReplace;

    let regexpExecResult = regex.exec(oneLineOfTexts);
    if (!regexpExecResult) {
      return (): void => {};
    }

    // find
    while (regexpExecResult) {
      // Avoid zero length matches
      if (!regexpExecResult[0]) {
        break;
      }

      const { index: startIndex } = regexpExecResult;
      const [foundText] = regexpExecResult;
      const endIndex = startIndex + foundText.length;

      let copyOfReplaceText = typeof replace === 'string' && replace;
      let copyOfFoundText = typeof replace === 'string' && foundText;
      let slicedReplaceText = '';
      for (let i = 0; i < ranges.length; i++) {
        const {
          textNode,
          range: { start, end },
        } = ranges[i];

        const replacer: Replacer = new Replacer(foundText);
        if (
          // startIndex <= start < endIndex
          start >= startIndex &&
          start < endIndex
        ) {
          replacer.setRange({ start, end: end < endIndex ? end : endIndex });
        } else if (
          // startIndex < end <= endIndex
          end > startIndex &&
          end <= endIndex
        ) {
          replacer.setRange({
            start: start < startIndex ? startIndex : start,
            end: end,
          });
        } else if (
          // start <= startIndex < end
          startIndex >= start &&
          startIndex < end
        ) {
          replacer.setRange({
            start: startIndex,
            end: end < endIndex ? end : endIndex,
          });
        } else if (
          // start < endIndex <= end
          endIndex > start &&
          endIndex <= end
        ) {
          replacer.setRange({
            start: start < startIndex ? startIndex : start,
            end: endIndex,
          });
        } else if (start === startIndex && end === endIndex) {
          replacer.setRange({ start, end });
        }

        if (replacer.range) {
          const rangeStart = replacer.range.start - start;
          const rangeEnd = replacer.range.end - start;
          replacer.setRange({
            start: rangeStart,
            end: rangeEnd,
          });

          if (typeof replace === 'string') {
            slicedReplaceText = copyOfReplaceText.slice(
              0,
              rangeEnd - rangeStart,
            );
            copyOfReplaceText = copyOfReplaceText.slice(rangeEnd - rangeStart);
            copyOfFoundText = copyOfFoundText.slice(rangeEnd - rangeStart);

            // replace text is longer than found text.
            // so put all replace text to last offset text of found text.
            if (!copyOfFoundText && copyOfReplaceText.length > 0) {
              slicedReplaceText = `${slicedReplaceText}${copyOfReplaceText}`;
              copyOfReplaceText = '';
            }
            replacer.setReplace(
              (slicedReplaceText => () =>
                document.createTextNode(slicedReplaceText))(slicedReplaceText),
            );
          } else {
            replacer.setReplace(replace);
          }

          let unitOfReplace: UnitOfReplace;
          if (weakMap.has(textNode)) {
            unitOfReplace = weakMap.get(textNode);
          } else {
            unitOfReplace = new UnitOfReplace(textNode);
            weakMap.set(textNode, unitOfReplace);

            if (!head) {
              head = tail = unitOfReplace;
            } else if (
              // avoid circular link
              head !== unitOfReplace
            ) {
              tail.next = unitOfReplace;
              tail = unitOfReplace;
            }
          }

          unitOfReplace.replacers.push(replacer);
        }
      }

      regexpExecResult = regex.exec(oneLineOfTexts);
    }

    // replace
    let unitOfReplace: UnitOfReplace = head;
    while (unitOfReplace) {
      const { replacers, textNode } = unitOfReplace;
      const arr: Replacer[] = [];

      // order text node based on range
      arr.push(
        new Replacer('')
          .setRange({ start: 0, end: replacers[0].range.start })
          .setReplace(({ offsetText }) => document.createTextNode(offsetText)),
      );
      let previousReplacer;
      for (let i = 0; i < replacers.length; i++) {
        const replacer = replacers[i];
        if (
          previousReplacer &&
          previousReplacer.range.end !== replacer.range.start
        ) {
          arr.push(
            new Replacer('')
              .setRange({
                start: previousReplacer.range.end,
                end: replacer.range.start,
              })
              .setReplace(({ offsetText }) =>
                document.createTextNode(offsetText),
              ),
          );
        }
        arr.push(replacer);
        previousReplacer = replacer;
      }
      arr.push(
        new Replacer('')
          .setRange({
            start: replacers[replacers.length - 1].range.end,
            end: textNode.nodeValue.length,
          })
          .setReplace(({ offsetText }) => document.createTextNode(offsetText)),
      );

      // split text node
      const nodes = arr.reduce(
        (nodes, { range: { start, end }, replace, foundText }) => {
          const offsetText = textNode.nodeValue.slice(start, end);
          // when start and end are the same
          if (!offsetText) {
            return nodes;
          }

          const node = replace({ offsetText, foundText });
          !!node && nodes.push(node);
          return nodes;
        },
        [],
      );
      unitOfReplace.setReplacedNodes(nodes);
      textNode.parentNode.replaceChild(
        nodes.reduce((fragment, node) => {
          fragment.appendChild(node);
          return fragment;
        }, document.createDocumentFragment()),
        textNode,
      );

      unitOfReplace = unitOfReplace.next;
    }

    return () => {
      let unitOfReplace = head;
      while (unitOfReplace) {
        const { replacedNodes, textNode } = unitOfReplace;
        let recovered = false;

        for (let i = 0; i < replacedNodes.length; i++) {
          const replacedNode = replacedNodes[i];
          try {
            const { parentNode } = replacedNode;
            if (!parentNode) {
              continue;
            }

            if (!recovered) {
              parentNode.replaceChild(textNode, replacedNode);
              recovered = true;
            } else {
              parentNode.removeChild(replacedNode);
            }
          } catch (e) {
            console.error(
              `You might have changed dom node so that we can't recover`,
            );
          }
        }

        unitOfReplace = unitOfReplace.next;
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
