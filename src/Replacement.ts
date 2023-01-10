import type { Range } from './Range';

interface ReplaceFunction {
  (offsetText: string, foundText: string): Node;
}

class Replacement {
  foundText: string;
  text: string;
  range: Range;
  replaceFunction: ReplaceFunction;

  constructor(text: string, foundText?: string) {
    this.foundText = foundText || '';
    this.text = text;
    this.range = {
      start: 0,
      end: 0,
    };
    this.replaceFunction = (offsetText): Text =>
      document.createTextNode(offsetText);
  }

  replace(): Node | null {
    const { start, end } = this.range;
    if (start === end) {
      return null;
    }

    const offsetText = this.text.slice(start, end);
    return this.replaceFunction(offsetText, this.foundText);
  }
}

export { Replacement, ReplaceFunction, Range };
