import { isElementNode } from './node-type';
import { getTextNodesDividedByBlock, getTextWithTextRanges } from './node-text';

export default function findAndReplace(target, options = {}) {
  const optionsWithDefault = Object.assign(
    {},
    {
      flag: 'g',
    },
    options,
  );

  if (isElementNode(target)) {
    return withinElement(target, optionsWithDefault);
  } else if (typeof target === 'string') {
    return withinHTML(target, optionsWithDefault);
  } else {
    return null;
  }
}

function withinHTML(html, options) {
  const element = document.createElement('div');
  element.innerHTML = html;
  withinElement(element, options);
  return element.innerHTML;
}

function withinElement(element, { flag, find, replace }) {
  const textNodesDividedByBlock = getTextNodesDividedByBlock(element);

  // find and replace line by line
  const recovers = textNodesDividedByBlock.map(textNodes => {
    const { text: oneLineOfTexts, ranges } = getTextWithTextRanges(textNodes);
    const regex = new RegExp(find, flag);
    const weakMap = new WeakMap();
    let head;
    let tail;

    let regexpExecResult = regex.exec(oneLineOfTexts);
    if (!regexpExecResult) {
      return () => {};
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

        let replacer;
        if (
          // startIndex <= start < endIndex
          start >= startIndex &&
          start < endIndex
        ) {
          replacer = {
            range: {
              start,
              end: end < endIndex ? end : endIndex,
            },
          };
        } else if (
          // startIndex < end <= endIndex
          end > startIndex &&
          end <= endIndex
        ) {
          replacer = {
            range: {
              start: start < startIndex ? startIndex : start,
              end: end,
            },
          };
        } else if (
          // start <= startIndex < end
          startIndex >= start &&
          startIndex < end
        ) {
          replacer = {
            range: {
              start: startIndex,
              end: end < endIndex ? end : endIndex,
            },
          };
        } else if (
          // start < endIndex <= end
          endIndex > start &&
          endIndex <= end
        ) {
          replacer = {
            range: {
              start: start < startIndex ? startIndex : start,
              end: endIndex,
            },
          };
        } else if (start === startIndex && end === endIndex) {
          replacer = {
            range: { start, end },
          };
        }

        if (replacer) {
          const rangeStart = replacer.range.start - start;
          const rangeEnd = replacer.range.end - start;

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
          }

          // add additional data and mutate
          Object.assign(replacer, {
            foundText,
            range: {
              start: rangeStart,
              end: rangeEnd,
            },
            replace:
              typeof replace === 'string'
                ? (slicedReplaceText => () =>
                    document.createTextNode(slicedReplaceText))(
                    slicedReplaceText,
                  )
                : replace,
          });

          let unitOfReplace;
          if (weakMap.has(textNode)) {
            unitOfReplace = weakMap.get(textNode);
          } else {
            unitOfReplace = {
              replacedNodes: [],
              textNode,
              replacers: [],
            };
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
    let unitOfReplace = head;
    while (unitOfReplace) {
      const { replacers, textNode } = unitOfReplace;
      const { nodeValue: text } = textNode;
      const arr = [];

      // order text node based on range
      arr.push({
        range: { start: 0, end: replacers[0].range.start },
        replace: ({ offsetText }) => document.createTextNode(offsetText),
      });
      let previousReplacer;
      for (let i = 0; i < replacers.length; i++) {
        const replacer = replacers[i];
        if (
          previousReplacer &&
          previousReplacer.range.end !== replacer.range.start
        ) {
          arr.push({
            range: {
              start: previousReplacer.range.end,
              end: replacer.range.start,
            },
            replace: ({ offsetText }) => document.createTextNode(offsetText),
          });
        }
        arr.push(replacer);
        previousReplacer = replacer;
      }
      arr.push({
        range: {
          start: replacers[replacers.length - 1].range.end,
          end: text.length,
        },
        replace: ({ offsetText }) => document.createTextNode(offsetText),
      });

      // split text node
      const nodes = arr.reduce(
        (nodes, { range: { start, end }, replace, foundText }) => {
          const offsetText = text.slice(start, end);
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
      unitOfReplace.replacedNodes = nodes;
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
  return () => recovers.forEach(recover => recover());
}
