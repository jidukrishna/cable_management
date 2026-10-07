/**
 * Snapshot & UI Sync Renderer
 * Synchronizes algorithm snapshots with narrative text, priority queue table,
 * live network metrics, code line highlighting, and variables inspector.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FibreMST = root.FibreMST || {};
    root.FibreMST.Renderer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  class Renderer {
    constructor(appState, elements = {}) {
      this.state = appState;
      this.elements = elements;

      this.codeSnippets = (window.FibreMST && window.FibreMST.codeSnippets) ?
        window.FibreMST.codeSnippets : {};

      this.bindLangTabs();

      // Subscribe to app state
      this.state.subscribe((state, eventType) => {
        this.renderAll(state);
      });
    }

    bindLangTabs() {
      const { langTabContainer } = this.elements;
      if (!langTabContainer) return;

      langTabContainer.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('[data-lang]');
        if (tabBtn) {
          const lang = tabBtn.getAttribute('data-lang');
          this.state.setCodeLang(lang);
        }
      });
    }

    renderAll(state) {
      this.renderNarrative(state);
      this.renderPriorityQueue(state);
      this.renderCityOrder(state);
      this.renderMetrics(state);
      this.renderCodeViewer(state);
      this.renderVariables(state);
    }

    renderNarrative(state) {
      const { narrativeBox, actionBadge, btnOpenMstSummary } = this.elements;
      if (!narrativeBox) return;

      if (state.mode !== 'visualize' || !state.currentSnapshot) {
        narrativeBox.innerHTML = `
          <p class="narrative-empty">
            Design your optical fibre network above. Add cities, lay cables with distance weights,
            select a starting hub, and click <strong>"Calculate MST"</strong> to trace Prim's algorithm step by step.
          </p>
        `;
        if (actionBadge) {
          actionBadge.textContent = "Ready";
          actionBadge.className = "action-badge badge-ready";
        }
        if (btnOpenMstSummary) {
          btnOpenMstSummary.style.display = 'none';
        }
        return;
      }

      const snap = state.currentSnapshot;
      narrativeBox.innerHTML = `<p class="narrative-text">${escapeHtml(snap.message)}</p>`;

      if (btnOpenMstSummary) {
        btnOpenMstSummary.style.display = (snap.status === 'done') ? 'inline-flex' : 'none';
      }

      if (actionBadge) {
        let label = "Step";
        let badgeClass = "badge-step";
        switch (snap.status) {
          case 'start':
            label = "Start Hub";
            badgeClass = "badge-start";
            break;
          case 'candidate':
            label = "Enqueued Candidates";
            badgeClass = "badge-candidate";
            break;
          case 'considered':
            label = "Evaluating Min Cable";
            badgeClass = "badge-considered";
            break;
          case 'added':
            label = "Connected to MST";
            badgeClass = "badge-added";
            break;
          case 'rejected':
            label = "Cycle Avoided";
            badgeClass = "badge-rejected";
            break;
          case 'done':
            label = "MST Complete";
            badgeClass = "badge-done";
            break;
          case 'disconnected':
            label = "Network Disconnected";
            badgeClass = "badge-disconnected";
            break;
        }
        actionBadge.textContent = label;
        actionBadge.className = `action-badge ${badgeClass}`;
      }
    }

    renderPriorityQueue(state) {
      const { pqTableBody, pqEmptyMsg } = this.elements;
      if (!pqTableBody) return;

      if (state.mode !== 'visualize' || !state.currentSnapshot) {
        pqTableBody.innerHTML = '';
        if (pqEmptyMsg) pqEmptyMsg.style.display = 'block';
        return;
      }

      const snap = state.currentSnapshot;
      const queue = snap.queue || [];
      const nodeMap = new Map();
      state.graph.nodes.forEach(n => nodeMap.set(n.id, n.name || n.id));
      const visitedSet = new Set(snap.visited || []);
      const isMstComplete = (snap.status === 'done');

      if (queue.length === 0) {
        pqTableBody.innerHTML = '';
        if (pqEmptyMsg) {
          pqEmptyMsg.style.display = 'block';
          pqEmptyMsg.textContent = snap.status === 'done' ?
            'Queue is empty. Minimum Spanning Tree formed!' :
            'Queue is currently empty.';
        }
        return;
      }

      if (pqEmptyMsg) {
        if (isMstComplete) {
          pqEmptyMsg.style.display = 'block';
          pqEmptyMsg.innerHTML = `<span style="color: var(--laser-emerald); font-weight: 600;">✓ MST Complete!</span> All ${visitedSet.size} cities connected. Remaining ${queue.length} cable(s) below are omitted to prevent loops:`;
        } else {
          pqEmptyMsg.style.display = 'none';
        }
      }

      let rowsHtml = '';
      queue.forEach((item, idx) => {
        const uName = nodeMap.get(item.u) || item.u;
        const vName = nodeMap.get(item.v) || item.v;
        const isTargetVisited = visitedSet.has(item.v);

        let badgeClass = 'pq-badge-candidate';
        let badgeText = `Route to ${vName}`;
        let rowClass = '';
        let rankText = String(idx + 1);

        if (isMstComplete) {
          badgeClass = 'pq-badge-omitted';
          badgeText = 'Omitted (Loop avoided)';
          rowClass = 'pq-row-omitted';
          rankText = '—';
        } else if (isTargetVisited) {
          badgeClass = 'pq-badge-cycle';
          badgeText = `Loop (${vName} already joined)`;
          rowClass = 'pq-row-cycle';
          rankText = `${idx + 1} ⚠`;
        } else if (idx === 0) {
          badgeClass = 'pq-badge-min';
          badgeText = `★ Next: Connects ${vName}`;
          rowClass = 'pq-row-min';
          rankText = '★ 1';
        } else if (idx === 1) {
          badgeClass = 'pq-badge-next';
          badgeText = `2nd: Route to ${vName}`;
        } else {
          // Check if an earlier candidate edge targets the same destination city
          const hasEarlierRoute = queue.slice(0, idx).some(prev => prev.v === item.v);
          if (hasEarlierRoute) {
            badgeClass = 'pq-badge-alt';
            badgeText = `Alt route to ${vName}`;
          } else {
            badgeClass = 'pq-badge-candidate';
            badgeText = `Candidate for ${vName}`;
          }
        }

        rowsHtml += `
          <tr class="${rowClass}">
            <td class="pq-rank">${rankText}</td>
            <td class="pq-edge">${escapeHtml(uName)} → ${escapeHtml(vName)}</td>
            <td class="pq-dist">${item.w} km</td>
            <td class="pq-status">
              <span class="pq-badge ${badgeClass}">${badgeText}</span>
            </td>
          </tr>
        `;
      });

      pqTableBody.innerHTML = rowsHtml;
    }

    renderCityOrder(state) {
      const { cityOrderTableBody, cityOrderEmptyMsg, cityOrderBadge } = this.elements;
      if (!cityOrderTableBody) return;

      if (state.mode !== 'visualize' || !state.currentSnapshot) {
        cityOrderTableBody.innerHTML = '';
        if (cityOrderEmptyMsg) cityOrderEmptyMsg.style.display = 'block';
        if (cityOrderBadge) cityOrderBadge.textContent = '0';
        return;
      }

      const snap = state.currentSnapshot;
      const orderList = snap.cityOrder || [];
      const nodeMap = new Map();
      state.graph.nodes.forEach(n => nodeMap.set(n.id, n.name || n.id));

      if (cityOrderBadge) {
        cityOrderBadge.textContent = String(orderList.length);
      }

      if (orderList.length === 0) {
        cityOrderTableBody.innerHTML = '';
        if (cityOrderEmptyMsg) {
          cityOrderEmptyMsg.style.display = 'block';
          cityOrderEmptyMsg.textContent = 'No cities connected yet.';
        }
        return;
      }

      if (cityOrderEmptyMsg) cityOrderEmptyMsg.style.display = 'none';

      let rowsHtml = '';
      orderList.forEach(item => {
        const isCurrentCity = (snap.currentNode === item.cityId);
        const rowClass = isCurrentCity ? 'order-row-current' : '';
        const orderBadgeClass = (item.order === 1) ? 'badge-start' : 'badge-added';
        const cableDisplay = item.order === 1 ?
          '<span class="order-cable-hub">★ Initial Hub (Start)</span>' :
          escapeHtml(item.cableText);
        const distDisplay = item.order === 1 ? '—' : `${item.cableDist} km`;

        rowsHtml += `
          <tr class="${rowClass}">
            <td class="pq-rank">
              <span class="action-badge ${orderBadgeClass}" style="padding: 2px 6px; font-size: 0.72rem;">#${item.order}</span>
            </td>
            <td class="order-city-name">
              <strong>${escapeHtml(item.cityName)}</strong>
              ${isCurrentCity ? '<span style="color: var(--laser-amber); font-size: 0.7rem; margin-left: 4px;">● Active</span>' : ''}
            </td>
            <td class="order-cable-desc">${cableDisplay}</td>
            <td class="pq-dist">${distDisplay}</td>
            <td class="order-cumulative">${item.cumulativeDist} km</td>
          </tr>
        `;
      });

      cityOrderTableBody.innerHTML = rowsHtml;
    }

    populateMstSummaryModal() {
      const state = this.state.getState();
      const modalBody = this.elements.modalMstSummaryBody;
      if (!modalBody) return;

      const snap = state.currentSnapshot || (state.snapshots && state.snapshots[state.snapshots.length - 1]);
      if (!snap) {
        modalBody.innerHTML = '<p class="narrative-empty">No MST simulation data available yet.</p>';
        return;
      }

      const orderList = snap.cityOrder || [];
      const mstEdges = snap.mstEdges || [];
      const nodeMap = new Map();
      state.graph.nodes.forEach(n => nodeMap.set(n.id, n.name || n.id));
      const totalKm = snap.totalCost || 0;
      const budget = totalKm * state.costPerKm;

      // Identify omitted cables
      const mstEdgeIdSet = new Set(mstEdges.map(e => e.id));
      const omittedEdges = state.graph.edges.filter(e => !mstEdgeIdSet.has(e.id));

      let sequencePillsHtml = orderList.map(c => `
        <span class="seq-pill">
          <span class="seq-num">#${c.order}</span>
          <span class="seq-name">${escapeHtml(c.cityName)}</span>
          ${c.cableDist > 0 ? `<span class="seq-dist">+${c.cableDist}km</span>` : '<span class="seq-dist">Hub</span>'}
        </span>
      `).join('<span class="seq-arrow">➜</span>');

      let orderRowsHtml = orderList.map(c => `
        <tr>
          <td><span class="action-badge ${c.order === 1 ? 'badge-start' : 'badge-added'}">#${c.order}</span></td>
          <td><strong>${escapeHtml(c.cityName)}</strong></td>
          <td>${c.order === 1 ? '<em>Initial Starting Hub</em>' : escapeHtml(c.cableText)}</td>
          <td>${c.order === 1 ? '—' : `${c.cableDist} km`}</td>
          <td>${c.cumulativeDist} km</td>
        </tr>
      `).join('');

      let omittedRowsHtml = omittedEdges.length === 0 ?
        '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 8px;">None — Every optical cable in the network was part of the MST.</td></tr>' :
        omittedEdges.map(e => {
          const uName = nodeMap.get(e.u) || e.u;
          const vName = nodeMap.get(e.v) || e.v;
          return `
            <tr>
              <td>${escapeHtml(uName)} ↔ ${escapeHtml(vName)}</td>
              <td>${e.w} km</td>
              <td><span class="pq-badge pq-badge-cycle">Redundant Cycle</span></td>
              <td style="color: var(--text-muted); font-size: 0.78rem;">Both cities joined via cheaper paths; cable safely omitted to avoid optical loops.</td>
            </tr>
          `;
        }).join('');

      modalBody.innerHTML = `
        <div class="summary-section">
          <h4 class="summary-heading">1. Chronological City Connection Sequence</h4>
          <div class="summary-sequence-flow">
            ${sequencePillsHtml}
          </div>
        </div>

        <div class="summary-metrics-grid">
          <div class="summary-stat-card">
            <span class="stat-label">Total Cities Interconnected</span>
            <span class="stat-val text-emerald">${orderList.length} / ${state.graph.nodes.length} Cities</span>
          </div>
          <div class="summary-stat-card">
            <span class="stat-label">Total Optical Fibre Laid</span>
            <span class="stat-val text-emerald">${totalKm} km (${mstEdges.length} Cables)</span>
          </div>
          <div class="summary-stat-card">
            <span class="stat-label">Total CapEx Cost (@ ₹${state.costPerKm.toLocaleString('en-IN')}/km)</span>
            <span class="stat-val text-cyan">${formatIndianRupees(budget)}</span>
          </div>
          <div class="summary-stat-card">
            <span class="stat-label">Redundant Ring Cables Omitted</span>
            <span class="stat-val text-amber">${omittedEdges.length} Cables (${omittedEdges.reduce((s, e) => s + e.w, 0)} km saved)</span>
          </div>
        </div>

        <div class="summary-section">
          <h4 class="summary-heading">2. Detailed City Connection Ledger</h4>
          <div class="summary-table-wrapper">
            <table class="summary-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>City Name</th>
                  <th>Connection Cable</th>
                  <th>Cable Distance</th>
                  <th>Cumulative Network Distance</th>
                </tr>
              </thead>
              <tbody>
                ${orderRowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <div class="summary-section">
          <h4 class="summary-heading">3. Omitted Ring & Mesh Cross-Cables (Cycle Prevention)</h4>
          <div class="summary-table-wrapper">
            <table class="summary-table">
              <thead>
                <tr>
                  <th>Cable Route</th>
                  <th>Distance</th>
                  <th>Status</th>
                  <th>Algorithmic Rationale</th>
                </tr>
              </thead>
              <tbody>
                ${omittedRowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    getMstSummaryPlainText() {
      const state = this.state.getState();
      const snap = state.currentSnapshot || (state.snapshots && state.snapshots[state.snapshots.length - 1]);
      if (!snap) return "No MST simulation data available.";

      const orderList = snap.cityOrder || [];
      const mstEdges = snap.mstEdges || [];
      const nodeMap = new Map();
      state.graph.nodes.forEach(n => nodeMap.set(n.id, n.name || n.id));
      const totalKm = snap.totalCost || 0;
      const budget = totalKm * state.costPerKm;

      let text = `=== Minimum Spanning Tree: Final City Order & Cable Summary ===\n\n`;
      text += `Total Connected Cities: ${orderList.length} / ${state.graph.nodes.length}\n`;
      text += `Total Optical Cable Distance: ${totalKm} km\n`;
      text += `Total CapEx Budget: ₹ ${budget.toLocaleString('en-IN')}\n\n`;
      text += `Chronological City Connection Order:\n`;
      orderList.forEach(c => {
        text += `  #${c.order}. ${c.cityName} (${c.order === 1 ? 'Start Hub' : `${c.cableText}, ${c.cableDist} km`} | Cumulative: ${c.cumulativeDist} km)\n`;
      });

      text += `\nMST Optical Cables Selected (${mstEdges.length} cables):\n`;
      mstEdges.forEach((e, idx) => {
        const u = nodeMap.get(e.u) || e.u;
        const v = nodeMap.get(e.v) || e.v;
        text += `  ${idx + 1}. ${u} ↔ ${v} (${e.w} km)\n`;
      });

      return text;
    }

    renderMetrics(state) {
      const {
        metricConnectedCities,
        metricCableDistance,
        metricTotalBudget,
        metricEfficiency
      } = this.elements;

      const totalNodes = state.graph.nodes.length;
      let connected = 0;
      let totalDist = 0;

      if (state.mode === 'visualize' && state.currentSnapshot) {
        const snap = state.currentSnapshot;
        connected = snap.visited ? snap.visited.length : 0;
        totalDist = snap.totalCost || 0;
      }

      const totalBudget = totalDist * state.costPerKm;

      if (metricConnectedCities) {
        metricConnectedCities.textContent = `${connected} / ${totalNodes}`;
      }

      if (metricCableDistance) {
        metricCableDistance.textContent = `${totalDist} km`;
      }

      if (metricTotalBudget) {
        metricTotalBudget.textContent = formatIndianRupees(totalBudget);
      }

      if (metricEfficiency) {
        if (state.mode === 'visualize' && state.currentSnapshot) {
          const snap = state.currentSnapshot;
          if (snap.status === 'done') {
            metricEfficiency.textContent = "100% Optimal MST";
            metricEfficiency.className = "metric-value text-emerald";
          } else if (snap.status === 'disconnected') {
            metricEfficiency.textContent = "Disconnected Island";
            metricEfficiency.className = "metric-value text-amber";
          } else {
            metricEfficiency.textContent = "In Progress...";
            metricEfficiency.className = "metric-value text-cyan";
          }
        } else {
          metricEfficiency.textContent = "Ready";
          metricEfficiency.className = "metric-value";
        }
      }
    }

    renderCodeViewer(state) {
      const { codeContainer, langTabContainer } = this.elements;
      if (!codeContainer) return;

      const langKey = state.codeLang || 'js';
      const snippet = this.codeSnippets[langKey] || this.codeSnippets.js;
      if (!snippet) return;

      // Update active tab buttons
      if (langTabContainer) {
        const tabs = langTabContainer.querySelectorAll('[data-lang]');
        tabs.forEach(tab => {
          tab.classList.toggle('active', tab.getAttribute('data-lang') === langKey);
        });
      }

      // Determine line to highlight
      let highlightLineNumber = null;
      if (state.mode === 'visualize' && state.currentSnapshot) {
        const action = state.currentSnapshot.action;
        if (snippet.lineMap && snippet.lineMap[action]) {
          highlightLineNumber = snippet.lineMap[action];
        }
      }

      let codeHtml = '<div class="code-lines">';
      snippet.lines.forEach((lineText, idx) => {
        const lineNum = idx + 1;
        const isHighlight = (lineNum === highlightLineNumber);

        codeHtml += `
          <div class="code-line ${isHighlight ? 'code-line-highlight' : ''}" data-line="${lineNum}">
            <span class="line-number">${lineNum}</span>
            <span class="line-content">${highlightSyntax(lineText, langKey)}</span>
          </div>
        `;
      });
      codeHtml += '</div>';

      codeContainer.innerHTML = codeHtml;

      // Scroll active line into view smoothly
      if (highlightLineNumber) {
        const activeLineEl = codeContainer.querySelector(`[data-line="${highlightLineNumber}"]`);
        if (activeLineEl) {
          activeLineEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }

    renderVariables(state) {
      const { varVisited, varCurrentEdge, varQueueCount, varTotalCost } = this.elements;
      if (!varVisited) return;

      if (state.mode !== 'visualize' || !state.currentSnapshot) {
        varVisited.textContent = "{}";
        if (varCurrentEdge) varCurrentEdge.textContent = "None";
        if (varQueueCount) varQueueCount.textContent = "0";
        if (varTotalCost) varTotalCost.textContent = "0 km";
        return;
      }

      const snap = state.currentSnapshot;
      const nodeMap = new Map();
      state.graph.nodes.forEach(n => nodeMap.set(n.id, n.name || n.id));

      const visitedNames = (snap.visited || []).map(id => nodeMap.get(id) || id);
      varVisited.textContent = `{ ${visitedNames.join(', ')} }`;

      if (varCurrentEdge) {
        if (snap.status === 'done') {
          varCurrentEdge.textContent = "Complete (All cities joined)";
        } else if (snap.considered) {
          const u = nodeMap.get(snap.considered.u) || snap.considered.u;
          const v = nodeMap.get(snap.considered.v) || snap.considered.v;
          varCurrentEdge.textContent = `${u} ↔ ${v} (${snap.considered.w} km)`;
        } else if (snap.rejectedEdge) {
          const u = nodeMap.get(snap.rejectedEdge.u) || snap.rejectedEdge.u;
          const v = nodeMap.get(snap.rejectedEdge.v) || snap.rejectedEdge.v;
          varCurrentEdge.textContent = `${u} ↔ ${v} [Discarded Loop]`;
        } else {
          varCurrentEdge.textContent = "None";
        }
      }

      if (varQueueCount) {
        if (snap.status === 'done') {
          const rem = (snap.queue || []).length;
          varQueueCount.textContent = rem > 0 ? `0 active (${rem} omitted loops)` : 'Empty (Done)';
        } else {
          varQueueCount.textContent = `${(snap.queue || []).length} candidate cables`;
        }
      }

      if (varTotalCost) {
        varTotalCost.textContent = `${snap.totalCost || 0} km`;
      }
    }
  }

  function formatIndianRupees(val) {
    if (isNaN(val) || val === 0) return "₹ 0";
    const str = Math.round(val).toString();
    const lastThree = str.substring(str.length - 3);
    const otherNumbers = str.substring(0, str.length - 3);
    const formatted = otherNumbers !== '' ?
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree :
      lastThree;
    return `₹ ${formatted}`;
  }

  function highlightSyntax(code, lang) {
    // Single-pass tokenizer to prevent replacing injected HTML attributes (such as class="...")
    const tokenRegex = /(\/\/[^\n]*|#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b(function|const|let|var|return|if|else|while|for|of|new|import|def|in|include|using|namespace|public|static|class|continue|sum)\b|\b(Set|Map|MinPriorityQueue|heapq|heapify|heappush|heappop|vector|queue|priority_queue|unordered_set|MSTResult|Graph|Edge|ArrayList|List|HashSet|PriorityQueue|Comparator|int|greater)\b|\b(true|false|null|None)\b|\b(\d+)\b/g;

    let lastIndex = 0;
    let result = '';
    let match;

    while ((match = tokenRegex.exec(code)) !== null) {
      if (match.index > lastIndex) {
        result += escapeHtml(code.slice(lastIndex, match.index));
      }

      const [full, comment, str, keyword, type, bool, num] = match;
      if (comment) {
        result += `<span class="tok-comment">${escapeHtml(comment)}</span>`;
      } else if (str) {
        result += `<span class="tok-str">${escapeHtml(str)}</span>`;
      } else if (keyword) {
        result += `<span class="tok-keyword">${escapeHtml(keyword)}</span>`;
      } else if (type) {
        result += `<span class="tok-type">${escapeHtml(type)}</span>`;
      } else if (bool) {
        result += `<span class="tok-bool">${escapeHtml(bool)}</span>`;
      } else if (num) {
        result += `<span class="tok-number">${escapeHtml(num)}</span>`;
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < code.length) {
      result += escapeHtml(code.slice(lastIndex));
    }

    return result;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return Renderer;
});

