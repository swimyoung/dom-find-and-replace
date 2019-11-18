import Replacer from './Replacer';

export default class UnitOfReplace {
  textNode: Text;
  replacedNodes: Node[];
  replacers: Replacer[];
  next: UnitOfReplace;

  constructor(textNode: Text) {
    this.textNode = textNode;
    this.replacedNodes = [];
    this.replacers = [];
    this.next = null;
  }

  setReplacedNodes(nodes: Node[]): UnitOfReplace {
    this.replacedNodes = nodes;
    return this;
  }
}
