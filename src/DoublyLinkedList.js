export default class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  add(item) {
    if (this.tail) {
      this.tail.next = item;
      item.previous = this.tail;
      this.tail = item;
    } else {
      this.head = this.tail = item;
    }

    return item;
  }

  remove(item) {
    const { previous, next } = item;

    if (item === this.head && item === this.tail) {
      this.head = this.tail = null;
      return item;
    }

    if (!previous) {
      next.previous = null;
      item.next = null;
      this.head = next;
    } else if (!next) {
      previous.next = null;
      item.previous = null;
      this.tail = previous;
    } else {
      previous.next = next;
      next.previous = previous;
      item.previous = null;
      item.next = null;
    }

    return item;
  }

  replace(newItem, item) {
    const { previous, next } = item;

    if (previous) {
      item.previous = null;
      newItem.previous = previous;
      previous.next = newItem;
    } else {
      this.head = newItem;
    }

    if (next) {
      item.next = null;
      newItem.next = next;
      next.previous = newItem;
    } else {
      this.tail = newItem;
    }

    return newItem;
  }
}
