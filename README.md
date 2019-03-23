# DOM find and replace

Find some text in the dom and replace with what you want

## Getting started

```sh
npm install dom-find-and-replace
```

```js
import findAndReplace from 'dom-find-and-replace';

findAndReplace(document.getElementById('container'), {
  find: 'hello',
  replace: 'hi',
});

// return value: '<div>hi</div>'
findAndReplace(`<div>hello</div>`, {
  find: 'hello',
  replace: 'hi',
});
```

### findAndReplace

#### Arguments

- target (Element | string): an element or HTML string
- options (object)
- options.flag (string): a regular expression flag
- options.find (string): a regular expression string
- options.replace (string | function)

#### Return

- undefined | string: return html string when target is html string.

#### Examples

```js
import findAndReplace from 'dom-find-and-replace';

// find 'hello' in id 'container' element and replace it with 'hi'
findAndReplace(document.getElementById('container'), {
  find: 'hello',
  replace: 'hi',
});

// find 'hello' in id 'container' element and wrap with bold element
findAndReplace(document.getElementById('container'), {
  find: 'hello',

  /**
   * @param {object} param
   * @param {string} param.offsetText regular expression matching text.
   *  It might be part of matching text or whole part.
   * @param {string} param.offsetNode regular expression matching text node.
   *  It might be part of matching text node or whole part.
   * @param {RegExpExecArray} param.regExpExecArray regular expression exec's result of
   *  matching text @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
   * @return {string|Node} it will replace matching part of text node with string(HTML) or node
   */
  replace: ({ offsetText, offsetNode, regExpExecArray }) => {
    return `<b>${offsetText}</b>`;
  },
});
```

```js
import findAndReplace from 'dom-find-and-replace';

// find link in id 'root' element and make an anchor element
findAndReplace(document.getElementById('root'), {
  flag: 'gi',

  // @see https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url for url matching regular expression
  find:
    'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)',

  replace: ({ offsetText, regExpExecArray }) => {
    return `<a href="${regExpExecArray[0]}">${offsetText}</a>`;
  },
});
```
