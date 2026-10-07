/**
 * Multilingual Code Snippets for Prim's Algorithm
 * With line numbers and semantic mapping for synchronized step tracing.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FibreMST = root.FibreMST || {};
    root.FibreMST.codeSnippets = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    js: {
      name: "JavaScript",
      ext: "js",
      lines: [
        "function primsMST(graph, startNode) {",
        "  const visited = new Set();",
        "  const mstEdges = [];",
        "  const pq = new MinPriorityQueue({ priority: e => e.w });",
        "  visited.add(startNode);",
        "  for (const edge of graph.neighbors(startNode)) pq.push(edge);",
        "  while (!pq.isEmpty() && visited.size() < graph.nodeCount) {",
        "    const edge = pq.pop(); // pop cheapest candidate cable",
        "    if (visited.has(edge.v)) continue; // skip: cycle detected",
        "    mstEdges.push(edge);",
        "    visited.add(edge.v);",
        "    for (const next of graph.neighbors(edge.v)) {",
        "      if (!visited.has(next.v)) pq.push(next);",
        "    }",
        "  }",
        "  return { mstEdges, totalCost: mstEdges.reduce((s, e) => s + e.w, 0) };",
        "}"
      ],
      lineMap: {
        init: 2,
        startVisit: 5,
        pushStartNeighbors: 6,
        whileCheck: 7,
        popMin: 8,
        skipVisited: 9,
        addToMst: 10,
        markVisited: 11,
        pushNeighbors: 13,
        finish: 16
      }
    },

    python: {
      name: "Python 3",
      ext: "py",
      lines: [
        "import heapq",
        "",
        "def prims_mst(graph, start_node):",
        "    visited = set([start_node])",
        "    mst_edges = []",
        "    # priority queue stores tuples: (weight, u, v)",
        "    pq = [(w, start_node, v) for v, w in graph[start_node]]",
        "    heapq.heapify(pq)",
        "    while pq and len(visited) < len(graph):",
        "        w, u, v = heapq.heappop(pq) # cheapest cable",
        "        if v in visited: continue # cycle prevention",
        "        mst_edges.append((u, v, w))",
        "        visited.add(v)",
        "        for next_v, next_w in graph[v]:",
        "            if next_v not in visited:",
        "                heapq.heappush(pq, (next_w, v, next_v))",
        "    return mst_edges, sum(w for _, _, w in mst_edges)"
      ],
      lineMap: {
        init: 4,
        startVisit: 4,
        pushStartNeighbors: 7,
        whileCheck: 9,
        popMin: 10,
        skipVisited: 11,
        addToMst: 12,
        markVisited: 13,
        pushNeighbors: 16,
        finish: 17
      }
    },

    cpp: {
      name: "C++ (STL)",
      ext: "cpp",
      lines: [
        "#include <vector>",
        "#include <queue>",
        "#include <unordered_set>",
        "using namespace std;",
        "",
        "MSTResult primsMST(const Graph& graph, int startNode) {",
        "  unordered_set<int> visited = {startNode};",
        "  vector<Edge> mstEdges; int totalCost = 0;",
        "  priority_queue<Edge, vector<Edge>, greater<Edge>> pq;",
        "  for (auto& edge : graph.adj[startNode]) pq.push(edge);",
        "  while (!pq.empty() && visited.size() < graph.numNodes) {",
        "    Edge edge = pq.top(); pq.pop(); // pop cheapest cable",
        "    if (visited.count(edge.v)) continue; // skip cycle",
        "    mstEdges.push_back(edge); totalCost += edge.w; ",
        "    visited.insert(edge.v);",
        "    for (auto& next : graph.adj[edge.v]) {",
        "      if (!visited.count(next.v)) pq.push(next);",
        "    }",
        "  }",
        "  return {mstEdges, totalCost};",
        "}"
      ],
      lineMap: {
        init: 7,
        startVisit: 7,
        pushStartNeighbors: 10,
        whileCheck: 11,
        popMin: 12,
        skipVisited: 13,
        addToMst: 14,
        markVisited: 15,
        pushNeighbors: 17,
        finish: 20
      }
    },

    java: {
      name: "Java",
      ext: "java",
      lines: [
        "public static MSTResult primsMST(Graph graph, int startNode) {",
        "    Set<Integer> visited = new HashSet<>();",
        "    List<Edge> mstEdges = new ArrayList<>();",
        "    PriorityQueue<Edge> pq = new PriorityQueue<>(Comparator.comparingInt(e -> e.w));",
        "    visited.add(startNode);",
        "    pq.addAll(graph.getEdges(startNode));",
        "    while (!pq.isEmpty() && visited.size() < graph.nodeCount()) {",
        "        Edge edge = pq.poll(); // extract cheapest cable",
        "        if (visited.contains(edge.v)) continue; // cycle guard",
        "        mstEdges.add(edge);",
        "        visited.add(edge.v);",
        "        for (Edge next : graph.getEdges(edge.v)) {",
        "            if (!visited.contains(next.v)) pq.add(next);",
        "        }",
        "    }",
        "    return new MSTResult(mstEdges);",
        "}"
      ],
      lineMap: {
        init: 2,
        startVisit: 5,
        pushStartNeighbors: 6,
        whileCheck: 7,
        popMin: 8,
        skipVisited: 9,
        addToMst: 10,
        markVisited: 11,
        pushNeighbors: 13,
        finish: 16
      }
    }
  };
});
