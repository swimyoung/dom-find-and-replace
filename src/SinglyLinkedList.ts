interface SinglyLinkedListNode {
  next: SinglyLinkedListNode | null;
}

class SinglyLinkedList<T extends SinglyLinkedListNode> {
  head: T | null = null;
  tail: T | null = null;

  add(node: T): void {
    if (!this.head) {
      this.head = this.tail = node;
    } else if (this.head !== node && this.tail) {
      this.tail.next = node;
      this.tail = node;
    }
  }
}

export { SinglyLinkedList, SinglyLinkedListNode };
