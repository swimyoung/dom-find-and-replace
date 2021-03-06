import { Replacement } from './Replacement';
import { SinglyLinkedListNode } from './SinglyLinkedList';

class Replacer implements SinglyLinkedListNode {
  next: Replacer | null = null;
  private textNode: Text;
  private replacements: Replacement[] = [];
  private replacedNodes: Node[] = [];

  constructor(textNode: Text) {
    this.textNode = textNode;
  }

  addReplacement(replacement: Replacement): void {
    if (this.replacements.length === 0) {
      if (replacement.range.start > 0) {
        const front = new Replacement(this.textNode.nodeValue as string);
        front.range = { start: 0, end: replacement.range.start };
        this.replacements.push(front);
      }
    } else {
      const last = this.replacements[this.replacements.length - 1];
      if (replacement.range.start - last.range.end > 0) {
        const middle = new Replacement(this.textNode.nodeValue as string);
        middle.range = {
          start: last.range.end,
          end: replacement.range.start,
        };
        this.replacements.push(middle);
      } else if (replacement.range.start - last.range.end < 0) {
        throw `Can't add replacement if replacement.range.start is less than last added replacement.range.end`;
      }
    }

    this.replacements.push(replacement);
  }

  replace(): void {
    const last = this.replacements[this.replacements.length - 1];
    const additionalReplacements = [];

    if (last.range.end < (this.textNode.nodeValue as string).length) {
      const rear = new Replacement(this.textNode.nodeValue as string);
      rear.range = {
        start: last.range.end,
        end: (this.textNode.nodeValue as string).length,
      };
      additionalReplacements.push(rear);
    }

    const replacedNodes = this.replacements
      .concat(additionalReplacements)
      .reduce((nodes: Node[], replacement) => {
        const node = replacement.replace();
        if (!node) {
          return nodes;
        }

        nodes.push(node);
        return nodes;
      }, []);
    this.replacedNodes = replacedNodes;

    if (!this.textNode.parentNode) {
      // can't replace
      return;
    }

    this.textNode.parentNode.replaceChild(
      replacedNodes.reduce((fragment, replacedNode) => {
        fragment.appendChild(replacedNode);
        return fragment;
      }, document.createDocumentFragment()),
      this.textNode,
    );
  }

  recover(): void {
    let recovered = false;

    for (let i = 0; i < this.replacedNodes.length; i++) {
      const replacedNode = this.replacedNodes[i];
      try {
        const { parentNode } = replacedNode;
        if (!parentNode) {
          continue;
        }

        if (!recovered) {
          parentNode.replaceChild(this.textNode, replacedNode);
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
  }
}

export { Replacer };
