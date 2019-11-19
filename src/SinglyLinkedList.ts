interface SinglyLinkedListNode {
  next: SinglyLinkedListNode;
}

class SinglyLinkedList<T extends SinglyLinkedListNode> {
  head: T;
  tail: T;

  constructor() {
    this.head = null;
    this.tail = null;
  }

  add(node: T) {
    if (!this.head) {
      this.head = this.tail = node;
    } else if (
      // avoid circular link
      this.head !== node
    ) {
      this.tail.next = node;
      this.tail = node;
    }
  }
}

export { SinglyLinkedList, SinglyLinkedListNode };
