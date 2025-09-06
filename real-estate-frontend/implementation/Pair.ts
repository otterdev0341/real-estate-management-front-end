export default class Pair<L, R> {
  private readonly left: L;
  private readonly right: R;

  constructor(left: L, right: R) {
    this.left = left;
    this.right = right;
  }

  getLeft(): L {
    return this.left;
  }

  getRight(): R {
    return this.right;
  }
}