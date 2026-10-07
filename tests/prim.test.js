/**
 * Automated Test Suite for MinHeap and Prim's Algorithm Engine
 * Run with: node tests/prim.test.js
 */
const assert = require('assert');
const MinHeap = require('../js/minHeap');
const runPrimsAlgorithm = require('../js/prim');
const presets = require('../data/presets');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

console.log("=== Running Prim's Algorithm Engine Unit Tests ===\n");

// --- MinHeap Tests ---
console.log("Testing MinHeap Priority Queue:");

test("MinHeap basic push, peek, pop ordering", () => {
  const heap = new MinHeap((a, b) => a.w - b.w);
  assert.strictEqual(heap.isEmpty(), true);
  assert.strictEqual(heap.size(), 0);

  heap.push({ id: 1, w: 20 });
  heap.push({ id: 2, w: 5 });
  heap.push({ id: 3, w: 15 });
  heap.push({ id: 4, w: 3 });
  heap.push({ id: 5, w: 30 });

  assert.strictEqual(heap.size(), 5);
  assert.strictEqual(heap.peek().w, 3);

  assert.strictEqual(heap.pop().w, 3);
  assert.strictEqual(heap.pop().w, 5);
  assert.strictEqual(heap.pop().w, 15);
  assert.strictEqual(heap.pop().w, 20);
  assert.strictEqual(heap.pop().w, 30);
  assert.strictEqual(heap.pop(), null);
  assert.strictEqual(heap.isEmpty(), true);
});

test("MinHeap getSortedItems returns sorted array without modifying heap", () => {
  const heap = new MinHeap((a, b) => a.w - b.w);
  heap.push({ w: 40 });
  heap.push({ w: 10 });
  heap.push({ w: 25 });

  const sorted = heap.getSortedItems();
  assert.deepStrictEqual(sorted.map(x => x.w), [10, 25, 40]);
  assert.strictEqual(heap.size(), 3, "getSortedItems must not mutate original heap");
});

// --- Prim's Algorithm Tests ---
console.log("\nTesting Prim's Algorithm Engine:");

test("Textbook 5-node graph computes correct MST cost", () => {
  const result = runPrimsAlgorithm(presets.small, "A");
  assert.strictEqual(result.isConnected, true);
  assert.strictEqual(result.totalCost, 18);
  assert.strictEqual(result.mstEdges.length, 4); // V - 1 edges
  assert(result.snapshots.length > 5, "Snapshots must be generated");
});

test("Start-node invariance: Total MST cost is identical regardless of starting city", () => {
  const nodeIds = presets.small.nodes.map(n => n.id);
  const baselineCost = 18;

  nodeIds.forEach(startId => {
    const res = runPrimsAlgorithm(presets.small, startId);
    assert.strictEqual(
      res.totalCost,
      baselineCost,
      `Start node ${startId} produced total cost ${res.totalCost}, expected ${baselineCost}`
    );
    assert.strictEqual(res.mstEdges.length, 4);
    assert.strictEqual(res.isConnected, true);
  });
});

test("Kerala Fibre Grid preset solves to valid MST with V-1 edges", () => {
  const result = runPrimsAlgorithm(presets.kerala, "Kochi");
  assert.strictEqual(result.isConnected, true);
  assert.strictEqual(result.mstEdges.length, presets.kerala.nodes.length - 1);
  assert(result.totalCost > 0);

  // Test from another city in Kerala
  const altResult = runPrimsAlgorithm(presets.kerala, "Kannur");
  assert.strictEqual(altResult.totalCost, result.totalCost);
});

test("Disconnected graph detection and component reporting", () => {
  const result = runPrimsAlgorithm(presets.disconnected, "IslandA1");
  assert.strictEqual(result.isConnected, false);
  assert.strictEqual(result.components.length, 2);

  // Check that the last snapshot has status 'disconnected'
  const lastSnapshot = result.snapshots[result.snapshots.length - 1];
  assert.strictEqual(lastSnapshot.status, 'disconnected');
  assert(lastSnapshot.message.includes("unreachable"));
});

test("Cycle prevention: snapshots record rejected edges", () => {
  const result = runPrimsAlgorithm(presets.dense, "X1");
  const rejectedSnapshots = result.snapshots.filter(s => s.status === 'rejected');
  assert(rejectedSnapshots.length > 0, "Dense graph must encounter and reject redundant cycle edges");
  assert(rejectedSnapshots[0].rejectedEdge !== null);
});

test("Single node graph edge case", () => {
  const singleGraph = {
    nodes: [{ id: "Solo", name: "Solo City", x: 100, y: 100 }],
    edges: []
  };
  const result = runPrimsAlgorithm(singleGraph, "Solo");
  assert.strictEqual(result.totalCost, 0);
  assert.strictEqual(result.mstEdges.length, 0);
  assert.strictEqual(result.isConnected, true);
});

test("Equal edge weights graph handled deterministically without errors", () => {
  const triangle = {
    nodes: [
      { id: "1", name: "T1", x: 10, y: 10 },
      { id: "2", name: "T2", x: 20, y: 20 },
      { id: "3", name: "T3", x: 30, y: 30 }
    ],
    edges: [
      { id: "e1", u: "1", v: "2", w: 10 },
      { id: "e2", u: "2", v: "3", w: 10 },
      { id: "e3", u: "3", v: "1", w: 10 }
    ]
  };
  const res = runPrimsAlgorithm(triangle, "1");
  assert.strictEqual(res.totalCost, 20);
  assert.strictEqual(res.mstEdges.length, 2);
  assert.strictEqual(res.isConnected, true);
});

// --- Code Trace Verification Tests ---
console.log("\nTesting Algorithm Code Trace & Snippet Line Mappings:");

const codeSnippets = require('../data/codeSnippets');

test("Algorithm actions have valid line mappings across all 4 programming languages", () => {
  const languages = ['js', 'python', 'cpp', 'java'];
  const expectedActions = ['startVisit', 'pushStartNeighbors', 'popMin', 'skipVisited', 'addToMst', 'pushNeighbors', 'finish'];

  languages.forEach(lang => {
    const snippet = codeSnippets[lang];
    assert(snippet, `Snippet for ${lang} must exist`);
    assert(Array.isArray(snippet.lines) && snippet.lines.length > 0, `${lang} must have code lines`);
    assert(snippet.lineMap, `${lang} must define lineMap`);

    expectedActions.forEach(action => {
      const lineNum = snippet.lineMap[action];
      assert(
        typeof lineNum === 'number',
        `${lang} lineMap must contain action '${action}' as a number (got ${lineNum})`
      );
      assert(
        lineNum >= 1 && lineNum <= snippet.lines.length,
        `${lang} lineMap for '${action}' is line ${lineNum}, out of range (1..${snippet.lines.length})`
      );
    });
  });
});

test("Snapshots generated by Prim's engine contain non-null line and action properties", () => {
  const result = runPrimsAlgorithm(presets.small, "A");
  result.snapshots.forEach((snap, idx) => {
    assert(snap.action, `Snapshot ${idx} must have an action string`);
    assert(typeof snap.line === 'number' && snap.line > 0, `Snapshot ${idx} must have positive line number`);
  });
});

test("City connection sequence (cityOrder) records chronological arrival for all cities", () => {
  const result = runPrimsAlgorithm(presets.medium, "N1");
  assert(Array.isArray(result.finalCityOrder), "finalCityOrder must be an array");
  assert.strictEqual(result.finalCityOrder.length, 8, "Must record all 8 cities in order");

  // First city must be initial hub
  assert.strictEqual(result.finalCityOrder[0].order, 1);
  assert.strictEqual(result.finalCityOrder[0].cityId, "N1");
  assert.strictEqual(result.finalCityOrder[0].cableDist, 0);

  // Each subsequent city must have order = index + 1
  result.finalCityOrder.forEach((entry, idx) => {
    assert.strictEqual(entry.order, idx + 1);
    assert(entry.cityName, "Must have cityName");
    assert(typeof entry.cumulativeDist === 'number', "Must have cumulativeDist");
  });

  // Final snapshot contains full cityOrder
  const lastSnap = result.snapshots[result.snapshots.length - 1];
  assert.strictEqual(lastSnap.cityOrder.length, 8);
  assert(lastSnap.message.includes("Central Metro"), "Finish message must mention order sequence");
});

console.log(`\n========================================`);
console.log(`Results: ${passedTests} / ${totalTests} tests passed.`);
console.log(`========================================\n`);

