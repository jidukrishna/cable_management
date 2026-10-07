/**
 * Interactive SVG Graph Canvas
 * Supports node drag-and-drop, cable drafting, click-to-connect (mobile/tap),
 * weight editing, node renaming, and snapshot visual state rendering.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FibreMST = root.FibreMST || {};
    root.FibreMST.GraphCanvas = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  class GraphCanvas {
    constructor(svgElement, appState, options = {}) {
      this.svg = svgElement;
      this.state = appState;
      this.options = options;

      // Interaction State
      this.draggedNodeId = null;
      this.isDraggingNode = false;
      this.hasMovedDuringDrag = false;
      this.dragOffset = { x: 0, y: 0 };

      this.isDraftingEdge = false;
      this.edgeDraftStartNode = null;
      this.currentPointerPos = { x: 0, y: 0 };

      // Tap-to-connect support for touch / mobile
      this.tapSelectedNodeId = null;

      this.initSvgLayers();
      this.bindEvents();
      this.render();

      // Subscribe to app state updates
      this.state.subscribe((currentState, eventType) => {
        this.render();
      });
    }

    initSvgLayers() {
      this.svg.innerHTML = `
        <defs>
          <!-- Optical Laser Glow Filter -->
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g class="layer-grid"></g>
        <g class="layer-edges"></g>
        <g class="layer-draft"></g>
        <g class="layer-nodes"></g>
        <g class="layer-overlay"></g>
      `;

      this.layerGrid = this.svg.querySelector('.layer-grid');
      this.layerEdges = this.svg.querySelector('.layer-edges');
      this.layerDraft = this.svg.querySelector('.layer-draft');
      this.layerNodes = this.svg.querySelector('.layer-nodes');
      this.layerOverlay = this.svg.querySelector('.layer-overlay');
    }

    getSvgCoordinates(evt) {
      const rect = this.svg.getBoundingClientRect();
      const clientX = evt.clientX || (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
      const clientY = evt.clientY || (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);

      const viewBox = this.svg.viewBox.baseVal;
      const scaleX = viewBox.width / rect.width;
      const scaleY = viewBox.height / rect.height;

      return {
        x: Math.round((clientX - rect.left) * scaleX),
        y: Math.round((clientY - rect.top) * scaleY)
      };
    }

    bindEvents() {
      // SVG Background pointer down
      this.svg.addEventListener('mousedown', (e) => this.handlePointerDown(e));
      this.svg.addEventListener('mousemove', (e) => this.handlePointerMove(e));
      window.addEventListener('mouseup', (e) => this.handlePointerUp(e));

      // Touch events for mobile
      this.svg.addEventListener('touchstart', (e) => this.handlePointerDown(e), { passive: false });
      this.svg.addEventListener('touchmove', (e) => this.handlePointerMove(e), { passive: false });
      window.addEventListener('touchend', (e) => this.handlePointerUp(e));

      // Double clicks for rename / edit
      this.svg.addEventListener('dblclick', (e) => this.handleDoubleClick(e));

      // Keyboard shortcuts
      window.addEventListener('keydown', (e) => {
        if (this.state.mode !== 'edit') return;
        // Check if an input field is focused
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (this.state.selectedNodeId) {
            this.state.deleteNode(this.state.selectedNodeId);
          } else if (this.state.selectedEdgeId) {
            this.state.deleteEdge(this.state.selectedEdgeId);
          }
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            this.state.redo();
          } else {
            this.state.undo();
          }
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
          e.preventDefault();
          this.state.redo();
        }
      });
    }

    handlePointerDown(evt) {
      if (this.state.mode !== 'edit') return;
      const coords = this.getSvgCoordinates(evt);
      const target = evt.target;
      const nodeEl = target.closest('[data-node-id]');
      const edgeEl = target.closest('[data-edge-id]');

      if (nodeEl) {
        evt.preventDefault();
        const nodeId = nodeEl.getAttribute('data-node-id');
        const node = this.state.graph.nodes.find(n => n.id === nodeId);
        if (!node) return;

        // Tool: addEdge mode or tap-connect mode
        if (this.state.editorTool === 'addEdge' || evt.shiftKey) {
          this.isDraftingEdge = true;
          this.edgeDraftStartNode = node;
          this.currentPointerPos = coords;
          return;
        }

        // Tap-to-connect mode for touch
        if (this.tapSelectedNodeId && this.tapSelectedNodeId !== nodeId) {
          this.promptCreateEdge(this.tapSelectedNodeId, nodeId);
          this.tapSelectedNodeId = null;
          this.state.clearSelection();
          return;
        }

        // Start node drag
        this.draggedNodeId = nodeId;
        this.isDraggingNode = true;
        this.hasMovedDuringDrag = false;
        this.dragOffset = {
          x: coords.x - node.x,
          y: coords.y - node.y
        };
        this.state.setSelectedNode(nodeId);
      } else if (edgeEl) {
        evt.preventDefault();
        const edgeId = edgeEl.getAttribute('data-edge-id');
        this.state.setSelectedEdge(edgeId);
        this.tapSelectedNodeId = null;
      } else {
        // Clicked empty background
        this.tapSelectedNodeId = null;
        this.state.clearSelection();

        // If tool is addNode or normal click on canvas
        if (this.state.editorTool === 'addNode' || this.options.clickToAddNode) {
          this.promptCreateNode(coords.x, coords.y);
        }
      }
    }

    handlePointerMove(evt) {
      if (this.state.mode !== 'edit') return;
      const coords = this.getSvgCoordinates(evt);
      this.currentPointerPos = coords;

      if (this.isDraggingNode && this.draggedNodeId) {
        evt.preventDefault();
        this.hasMovedDuringDrag = true;
        const newX = Math.max(30, Math.min(670, coords.x - this.dragOffset.x));
        const newY = Math.max(30, Math.min(570, coords.y - this.dragOffset.y));
        this.state.updateNodePosition(this.draggedNodeId, newX, newY);
      } else if (this.isDraftingEdge && this.edgeDraftStartNode) {
        evt.preventDefault();
        this.renderDraftEdge();
      }
    }

    handlePointerUp(evt) {
      if (this.state.mode !== 'edit') return;

      if (this.isDraftingEdge && this.edgeDraftStartNode) {
        const coords = this.getSvgCoordinates(evt);
        const targetNode = this.findNodeAt(coords.x, coords.y);

        if (targetNode && targetNode.id !== this.edgeDraftStartNode.id) {
          this.promptCreateEdge(this.edgeDraftStartNode.id, targetNode.id);
        }

        this.isDraftingEdge = false;
        this.edgeDraftStartNode = null;
        this.layerDraft.innerHTML = '';
      }

      if (this.isDraggingNode) {
        // If it was just a quick tap without movement, enable tap-to-connect candidate
        if (!this.hasMovedDuringDrag) {
          this.tapSelectedNodeId = this.draggedNodeId;
        }
        this.isDraggingNode = false;
        this.draggedNodeId = null;
      }
    }

    handleDoubleClick(evt) {
      if (this.state.mode !== 'edit') return;
      const nodeEl = evt.target.closest('[data-node-id]');
      const edgeEl = evt.target.closest('[data-edge-id]');

      if (nodeEl) {
        const nodeId = nodeEl.getAttribute('data-node-id');
        const node = this.state.graph.nodes.find(n => n.id === nodeId);
        if (node) {
          const newName = prompt(`Rename city (${node.name}):`, node.name);
          if (newName !== null && newName.trim()) {
            this.state.renameNode(nodeId, newName.trim());
          }
        }
      } else if (edgeEl) {
        const edgeId = edgeEl.getAttribute('data-edge-id');
        const edge = this.state.graph.edges.find(e => e.id === edgeId);
        if (edge) {
          const newW = prompt(`Enter optical cable distance in km (${edge.w} km):`, edge.w);
          if (newW !== null) {
            const num = Number(newW);
            if (!isNaN(num) && num > 0) {
              this.state.updateEdgeWeight(edgeId, num);
            } else {
              alert("Cable distance must be a positive number.");
            }
          }
        }
      } else {
        // Double click empty canvas creates node
        const coords = this.getSvgCoordinates(evt);
        this.promptCreateNode(coords.x, coords.y);
      }
    }

    findNodeAt(x, y, radius = 24) {
      return this.state.graph.nodes.find(n => Math.hypot(n.x - x, n.y - y) <= radius);
    }

    promptCreateNode(x, y) {
      // Suggest sequential letter
      let defaultName = "";
      const existing = new Set(this.state.graph.nodes.map(n => n.name));
      for (let i = 0; i < 26; i++) {
        const letter = `City ${String.fromCharCode(65 + i)}`;
        if (!existing.has(letter)) {
          defaultName = letter;
          break;
        }
      }
      const name = prompt("Enter new city name:", defaultName || "New City");
      if (name !== null && name.trim()) {
        this.state.addNode(x, y, name.trim());
      }
    }

    promptCreateEdge(u, v) {
      const nodeU = this.state.graph.nodes.find(n => n.id === u);
      const nodeV = this.state.graph.nodes.find(n => n.id === v);
      if (!nodeU || !nodeV) return;

      // Estimate distance from pixel distance
      const pxDist = Math.hypot(nodeU.x - nodeV.x, nodeU.y - nodeV.y);
      const defaultKm = Math.max(5, Math.round(pxDist / 5) * 5);

      const input = prompt(`Lay optical fibre between ${nodeU.name} and ${nodeV.name}.\nEnter cable distance (km):`, defaultKm);
      if (input !== null) {
        const w = Number(input);
        if (!isNaN(w) && w > 0) {
          const edge = this.state.addEdge(u, v, w);
          if (!edge) {
            alert("A cable between these two cities already exists, or the input was invalid.");
          }
        } else {
          alert("Cable distance must be a positive number greater than 0 km.");
        }
      }
    }

    renderDraftEdge() {
      if (!this.edgeDraftStartNode) return;
      const start = this.edgeDraftStartNode;
      const end = this.currentPointerPos;
      this.layerDraft.innerHTML = `
        <line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}"
              stroke="#00f0ff" stroke-width="2.5" stroke-dasharray="6,4" opacity="0.85" />
      `;
    }

    render() {
      const { graph, mode, selectedNodeId, selectedEdgeId, currentSnapshot } = this.state.getState();
      const isViz = mode === 'visualize' && currentSnapshot;

      // 1. Build lookup sets for snapshot state
      const visitedNodes = new Set(isViz ? currentSnapshot.visited : []);
      const currentNodeId = isViz ? currentSnapshot.currentNode : null;

      // Map edges to status
      const mstEdgeIds = new Set(isViz ? currentSnapshot.mstEdges.map(e => e.id) : []);
      const candidateEdgeIds = new Set(isViz ? currentSnapshot.queue.map(e => e.edgeId) : []);
      const consideredEdgeId = isViz && currentSnapshot.considered ? currentSnapshot.considered.edgeId : null;
      const rejectedEdgeId = isViz && currentSnapshot.rejectedEdge ? currentSnapshot.rejectedEdge.edgeId : null;

      // 2. Render Edges
      let edgesHtml = '';
      const nodeMap = new Map();
      graph.nodes.forEach(n => nodeMap.set(n.id, n));

      graph.edges.forEach(edge => {
        const u = nodeMap.get(edge.u);
        const v = nodeMap.get(edge.v);
        if (!u || !v) return;

        let edgeClass = 'edge-cable';
        let strokeColor = '#334155';
        let strokeWidth = '2';
        let strokeDash = '';
        let badgeClass = 'badge-normal';
        let badgeText = `${edge.w} km`;

        if (isViz) {
          const isDone = (currentSnapshot && currentSnapshot.status === 'done');
          if (mstEdgeIds.has(edge.id)) {
            edgeClass += ' edge-chosen';
            strokeColor = '#00ff88';
            strokeWidth = '4.5';
            badgeClass = 'badge-chosen';
            const mstIdx = currentSnapshot.mstEdges ? currentSnapshot.mstEdges.findIndex(e => e.id === edge.id) : -1;
            const orderPrefix = (mstIdx !== -1) ? `#${mstIdx + 1} • ` : '';
            badgeText = `${orderPrefix}${edge.w} km`;
          } else if (edge.id === consideredEdgeId) {
            edgeClass += ' edge-considered';
            strokeColor = '#ffb800';
            strokeWidth = '4';
            strokeDash = '6,4';
            badgeClass = 'badge-considered';
            badgeText = `${edge.w} km (Evaluating)`;
          } else if (edge.id === rejectedEdgeId) {
            edgeClass += ' edge-rejected';
            strokeColor = '#ef4444';
            strokeWidth = '2.5';
            strokeDash = '4,4';
            badgeClass = 'badge-rejected';
            badgeText = `${edge.w} km (Cycle)`;
          } else if (!isDone && candidateEdgeIds.has(edge.id)) {
            edgeClass += ' edge-candidate';
            strokeColor = '#00f0ff';
            strokeWidth = '3';
            strokeDash = '5,3';
            badgeClass = 'badge-candidate';
          } else {
            edgeClass += ' edge-dim';
            strokeColor = '#1e293b';
            strokeWidth = '1.5';
            badgeClass = 'badge-dim';
            if (isDone) {
              badgeText = `${edge.w} km (Omitted)`;
            }
          }
        } else {
          // Edit mode
          if (edge.id === selectedEdgeId) {
            edgeClass += ' edge-selected';
            strokeColor = '#38bdf8';
            strokeWidth = '3.5';
          }
        }

        // Calculate midpoint for distance label
        const midX = (u.x + v.x) / 2;
        const midY = (u.y + v.y) / 2;
        const badgeWidth = Math.max(54, badgeText.length * 6.5 + 16);

        edgesHtml += `
          <g class="graph-edge ${edgeClass}" data-edge-id="${edge.id}">
            <!-- Invisible wide stroke for easy clicking/tapping -->
            <line x1="${u.x}" y1="${u.y}" x2="${v.x}" y2="${v.y}"
                  stroke="transparent" stroke-width="18" class="edge-hitarea" />
            <line x1="${u.x}" y1="${u.y}" x2="${v.x}" y2="${v.y}"
                  stroke="${strokeColor}" stroke-width="${strokeWidth}"
                  stroke-dasharray="${strokeDash}" class="edge-line" />
            <!-- Weight Badge -->
            <g class="edge-badge-group" transform="translate(${midX}, ${midY})">
              <rect x="${-badgeWidth / 2}" y="-12" width="${badgeWidth}" height="20" rx="10"
                    class="edge-badge-bg ${badgeClass}" />
              <text x="0" y="2" text-anchor="middle" dominant-baseline="middle"
                    class="edge-badge-text ${badgeClass}">${badgeText}</text>
            </g>
          </g>
        `;
      });
      this.layerEdges.innerHTML = edgesHtml;

      // 3. Render Nodes
      let nodesHtml = '';
      graph.nodes.forEach(node => {
        let nodeClass = 'city-node';
        let fillColor = '#0f172a';
        let strokeColor = '#38bdf8';
        let strokeWidth = '2';
        let filter = '';
        let isVisited = visitedNodes.has(node.id);
        let isCurrent = (node.id === currentNodeId);
        let isStart = (node.id === this.state.startNodeId);
        let isSelected = (node.id === selectedNodeId);
        let isTapSelected = (node.id === this.tapSelectedNodeId);

        let orderBadgeHtml = '';
        if (isViz) {
          const visitIndex = (currentSnapshot && currentSnapshot.visited) ?
            currentSnapshot.visited.indexOf(node.id) : -1;
          if (visitIndex !== -1) {
            const orderNum = visitIndex + 1;
            orderBadgeHtml = `
              <g transform="translate(-14, -14)" class="node-order-badge" title="City #${orderNum} added to MST">
                <circle r="8.5" fill="#00ff88" stroke="#080c14" stroke-width="1.5" filter="url(#glow-emerald)" />
                <text x="0" y="0.5" text-anchor="middle" dominant-baseline="central"
                      font-size="8.5" font-weight="bold" fill="#080c14">${orderNum}</text>
              </g>
            `;
          }

          if (isCurrent) {
            nodeClass += ' node-current';
            strokeColor = '#ffb800';
            strokeWidth = '4';
            filter = 'url(#glow-amber)';
          } else if (isVisited) {
            nodeClass += ' node-visited';
            strokeColor = '#00ff88';
            strokeWidth = '3';
            filter = 'url(#glow-emerald)';
          } else {
            nodeClass += ' node-unvisited';
            strokeColor = '#334155';
          }
        } else {
          if (isSelected || isTapSelected) {
            nodeClass += ' node-selected';
            strokeColor = '#00f0ff';
            strokeWidth = '3.5';
            filter = 'url(#glow-cyan)';
          }
        }

        const labelWidth = Math.max(76, node.name.length * 6.8 + 14);

        nodesHtml += `
          <g class="${nodeClass}" data-node-id="${node.id}" transform="translate(${node.x}, ${node.y})">
            <!-- Pulsing outer ring if current or start -->
            ${isCurrent ? '<circle r="26" class="node-pulse-ring" stroke="#ffb800" fill="none" stroke-width="2" />' : ''}
            ${isStart && !isViz ? '<circle r="23" stroke="#00f0ff" stroke-dasharray="4,3" fill="none" stroke-width="1.5" />' : ''}

            <!-- Main city circle -->
            <circle r="18" fill="${fillColor}" stroke="${strokeColor}"
                    stroke-width="${strokeWidth}" filter="${filter}" class="node-circle" />

            <!-- City Code / Short Initial -->
            <text x="0" y="0" text-anchor="middle" dominant-baseline="central"
                  class="node-initial">${node.id.length <= 3 ? node.id : node.name.charAt(0)}</text>

            <!-- Numerical Order Badge (MST Sequence #) -->
            ${orderBadgeHtml}

            <!-- City Name Label Below Node -->
            <g transform="translate(0, 27)" class="node-label-group">
              <rect x="${-labelWidth / 2}" y="-9" width="${labelWidth}" height="18" rx="4" class="node-label-bg" />
              <text x="0" y="0" text-anchor="middle" dominant-baseline="middle"
                    class="node-label-text">${escapeHtml(node.name)}</text>
            </g>

            <!-- Start Badge Indicator -->
            ${isStart ? `
              <g transform="translate(14, -14)" class="start-badge">
                <circle r="7" fill="#00f0ff" />
                <text x="0" y="0.5" text-anchor="middle" dominant-baseline="central"
                      font-size="8" font-weight="bold" fill="#080c14">S</text>
              </g>
            ` : ''}
          </g>
        `;
      });
      this.layerNodes.innerHTML = nodesHtml;
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return GraphCanvas;
});

