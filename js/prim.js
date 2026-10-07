/**
 * Prim's Algorithm Engine with Snapshot Recorder
 * Generates an immutable, step-by-step trace of the execution for visual playback.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const MinHeap = require('./minHeap');
    module.exports = factory(MinHeap);
  } else {
    root.FibreMST = root.FibreMST || {};
    root.FibreMST.runPrimsAlgorithm = factory(root.FibreMST.MinHeap);
  }
})(typeof self !== 'undefined' ? self : this, function (MinHeap) {

  /**
   * Run Prim's algorithm on graph and return execution snapshots
   * @param {Object} graph { nodes: [{id, name, x, y}], edges: [{id, u, v, w}] }
   * @param {string} startNodeId Optional ID of starting node (defaults to first node)
   * @returns {Object} { snapshots, totalCost, mstEdges, isConnected, components }
   */
  function runPrimsAlgorithm(graph, startNodeId) {
    const nodes = graph.nodes || [];
    const edges = graph.edges || [];

    if (nodes.length === 0) {
      return {
        snapshots: [{
          step: 1,
          action: 'finish',
          status: 'done',
          visited: [],
          currentNode: null,
          mstEdges: [],
          queue: [],
          considered: null,
          rejectedEdge: null,
          totalCost: 0,
          message: "The network contains no cities. Add cities to begin.",
          stats: { visitedCount: 0, totalNodes: 0, mstEdgeCount: 0, queueSize: 0 }
        }],
        totalCost: 0,
        mstEdges: [],
        isConnected: true,
        components: []
      };
    }

    // Helper map for node lookup
    const nodeMap = new Map();
    nodes.forEach(n => nodeMap.set(n.id, n));

    const getNodeName = (id) => {
      const node = nodeMap.get(id);
      return node ? (node.name || node.id) : id;
    };

    // Determine start node
    let startId = startNodeId;
    if (!startId || !nodeMap.has(startId)) {
      startId = nodes[0].id;
    }

    // Build undirected adjacency list
    // Each adjacency entry: { neighborId, weight, edgeId, originalU, originalV }
    const adj = new Map();
    nodes.forEach(n => adj.set(n.id, []));

    edges.forEach(e => {
      if (adj.has(e.u) && adj.has(e.v)) {
        adj.get(e.u).push({ neighborId: e.v, weight: e.w, edgeId: e.id, originalU: e.u, originalV: e.v });
        adj.get(e.v).push({ neighborId: e.u, weight: e.w, edgeId: e.id, originalU: e.u, originalV: e.v });
      }
    });

    const snapshots = [];
    const visitedSet = new Set();
    const mstEdges = [];
    const cityOrder = [];
    let totalCost = 0;
    let stepCounter = 1;

    // Priority queue compares edge weight
    const pq = new MinHeap((a, b) => a.w - b.w);

    const defaultLineMap = {
      startVisit: 5,
      pushStartNeighbors: 6,
      popMin: 8,
      skipVisited: 9,
      addToMst: 10,
      pushNeighbors: 13,
      finish: 16
    };

    const makeSnapshot = (action, status, considered, rejectedEdge, message, extra = {}) => {
      snapshots.push({
        step: stepCounter++,
        action: action,
        line: defaultLineMap[action] || 1,
        status: status, // 'start' | 'candidate' | 'considered' | 'added' | 'rejected' | 'done' | 'disconnected'
        visited: Array.from(visitedSet),
        cityOrder: cityOrder.map(item => ({ ...item })),
        currentNode: extra.currentNode || (considered ? considered.v : null),
        mstEdges: [...mstEdges],
        queue: pq.getSortedItems(),
        considered: considered ? { ...considered } : null,
        rejectedEdge: rejectedEdge ? { ...rejectedEdge } : null,
        totalCost: totalCost,
        message: message,
        stats: {
          visitedCount: visitedSet.size,
          totalNodes: nodes.length,
          mstEdgeCount: mstEdges.length,
          queueSize: pq.size()
        }
      });
    };

    // Step 1: Start node selection & initialization
    visitedSet.add(startId);
    cityOrder.push({
      order: 1,
      cityId: startId,
      cityName: getNodeName(startId),
      cableText: "Initial Hub (Start)",
      edgeId: null,
      cableDist: 0,
      cumulativeDist: 0,
      step: 1
    });

    makeSnapshot(
      'startVisit',
      'start',
      null,
      null,
      `Step 1: Commencing Prim's algorithm at initial city #1: ${getNodeName(startId)}. Added to visited set.`,
      { currentNode: startId }
    );

    // Step 2: Push initial edges from start node
    const initialNeighbors = adj.get(startId) || [];
    let addedCount = 0;
    initialNeighbors.forEach(conn => {
      pq.push({
        edgeId: conn.edgeId,
        u: startId,
        v: conn.neighborId,
        w: conn.weight
      });
      addedCount++;
    });

    if (addedCount > 0) {
      makeSnapshot(
        'pushStartNeighbors',
        'candidate',
        null,
        null,
        `Enqueued ${addedCount} candidate optical cable(s) connecting from ${getNodeName(startId)} into Priority Queue.`,
        { currentNode: startId }
      );
    } else {
      makeSnapshot(
        'pushStartNeighbors',
        'candidate',
        null,
        null,
        `Initial city ${getNodeName(startId)} has no connected cables.`,
        { currentNode: startId }
      );
    }

    // Step 3: Main greedy loop
    while (!pq.isEmpty() && visitedSet.size < nodes.length) {
      // Extract cheapest edge
      const candidate = pq.pop();

      // Snapshot: Inspect the candidate edge
      makeSnapshot(
        'popMin',
        'considered',
        candidate,
        null,
        `Popped lowest-distance candidate cable ${getNodeName(candidate.u)} ↔ ${getNodeName(candidate.v)} (${candidate.w} km) from Priority Queue.`,
        { currentNode: candidate.v }
      );

      // Check if target node already in visited set
      if (visitedSet.has(candidate.v)) {
        // Discard edge to prevent cycle
        makeSnapshot(
          'skipVisited',
          'rejected',
          null,
          candidate,
          `City ${getNodeName(candidate.v)} is already connected in the visited network. Cable (${candidate.w} km) is rejected to prevent a loop.`,
          { currentNode: candidate.v }
        );
        continue;
      }

      // Valid cut edge: Add to MST
      visitedSet.add(candidate.v);
      mstEdges.push({
        id: candidate.edgeId,
        u: candidate.u,
        v: candidate.v,
        w: candidate.w
      });
      totalCost += candidate.w;

      cityOrder.push({
        order: visitedSet.size,
        cityId: candidate.v,
        cityName: getNodeName(candidate.v),
        cableText: `${getNodeName(candidate.u)} ↔ ${getNodeName(candidate.v)}`,
        edgeId: candidate.edgeId,
        cableDist: candidate.w,
        cumulativeDist: totalCost,
        step: stepCounter
      });

      makeSnapshot(
        'addToMst',
        'added',
        candidate,
        null,
        `Connected city #${visitedSet.size}: ${getNodeName(candidate.v)} via cable ${getNodeName(candidate.u)} ↔ ${getNodeName(candidate.v)} (${candidate.w} km). Total cable: ${totalCost} km.`,
        { currentNode: candidate.v }
      );

      // Enqueue unvisited neighbors of newly added city
      const newNeighbors = adj.get(candidate.v) || [];
      let newCandidatesCount = 0;
      newNeighbors.forEach(conn => {
        if (!visitedSet.has(conn.neighborId)) {
          pq.push({
            edgeId: conn.edgeId,
            u: candidate.v,
            v: conn.neighborId,
            w: conn.weight
          });
          newCandidatesCount++;
        }
      });

      if (newCandidatesCount > 0) {
        makeSnapshot(
          'pushNeighbors',
          'candidate',
          null,
          null,
          `Enqueued ${newCandidatesCount} new candidate cable(s) leading out from ${getNodeName(candidate.v)}.`,
          { currentNode: candidate.v }
        );
      }
    }

    // Step 4: Final evaluation
    const isConnected = (visitedSet.size === nodes.length);
    if (isConnected) {
      const omittedCount = pq.size();
      const omittedDetails = omittedCount > 0 ?
        ` ${omittedCount} redundant cable(s) remaining in the priority queue were safely omitted to prevent loops.` : '';
      const orderSummary = cityOrder.map(c => `#${c.order} ${c.cityName}`).join(' → ');
      makeSnapshot(
        'finish',
        'done',
        null,
        null,
        `Success! Minimum Spanning Tree formed. All ${nodes.length} cities connected in order: [${orderSummary}]. Total: ${mstEdges.length} cables totaling ${totalCost} km.${omittedDetails}`,
        { currentNode: null }
      );
    } else {
      const unreachableCount = nodes.length - visitedSet.size;
      const unreachableNames = nodes.filter(n => !visitedSet.has(n.id)).map(n => getNodeName(n.id)).join(', ');
      makeSnapshot(
        'finish',
        'disconnected',
        null,
        null,
        `Priority Queue exhausted! Network is disconnected. ${unreachableCount} cities unreachable from ${getNodeName(startId)}: [${unreachableNames}]. Spanning tree covers current island with ${totalCost} km.`,
        { currentNode: null }
      );
    }

    // Compute all connected components for diagnostic reporting
    const components = findConnectedComponents(nodes, edges);

    return {
      snapshots,
      totalCost,
      mstEdges,
      isConnected,
      components,
      startNodeId: startId,
      finalCityOrder: cityOrder.map(item => ({ ...item }))
    };
  }

  function findConnectedComponents(nodes, edges) {
    const adj = new Map();
    nodes.forEach(n => adj.set(n.id, []));
    edges.forEach(e => {
      if (adj.has(e.u) && adj.has(e.v)) {
        adj.get(e.u).push(e.v);
        adj.get(e.v).push(e.u);
      }
    });

    const visited = new Set();
    const components = [];

    nodes.forEach(n => {
      if (!visited.has(n.id)) {
        const component = [];
        const queue = [n.id];
        visited.add(n.id);
        while (queue.length > 0) {
          const curr = queue.shift();
          component.push(curr);
          (adj.get(curr) || []).forEach(neighbor => {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push(neighbor);
            }
          });
        }
        components.push(component);
      }
    });

    return components;
  }

  return runPrimsAlgorithm;
});

