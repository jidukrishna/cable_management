/**
 * Storage & Serialization Utilities for Fibre MST
 * Handles LocalStorage persistence, JSON file export/import, and URL hash sharing.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FibreMST = root.FibreMST || {};
    root.FibreMST.storage = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const LOCAL_STORAGE_GRAPH_KEY = 'fibre_mst_saved_graph';
  const LOCAL_STORAGE_QUIZ_KEY = 'fibre_mst_quiz_score';
  const LOCAL_STORAGE_COST_KEY = 'fibre_mst_cost_per_km';

  function saveGraphToLocalStorage(graph) {
    try {
      localStorage.setItem(LOCAL_STORAGE_GRAPH_KEY, JSON.stringify(graph));
      return true;
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
      return false;
    }
  }

  function loadGraphFromLocalStorage() {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_GRAPH_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
      return null;
    }
  }

  function saveQuizScore(score, total) {
    try {
      const payload = { score, total, date: new Date().toISOString() };
      localStorage.setItem(LOCAL_STORAGE_QUIZ_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      return false;
    }
  }

  function loadQuizScore() {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_QUIZ_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function saveCostPerKm(val) {
    try {
      localStorage.setItem(LOCAL_STORAGE_COST_KEY, String(val));
    } catch (e) {}
  }

  function loadCostPerKm() {
    try {
      const val = localStorage.getItem(LOCAL_STORAGE_COST_KEY);
      return val ? Number(val) : 50000;
    } catch (e) {
      return 50000;
    }
  }

  /**
   * Export graph as a downloadable JSON file
   */
  function exportGraphJSON(graph, filename = 'fibre_network.json') {
    const payload = JSON.stringify({
      title: "Fibre Optic Network MST Graph",
      exportedAt: new Date().toISOString(),
      nodes: graph.nodes || [],
      edges: graph.edges || []
    }, null, 2);

    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Parse and validate imported JSON graph data
   */
  function parseAndValidateGraph(jsonString) {
    let data;
    try {
      data = JSON.parse(jsonString);
    } catch (e) {
      throw new Error("Invalid JSON file format.");
    }

    if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      throw new Error("Invalid graph format: must contain 'nodes' and 'edges' arrays.");
    }

    // Validate nodes
    const validNodes = [];
    const nodeIds = new Set();
    data.nodes.forEach((n, idx) => {
      const id = String(n.id || `node_${idx + 1}`);
      const name = String(n.name || id);
      const x = Number(n.x) || 100 + (idx * 60) % 500;
      const y = Number(n.y) || 100 + (idx * 50) % 400;
      if (!nodeIds.has(id)) {
        nodeIds.add(id);
        validNodes.push({ id, name, x, y });
      }
    });

    // Validate edges
    const validEdges = [];
    data.edges.forEach((e, idx) => {
      const u = String(e.u);
      const v = String(e.v);
      const w = Number(e.w);
      if (nodeIds.has(u) && nodeIds.has(v) && u !== v && w > 0) {
        // avoid duplicate edges in undirected graph
        const exists = validEdges.some(existing =>
          (existing.u === u && existing.v === v) ||
          (existing.u === v && existing.v === u)
        );
        if (!exists) {
          validEdges.push({
            id: String(e.id || `e_${idx + 1}`),
            u,
            v,
            w: Math.round(w)
          });
        }
      }
    });

    return { nodes: validNodes, edges: validEdges };
  }

  /**
   * Encode graph into URL hash for direct sharing
   */
  function encodeGraphToURL(graph) {
    try {
      const compact = {
        n: graph.nodes.map(n => [n.id, n.name, Math.round(n.x), Math.round(n.y)]),
        e: graph.edges.map(e => [e.u, e.v, e.w])
      };
      const json = JSON.stringify(compact);
      return '#' + encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
    } catch (e) {
      console.warn("Could not encode URL:", e);
      return '';
    }
  }

  /**
   * Decode graph from URL hash
   */
  function decodeGraphFromURL() {
    try {
      if (!window.location.hash || window.location.hash.length < 2) return null;
      const encoded = window.location.hash.slice(1);
      const json = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
      const compact = JSON.parse(json);
      if (compact && Array.isArray(compact.n) && Array.isArray(compact.e)) {
        const nodes = compact.n.map(item => ({
          id: String(item[0]),
          name: String(item[1] || item[0]),
          x: Number(item[2]),
          y: Number(item[3])
        }));
        const edges = compact.e.map((item, idx) => ({
          id: `e_${idx + 1}`,
          u: String(item[0]),
          v: String(item[1]),
          w: Number(item[2])
        }));
        return { nodes, edges };
      }
    } catch (e) {
      console.warn("Could not decode graph from URL hash:", e);
    }
    return null;
  }

  return {
    saveGraphToLocalStorage,
    loadGraphFromLocalStorage,
    saveQuizScore,
    loadQuizScore,
    saveCostPerKm,
    loadCostPerKm,
    exportGraphJSON,
    parseAndValidateGraph,
    encodeGraphToURL,
    decodeGraphFromURL
  };
});

