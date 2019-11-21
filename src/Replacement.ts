import { Range } from './Range';

interface ReplaceFunction {
  (offsetText: string, foundText: string): Node;
}

class Replacement {
  foundText: string;
  text: string;
  range: Range;
  replaceFunction: ReplaceFunction;

  constructor(text: string, foundText?: string) {
    this.foundText = foundText;
    this.text = text;
    this.replaceFunction = offsetText => document.createTextNode(offsetText);
  }

  replace(): Node {
    const { start, end } = this.range;
    if (start === end) {
      return null;
    }

    const offsetText = this.text.slice(start, end);
    return this.replaceFunction(offsetText, this.foundText) as Node;
  }
}

export { Replacement, ReplaceFunction, Range };
