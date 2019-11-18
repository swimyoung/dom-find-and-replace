interface Range {
  start: number;
  end: number;
}

interface ReplaceFunction {
  (param: { offsetText: string; foundText: string }): string | Node;
}

export default class Replacer {
  foundText: string;
  range: Range;
  replace: ReplaceFunction;

  constructor(foundText: string) {
    this.foundText = foundText;
  }

  setRange(range: Range): Replacer {
    this.range = range;
    return this;
  }

  setReplace(replace: ReplaceFunction): Replacer {
    this.replace = replace;
    return this;
  }
}

export { Range, ReplaceFunction };
