[![codecov](https://codecov.io/gh/swimyoung/dom-find-and-replace/branch/master/graph/badge.svg)](https://codecov.io/gh/swimyoung/dom-find-and-replace) [![Build Status](https://travis-ci.org/swimyoung/dom-find-and-replace.svg?branch=master)](https://travis-ci.org/swimyoung/dom-find-and-replace)

# DOM find and replace 🔎

Find some text in the dom and replace with what you want.

you can try it!

https://swimyoung.github.io/dom-find-and-replace/

## Getting started

```sh
npm install dom-find-and-replace
```

```js
import domFindAndReplace from 'dom-find-and-replace';

// return: function that recover replacement
const recover = domFindAndReplace(
  document.getElementById('container'), 
  {
    find: 'hello',
    replace: 'hi',
  }
);

// return: html
const html = domFindAndReplace(
  `<div>hello</div>`, 
  {
    find: 'hello',
    replace: 'hi',
  }
);
```

## API

### domFindAndReplace

#### Arguments

- target (`Element` | `string`): an element or HTML string
- params (`object`)
  - flag (`string`): a regular expression flag
  - find (`string`): a regular expression string
  - replace (`string` | `({ offsetText, foundText }) => Node`)

#### Return

- `() => void` | `string`: it returns html string when target is html string otherwise function that you can recover replacement

#### Examples

```js
import domFindAndReplace from 'dom-find-and-replace';

// find 'hello' in id 'container' element and replace it with 'hi'
const recover = domFindAndReplace(document.getElementById('container'), {
  find: 'hello',
  replace: 'hi',
});

// find 'hello' in id 'container' element and wrap with bold element
const recover = domFindAndReplace(document.getElementById('container'), {
  find: 'hello',

  /**
   * @param {object} param
   * @param {string} param.offsetText a part of matched text or whole part
   * @param {string} param.foundText a matched text
   * @return {Node} it replaces a matched text node with a given node
   */
  replace: ({ offsetText, foundText }) => {
    const bold = document.createElement('bold');
    bold.textContent = offsetText;
    return bold;
  },
});

// find link in id 'root' element and make an anchor element
const recover = domFindAndReplace(document.getElementById('root'), {
  flag: 'gi',

  // @see https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url for url matching regular expression
  find:
    'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)',

  replace: ({ offsetText, foundText }) => {
    const anchor = document.createElement('a');
    anchor.textContent = offsetText;
    anchor.setAttribute('href', foundText);
    return anchor;
  },
});
```
