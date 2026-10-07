/**
 * MinHeap (Priority Queue) Implementation
 * Used by Prim's Algorithm to greedily extract the lowest-weight candidate edge.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FibreMST = root.FibreMST || {};
    root.FibreMST.MinHeap = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  class MinHeap {
    constructor(compareFn) {
      this.heap = [];
      this.compare = compareFn || ((a, b) => a.w - b.w);
    }

    size() {
      return this.heap.length;
    }

    isEmpty() {
      return this.heap.length === 0;
    }

    peek() {
      return this.heap.length > 0 ? this.heap[0] : null;
    }

    push(item) {
      this.heap.push(item);
      this._bubbleUp(this.heap.length - 1);
    }

    pop() {
      if (this.isEmpty()) return null;
      const top = this.heap[0];
      const bottom = this.heap.pop();
      if (this.heap.length > 0) {
        this.heap[0] = bottom;
        this._sinkDown(0);
      }
      return top;
    }

    /**
     * Returns a copy of the items sorted by priority (lowest weight first)
     * Useful for displaying the live priority queue cleanly in the UI.
     */
    getSortedItems() {
      return [...this.heap].sort(this.compare);
    }

    toArray() {
      return [...this.heap];
    }

    _bubbleUp(index) {
      while (index > 0) {
        const parentIndex = Math.floor((index - 1) / 2);
        if (this.compare(this.heap[index], this.heap[parentIndex]) < 0) {
          const temp = this.heap[index];
          this.heap[index] = this.heap[parentIndex];
          this.heap[parentIndex] = temp;
          index = parentIndex;
        } else {
          break;
        }
      }
    }

    _sinkDown(index) {
      const length = this.heap.length;
      while (true) {
        const leftChild = 2 * index + 1;
        const rightChild = 2 * index + 2;
        let smallest = index;

        if (leftChild < length && this.compare(this.heap[leftChild], this.heap[smallest]) < 0) {
          smallest = leftChild;
        }

        if (rightChild < length && this.compare(this.heap[rightChild], this.heap[smallest]) < 0) {
          smallest = rightChild;
        }

        if (smallest !== index) {
          const temp = this.heap[index];
          this.heap[index] = this.heap[smallest];
          this.heap[smallest] = temp;
          index = smallest;
        } else {
          break;
        }
      }
    }
  }

  return MinHeap;
});

