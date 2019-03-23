export default class TextNodeRange {
  constructor(param) {
    Object.assign(
      this,
      {
        textNode: null,
        startOffset: -1,
        endOffset: -1,
        isModified: false,
        isDirty: false,
        next: null,
        previous: null,
        nextVersion: null,
        previousVersion: null,
      },
      param,
    );
  }

  split() {
    const { nodeValue: text } = this.textNode;

    return this.startOffset === this.endOffset
      ? [
          document.createTextNode(text.slice(0, this.startOffset)),
          document.createTextNode(text.slice(this.startOffset)),
        ]
      : [
          document.createTextNode(text.slice(0, this.startOffset)),
          document.createTextNode(text.slice(this.startOffset, this.endOffset)),
          document.createTextNode(text.slice(this.endOffset)),
        ];
  }

  isExclusiveOffset(offset) {
    return offset <= this.startOffset || offset >= this.endOffset;
  }

  isEqual(textNodeRange) {
    return (
      this.textNode === textNodeRange.textNode &&
      this.startOffset === textNodeRange.startOffset &&
      this.endOffset === textNodeRange.endOffset
    );
  }
}
