import _ from 'lodash';
import { isElementNode } from './node-type';
import Finder from './Finder';

export default function findAndReplace(target, options) {
  if (isElementNode(target)) {
    return findAndReplaceAtElement(target, options);
  } else if (_.isString(target)) {
    return findAndReplaceAtHTML(target, options);
  } else {
    return null;
  }
}

function findAndReplaceAtHTML(html, options) {
  const element = document.createElement('div');
  element.innerHTML = html;

  findAndReplaceAtElement(element, options);
  return element.innerHTML;
}

function findAndReplaceAtElement(element, { flag, find, replace }) {
  const finder = new Finder(element);
  finder.replace(finder.find(find, flag), replace);

  return;
}
