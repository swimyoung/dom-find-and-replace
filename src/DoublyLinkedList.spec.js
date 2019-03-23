import DoublyLinkedList from './DoublyLinkedList';

describe('DoublyLinkedList', () => {
  it('should create an instance', () => {
    const list = new DoublyLinkedList();
    expect(list).not.toBeNull();
    expect(list).toBeInstanceOf(DoublyLinkedList);
  });

  it('should add a item', () => {
    const list = new DoublyLinkedList();
    const A = { data: 'A' };
    const B = { data: 'B' };

    list.add(A);
    list.add(B);

    expect(list.head).toBe(A);
    expect(list.head.next).toBe(B);
  });

  describe('remove', () => {
    let list;
    let A;
    let B;
    let C;
    beforeEach(() => {
      list = new DoublyLinkedList();
      A = { data: 'A' };
      B = { data: 'B' };
      C = { data: 'C' };
      list.add(A);
      list.add(B);
      list.add(C);
    });

    it('should remove head', () => {
      list.remove(A);

      expect(list.head).toBe(B);
      expect(list.head.next).toBe(C);

      expect(list.tail).toBe(C);
      expect(list.tail.previous).toBe(B);
    });

    it('should remove middle item', () => {
      list.remove(B);

      expect(list.head).toBe(A);
      expect(list.head.next).toBe(C);

      expect(list.tail).toBe(C);
      expect(list.tail.previous).toBe(A);
    });

    it('should remove tail', () => {
      list.remove(C);

      expect(list.head).toBe(A);
      expect(list.head.next).toBe(B);

      expect(list.tail).toBe(B);
      expect(list.tail.previous).toBe(A);
    });

    it('should remove last item', () => {
      list.remove(A);
      list.remove(B);
      list.remove(C);

      expect(list.head).toBe(null);
      expect(list.tail).toBe(null);
    });
  });

  it('should replace a item', () => {
    const list = new DoublyLinkedList();
    const A = { data: 'A' };
    const B = { data: 'B' };
    const C = { data: 'C' };
    const D = { data: 'D' };
    const E = { data: 'E' };
    const F = { data: 'F' };

    list.add(A);
    list.add(B);
    list.add(C);

    list.replace(D, A);
    expect(list.head).toBe(D);
    expect(list.head.next).toBe(B);
    expect(list.tail).toBe(C);
    expect(list.tail.previous).toBe(B);

    list.replace(E, B);
    expect(list.head).toBe(D);
    expect(list.head.next).toBe(E);
    expect(list.tail).toBe(C);
    expect(list.tail.previous).toBe(E);

    list.replace(F, C);
    expect(list.head).toBe(D);
    expect(list.head.next).toBe(E);
    expect(list.tail).toBe(F);
    expect(list.tail.previous).toBe(E);
  });
});
