/**
 * Central State Management & Action Dispatcher
 * Controls application lifecycle, graph edits, history (undo/redo), and simulation player.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FibreMST = root.FibreMST || {};
    root.FibreMST.State = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  class AppState {
    constructor() {
      this.listeners = new Set();
      this.undoStack = [];
      this.redoStack = [];
      this.maxHistory = 30;

      // Core State
      this.graph = { nodes: [], edges: [] };
      this.mode = 'edit'; // 'edit' | 'visualize'
      this.startNodeId = null;
      this.costPerKm = 50000; // in INR (₹)
      this.activeTab = 'visualizer'; // 'visualizer' | 'theory' | 'quiz'
      this.codeLang = 'js'; // 'js' | 'python' | 'cpp' | 'java'

      // Editor Sub-state
      this.editorTool = 'select'; // 'select' | 'addNode' | 'addEdge' | 'delete'
      this.selectedNodeId = null;
      this.selectedEdgeId = null;
      this.edgeDraftSource = null;
      this.edgeDraftMouse = null; // { x, y }

      // Simulation Sub-state
      this.snapshots = [];
      this.currentStepIndex = 0;
      this.isPlaying = false;
      this.playbackSpeed = 1000; // ms per step
      this.timerId = null;
      this.simulationResult = null; // { isConnected, totalCost, mstEdges, components }
    }

    subscribe(fn) {
      this.listeners.add(fn);
      return () => this.listeners.delete(fn);
    }

    notify(eventType = 'change') {
      const stateCopy = this.getState();
      this.listeners.forEach(fn => {
        try {
          fn(stateCopy, eventType);
        } catch (err) {
          console.error("State listener error:", err);
        }
      });
    }

    getState() {
      return {
        graph: this.graph,
        mode: this.mode,
        startNodeId: this.startNodeId,
        costPerKm: this.costPerKm,
        activeTab: this.activeTab,
        codeLang: this.codeLang,
        editorTool: this.editorTool,
        selectedNodeId: this.selectedNodeId,
        selectedEdgeId: this.selectedEdgeId,
        edgeDraftSource: this.edgeDraftSource,
        edgeDraftMouse: this.edgeDraftMouse,
        snapshots: this.snapshots,
        currentStepIndex: this.currentStepIndex,
        currentSnapshot: this.snapshots[this.currentStepIndex] || null,
        isPlaying: this.isPlaying,
        playbackSpeed: this.playbackSpeed,
        simulationResult: this.simulationResult,
        canUndo: this.undoStack.length > 0,
        canRedo: this.redoStack.length > 0
      };
    }

    // --- History Management ---
    _pushHistory() {
      const snapshot = JSON.stringify(this.graph);
      this.undoStack.push(snapshot);
      if (this.undoStack.length > this.maxHistory) {
        this.undoStack.shift();
      }
      this.redoStack = [];
    }

    undo() {
      if (this.mode !== 'edit' || this.undoStack.length === 0) return;
      const current = JSON.stringify(this.graph);
      this.redoStack.push(current);
      const prev = this.undoStack.pop();
      this.graph = JSON.parse(prev);
      this._sanitizeSelection();
      this.notify('history');
    }

    redo() {
      if (this.mode !== 'edit' || this.redoStack.length === 0) return;
      const current = JSON.stringify(this.graph);
      this.undoStack.push(current);
      const next = this.redoStack.pop();
      this.graph = JSON.parse(next);
      this._sanitizeSelection();
      this.notify('history');
    }

    _sanitizeSelection() {
      const nodeExists = this.graph.nodes.some(n => n.id === this.selectedNodeId);
      if (!nodeExists) this.selectedNodeId = null;

      const edgeExists = this.graph.edges.some(e => e.id === this.selectedEdgeId);
      if (!edgeExists) this.selectedEdgeId = null;

      const startExists = this.graph.nodes.some(n => n.id === this.startNodeId);
      if (!startExists) {
        this.startNodeId = this.graph.nodes.length > 0 ? this.graph.nodes[0].id : null;
      }
    }

    // --- Graph Mutations ---
    setGraph(newGraph, saveHistory = true) {
      if (saveHistory) this._pushHistory();
      this.graph = {
        nodes: (newGraph.nodes || []).map(n => ({ ...n })),
        edges: (newGraph.edges || []).map(e => ({ ...e }))
      };
      this._sanitizeSelection();
      this.notify('graph_update');
    }

    addNode(x, y, customName = null) {
      if (this.mode !== 'edit') return null;
      this._pushHistory();

      // Generate id & sequential name (A, B, C... or Z1, Z2)
      let id;
      const existingIds = new Set(this.graph.nodes.map(n => n.id));
      for (let i = 0; i < 260; i++) {
        const candidate = i < 26 ? String.fromCharCode(65 + i) : `N${i - 25}`;
        if (!existingIds.has(candidate)) {
          id = candidate;
          break;
        }
      }
      if (!id) id = `N_${Date.now()}`;

      const name = customName || id;
      const newNode = {
        id,
        name,
        x: Math.round(x),
        y: Math.round(y)
      };

      this.graph.nodes.push(newNode);
      if (!this.startNodeId) this.startNodeId = newNode.id;
      this.selectedNodeId = newNode.id;
      this.selectedEdgeId = null;

      this.notify('node_add');
      return newNode;
    }

    updateNodePosition(id, x, y) {
      if (this.mode !== 'edit') return;
      const node = this.graph.nodes.find(n => n.id === id);
      if (node) {
        node.x = Math.round(x);
        node.y = Math.round(y);
        this.notify('node_move');
      }
    }

    renameNode(id, newName) {
      if (this.mode !== 'edit') return;
      const node = this.graph.nodes.find(n => n.id === id);
      if (node && newName.trim()) {
        this._pushHistory();
        node.name = newName.trim();
        this.notify('node_rename');
      }
    }

    deleteNode(id) {
      if (this.mode !== 'edit') return;
      this._pushHistory();

      this.graph.nodes = this.graph.nodes.filter(n => n.id !== id);
      this.graph.edges = this.graph.edges.filter(e => e.u !== id && e.v !== id);

      this._sanitizeSelection();
      this.notify('node_delete');
    }

    addEdge(u, v, weight) {
      if (this.mode !== 'edit') return null;
      if (u === v) return null; // No self loops
      const w = Math.round(Number(weight));
      if (isNaN(w) || w <= 0) return null; // Strictly positive

      // Check duplicate
      const exists = this.graph.edges.some(e =>
        (e.u === u && e.v === v) || (e.u === v && e.v === u)
      );
      if (exists) return null;

      this._pushHistory();
      const edgeId = `e_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const newEdge = { id: edgeId, u, v, w };
      this.graph.edges.push(newEdge);

      this.selectedEdgeId = newEdge.id;
      this.selectedNodeId = null;
      this.notify('edge_add');
      return newEdge;
    }

    updateEdgeWeight(id, newWeight) {
      if (this.mode !== 'edit') return;
      const w = Math.round(Number(newWeight));
      if (isNaN(w) || w <= 0) return;

      const edge = this.graph.edges.find(e => e.id === id);
      if (edge) {
        this._pushHistory();
        edge.w = w;
        this.notify('edge_update');
      }
    }

    deleteEdge(id) {
      if (this.mode !== 'edit') return;
      this._pushHistory();
      this.graph.edges = this.graph.edges.filter(e => e.id !== id);
      if (this.selectedEdgeId === id) this.selectedEdgeId = null;
      this.notify('edge_delete');
    }

    clearGraph() {
      if (this.mode !== 'edit') return;
      this._pushHistory();
      this.graph = { nodes: [], edges: [] };
      this.selectedNodeId = null;
      this.selectedEdgeId = null;
      this.startNodeId = null;
      this.notify('graph_clear');
    }

    loadPreset(preset) {
      if (!preset) return;
      this._pushHistory();
      this.graph = {
        nodes: preset.nodes.map(n => ({ ...n })),
        edges: preset.edges.map(e => ({ ...e }))
      };
      this.startNodeId = preset.startNode || (this.graph.nodes[0] ? this.graph.nodes[0].id : null);
      this.selectedNodeId = null;
      this.selectedEdgeId = null;
      this.mode = 'edit';
      this.snapshots = [];
      this.currentStepIndex = 0;
      this.isPlaying = false;
      this.notify('preset_loaded');
    }

    generateRandomGraph(nodeCount = 6) {
      if (this.mode !== 'edit') return;
      this._pushHistory();

      const names = ["Kochi", "Aluva", "Thrissur", "Palakkad", "Kozhikode", "Kannur", "Kollam", "Alappuzha", "Wayanad", "Idukki"];
      const count = Math.min(nodeCount, names.length);
      const width = 640;
      const height = 480;
      const margin = 80;

      const nodes = [];
      for (let i = 0; i < count; i++) {
        // distribute along a ring or semi-random layout
        const angle = (2 * Math.PI * i) / count;
        const rx = (width - 2 * margin) / 2;
        const ry = (height - 2 * margin) / 2;
        const cx = width / 2;
        const cy = height / 2;

        const jitterX = (Math.random() - 0.5) * 40;
        const jitterY = (Math.random() - 0.5) * 40;

        nodes.push({
          id: `N${i + 1}`,
          name: names[i] || `City ${i + 1}`,
          x: Math.round(cx + rx * Math.cos(angle) + jitterX),
          y: Math.round(cy + ry * Math.sin(angle) + jitterY)
        });
      }

      // Generate connected edges (spanning tree + random extra cables)
      const edges = [];
      let edgeCounter = 1;

      // Connect ring first to guarantee connectivity
      for (let i = 0; i < count; i++) {
        const u = nodes[i].id;
        const v = nodes[(i + 1) % count].id;
        const n1 = nodes[i];
        const n2 = nodes[(i + 1) % count];
        const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
        const w = Math.max(5, Math.round(dist / 5) * 2);
        edges.push({ id: `e_${edgeCounter++}`, u, v, w });
      }

      // Add 2-3 cross connections
      for (let i = 0; i < count; i++) {
        const target = (i + 2) % count;
        if (Math.random() > 0.4 && edges.length < count * 2) {
          const u = nodes[i].id;
          const v = nodes[target].id;
          const exists = edges.some(e => (e.u === u && e.v === v) || (e.u === v && e.v === u));
          if (!exists) {
            const n1 = nodes[i];
            const n2 = nodes[target];
            const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
            const w = Math.max(8, Math.round(dist / 4.5) * 2);
            edges.push({ id: `e_${edgeCounter++}`, u, v, w });
          }
        }
      }

      this.graph = { nodes, edges };
      this.startNodeId = nodes[0].id;
      this.selectedNodeId = null;
      this.selectedEdgeId = null;
      this.notify('random_generated');
    }

    // --- Selection & Tool Controls ---
    setEditorTool(tool) {
      this.editorTool = tool;
      this.edgeDraftSource = null;
      this.edgeDraftMouse = null;
      this.notify('tool_change');
    }

    setSelectedNode(id) {
      this.selectedNodeId = id;
      this.selectedEdgeId = null;
      this.notify('select_node');
    }

    setSelectedEdge(id) {
      this.selectedEdgeId = id;
      this.selectedNodeId = null;
      this.notify('select_edge');
    }

    clearSelection() {
      this.selectedNodeId = null;
      this.selectedEdgeId = null;
      this.edgeDraftSource = null;
      this.edgeDraftMouse = null;
      this.notify('clear_selection');
    }

    setEdgeDraft(sourceId, mousePos) {
      this.edgeDraftSource = sourceId;
      this.edgeDraftMouse = mousePos;
      this.notify('draft_update');
    }

    setStartNode(id) {
      this.startNodeId = id;
      this.notify('start_node_change');
    }

    setCostPerKm(val) {
      const num = Number(val);
      if (!isNaN(num) && num > 0) {
        this.costPerKm = num;
        this.notify('cost_rate_change');
      }
    }

    setActiveTab(tab) {
      this.activeTab = tab;
      this.notify('tab_change');
    }

    setCodeLang(lang) {
      this.codeLang = lang;
      this.notify('code_lang_change');
    }

    setPlaybackSpeed(speedMs) {
      this.playbackSpeed = speedMs;
      if (this.isPlaying) {
        this.pauseSimulation();
        this.playSimulation();
      }
      this.notify('speed_change');
    }

    // --- Simulation & Playback ---
    startSimulation(runAlgorithmFn) {
      if (this.graph.nodes.length === 0) return false;

      this.mode = 'visualize';
      this.selectedNodeId = null;
      this.selectedEdgeId = null;
      this.edgeDraftSource = null;

      // Run algorithm once and save immutable snapshots
      this.simulationResult = runAlgorithmFn(this.graph, this.startNodeId);
      this.snapshots = this.simulationResult.snapshots;
      this.currentStepIndex = 0;
      this.isPlaying = false;

      this.notify('simulation_start');
      return true;
    }

    exitSimulation() {
      this.pauseSimulation();
      this.mode = 'edit';
      this.snapshots = [];
      this.currentStepIndex = 0;
      this.simulationResult = null;
      this.notify('simulation_exit');
    }

    playSimulation() {
      if (this.mode !== 'visualize' || this.snapshots.length === 0) return;
      if (this.currentStepIndex >= this.snapshots.length - 1) {
        // Wrap around to start if at the end
        this.currentStepIndex = 0;
      }
      this.isPlaying = true;

      clearInterval(this.timerId);
      this.timerId = setInterval(() => {
        if (this.currentStepIndex < this.snapshots.length - 1) {
          this.currentStepIndex++;
          this.notify('step_change');
        } else {
          this.pauseSimulation();
        }
      }, this.playbackSpeed);

      this.notify('playback_state');
    }

    pauseSimulation() {
      this.isPlaying = false;
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
      this.notify('playback_state');
    }

    togglePlayPause() {
      if (this.isPlaying) {
        this.pauseSimulation();
      } else {
        this.playSimulation();
      }
    }

    stepNext() {
      if (this.mode !== 'visualize' || this.snapshots.length === 0) return;
      this.pauseSimulation();
      if (this.currentStepIndex < this.snapshots.length - 1) {
        this.currentStepIndex++;
        this.notify('step_change');
      }
    }

    stepPrev() {
      if (this.mode !== 'visualize' || this.snapshots.length === 0) return;
      this.pauseSimulation();
      if (this.currentStepIndex > 0) {
        this.currentStepIndex--;
        this.notify('step_change');
      }
    }

    goToStep(index) {
      if (this.mode !== 'visualize' || this.snapshots.length === 0) return;
      this.pauseSimulation();
      const clamped = Math.max(0, Math.min(index, this.snapshots.length - 1));
      if (this.currentStepIndex !== clamped) {
        this.currentStepIndex = clamped;
        this.notify('step_change');
      }
    }
  }

  return AppState;
});

