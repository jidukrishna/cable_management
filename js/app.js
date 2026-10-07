/**
 * Main Application Orchestrator
 * Connects State, Canvas, Player, Renderer, Quiz, Storage, and UI Controls.
 */
(function () {
  window.addEventListener('DOMContentLoaded', () => {
    const FibreMST = window.FibreMST || {};
    const {
      State,
      GraphCanvas,
      Player,
      Renderer,
      Quiz,
      storage,
      presets,
      quizQuestions,
      runPrimsAlgorithm
    } = FibreMST;

    if (!State || !GraphCanvas || !Player || !Renderer) {
      console.error("Critical FibreMST modules missing.");
      return;
    }

    // 1. Initialize State
    const appState = new State();

    // 2. DOM Elements Cache
    const el = {
      // Top Navigation & Tabs
      tabButtons: document.querySelectorAll('.nav-tab-btn'),
      tabPanels: document.querySelectorAll('.tab-panel'),
      selectPreset: document.getElementById('select-preset'),
      selectStartNode: document.getElementById('select-start-node'),
      inputCostPerKm: document.getElementById('input-cost-per-km'),
      btnShare: document.getElementById('btn-share-link'),
      btnExport: document.getElementById('btn-export-json'),
      btnImportTrigger: document.getElementById('btn-import-json'),
      fileInputImport: document.getElementById('file-input-import'),
      toastNotification: document.getElementById('toast-notification'),

      // Editor Toolbar
      panelEditorToolbar: document.getElementById('panel-editor-toolbar'),
      btnAddCity: document.getElementById('tool-add-city'),
      btnAddCable: document.getElementById('tool-add-cable'),
      btnUndo: document.getElementById('tool-undo'),
      btnRedo: document.getElementById('tool-redo'),
      btnRandomize: document.getElementById('tool-randomize'),
      btnClear: document.getElementById('tool-clear'),
      btnCalculate: document.getElementById('btn-calculate-mst'),
      btnPlayerCalc: document.getElementById('btn-player-calc'),

      // Playback Controls
      panelPlaybackControls: document.getElementById('panel-playback-controls'),
      btnEditMode: document.getElementById('btn-edit-mode'),
      btnFirst: document.getElementById('btn-first'),
      btnPrev: document.getElementById('btn-prev'),
      btnPlay: document.getElementById('btn-play'),
      btnNext: document.getElementById('btn-next'),
      btnLast: document.getElementById('btn-last'),
      btnReset: document.getElementById('btn-reset'),
      sliderStep: document.getElementById('slider-step'),
      sliderSpeed: document.getElementById('slider-speed'),
      speedLabel: document.getElementById('speed-label'),
      stepCounterBadge: document.getElementById('step-counter-badge'),

      // Narrative & Metrics
      narrativeBox: document.getElementById('narrative-box'),
      actionBadge: document.getElementById('action-badge'),
      metricConnectedCities: document.getElementById('metric-connected-cities'),
      metricCableDistance: document.getElementById('metric-cable-distance'),
      metricTotalBudget: document.getElementById('metric-total-budget'),
      metricEfficiency: document.getElementById('metric-efficiency'),

      // Priority Queue Table
      pqTableBody: document.getElementById('pq-table-body'),
      pqEmptyMsg: document.getElementById('pq-empty-msg'),

      // City Order Table
      cityOrderTableBody: document.getElementById('city-order-table-body'),
      cityOrderEmptyMsg: document.getElementById('city-order-empty-msg'),
      cityOrderBadge: document.getElementById('city-order-badge'),

      // Code Viewer
      codeContainer: document.getElementById('code-container'),
      langTabContainer: document.getElementById('lang-tabs'),

      // Variables Box
      varVisited: document.getElementById('var-visited'),
      varCurrentEdge: document.getElementById('var-current-edge'),
      varQueueCount: document.getElementById('var-queue-count'),
      varTotalCost: document.getElementById('var-total-cost'),

      // Summary Modal
      btnOpenMstSummary: document.getElementById('btn-open-mst-summary'),
      modalMstSummary: document.getElementById('modal-mst-summary'),
      modalMstSummaryBody: document.getElementById('modal-mst-summary-body'),
      btnCloseMstSummary: document.getElementById('btn-close-mst-summary'),
      btnCloseModalDone: document.getElementById('btn-close-modal-done'),
      btnCopyMstSummary: document.getElementById('btn-copy-mst-summary'),

      // Quiz Container
      quizContainer: document.getElementById('quiz-app-container')
    };

    // 3. Initialize Interactive Canvas
    const svgCanvasEl = document.getElementById('svg-network-canvas');
    const canvas = new GraphCanvas(svgCanvasEl, appState, { clickToAddNode: false });

    // 4. Initialize Player & Renderer
    const player = new Player(appState, el);
    const renderer = new Renderer(appState, el);

    // 5. Initialize Quiz
    let quizInstance = null;
    function initQuizIfNeeded() {
      if (!quizInstance && el.quizContainer && quizQuestions) {
        quizInstance = new Quiz(el.quizContainer, quizQuestions, storage);
      }
    }

    // 6. Bind Tab Switching
    el.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        el.tabButtons.forEach(b => b.classList.toggle('active', b === btn));
        el.tabPanels.forEach(p => {
          const match = p.id === `tab-panel-${targetTab}`;
          p.classList.toggle('active', match);
          p.style.display = match ? 'block' : 'none';
        });

        appState.setActiveTab(targetTab);

        if (targetTab === 'quiz') {
          initQuizIfNeeded();
        }
      });
    });

    // 6b. Inspector Tabs Switching (Priority Queue vs City Order vs Variables Scope)
    const inspTabs = document.querySelectorAll('.insp-tab-btn');
    const inspViewPq = document.getElementById('insp-view-pq');
    const inspViewOrder = document.getElementById('insp-view-order');
    const inspViewVars = document.getElementById('insp-view-vars');
    inspTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-insp');
        inspTabs.forEach(b => b.classList.toggle('active', b === btn));
        if (inspViewPq) inspViewPq.style.display = target === 'pq' ? 'block' : 'none';
        if (inspViewOrder) inspViewOrder.style.display = target === 'order' ? 'block' : 'none';
        if (inspViewVars) inspViewVars.style.display = target === 'vars' ? 'block' : 'none';
      });
    });

    // 6c. Modal MST Summary Bindings
    function openMstSummaryModal() {
      if (!el.modalMstSummary) return;
      renderer.populateMstSummaryModal();
      el.modalMstSummary.style.display = 'flex';
    }

    function closeMstSummaryModal() {
      if (!el.modalMstSummary) return;
      el.modalMstSummary.style.display = 'none';
    }

    if (el.btnOpenMstSummary) {
      el.btnOpenMstSummary.addEventListener('click', openMstSummaryModal);
    }
    if (el.btnCloseMstSummary) {
      el.btnCloseMstSummary.addEventListener('click', closeMstSummaryModal);
    }
    if (el.btnCloseModalDone) {
      el.btnCloseModalDone.addEventListener('click', closeMstSummaryModal);
    }
    if (el.modalMstSummary) {
      el.modalMstSummary.addEventListener('click', (e) => {
        if (e.target === el.modalMstSummary) closeMstSummaryModal();
      });
    }

    if (el.btnCopyMstSummary) {
      el.btnCopyMstSummary.addEventListener('click', () => {
        const summaryText = renderer.getMstSummaryPlainText();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(summaryText).then(() => {
            showToast("Copied MST summary & city sequence to clipboard! 📋");
          }).catch(() => {
            prompt("Copy MST Summary:", summaryText);
          });
        } else {
          prompt("Copy MST Summary:", summaryText);
        }
      });
    }

    // 7. Bind Presets Dropdown
    if (el.selectPreset && presets) {
      el.selectPreset.innerHTML = '<option value="" disabled selected>Load Network Preset...</option>';
      Object.keys(presets).forEach(key => {
        const p = presets[key];
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = p.name;
        el.selectPreset.appendChild(opt);
      });

      el.selectPreset.addEventListener('change', (e) => {
        const key = e.target.value;
        if (presets[key]) {
          appState.loadPreset(presets[key]);
          showToast(`Loaded preset: ${presets[key].name}`);
        }
      });
    }

    // 8. Bind Start City Dropdown
    function updateStartCityOptions(graph, currentStartId) {
      if (!el.selectStartNode) return;
      const previousValue = el.selectStartNode.value;
      el.selectStartNode.innerHTML = '';

      if (graph.nodes.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'No Cities Available';
        el.selectStartNode.appendChild(opt);
        return;
      }

      graph.nodes.forEach(n => {
        const opt = document.createElement('option');
        opt.value = n.id;
        opt.textContent = `${n.name} (${n.id})`;
        if (n.id === currentStartId) opt.selected = true;
        el.selectStartNode.appendChild(opt);
      });

      if (!currentStartId && graph.nodes.length > 0) {
        appState.setStartNode(graph.nodes[0].id);
      }
    }

    if (el.selectStartNode) {
      el.selectStartNode.addEventListener('change', (e) => {
        appState.setStartNode(e.target.value);
      });
    }

    // 9. Cost Per Km Rate Input
    if (el.inputCostPerKm) {
      const savedRate = storage.loadCostPerKm();
      appState.setCostPerKm(savedRate);
      el.inputCostPerKm.value = savedRate;

      el.inputCostPerKm.addEventListener('change', (e) => {
        const val = Number(e.target.value);
        if (val > 0) {
          appState.setCostPerKm(val);
          storage.saveCostPerKm(val);
        }
      });
    }

    // 10. Bind Editor Toolbar Actions
    if (el.btnAddCity) {
      el.btnAddCity.addEventListener('click', () => {
        const x = 340 + (Math.random() - 0.5) * 160;
        const y = 240 + (Math.random() - 0.5) * 160;
        canvas.promptCreateNode(x, y);
      });
    }

    if (el.btnAddCable) {
      el.btnAddCable.addEventListener('click', () => {
        if (appState.graph.nodes.length < 2) {
          alert("Please add at least 2 cities before laying optical cables.");
          return;
        }
        alert("To lay an optical cable:\n• Drag from one city to another, or\n• Tap the first city, then tap the second city.");
      });
    }

    if (el.btnUndo) {
      el.btnUndo.addEventListener('click', () => appState.undo());
    }

    if (el.btnRedo) {
      el.btnRedo.addEventListener('click', () => appState.redo());
    }

    if (el.btnRandomize) {
      el.btnRandomize.addEventListener('click', () => {
        appState.generateRandomGraph(7);
        showToast("Generated new random fibre grid");
      });
    }

    if (el.btnClear) {
      el.btnClear.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear the entire network canvas?")) {
          appState.clearGraph();
          showToast("Network canvas cleared");
        }
      });
    }

    // 11. Storage: Export, Import, Share Link
    if (el.btnExport) {
      el.btnExport.addEventListener('click', () => {
        storage.exportGraphJSON(appState.graph, 'fibre_network_grid.json');
        showToast("Exported network as JSON file");
      });
    }

    if (el.btnImportTrigger && el.fileInputImport) {
      el.btnImportTrigger.addEventListener('click', () => {
        el.fileInputImport.click();
      });

      el.fileInputImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = storage.parseAndValidateGraph(event.target.result);
            appState.setGraph(parsed);
            showToast("Successfully imported network configuration!");
          } catch (err) {
            alert(`Import failed: ${err.message}`);
          }
        };
        reader.readAsText(file);
        e.target.value = '';
      });
    }

    if (el.btnShare) {
      el.btnShare.addEventListener('click', () => {
        const hash = storage.encodeGraphToURL(appState.graph);
        const fullUrl = window.location.origin + window.location.pathname + hash;
        window.location.hash = hash;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(fullUrl).then(() => {
            showToast("Shareable link copied to clipboard! 📋");
          }).catch(() => {
            prompt("Copy this shareable link:", fullUrl);
          });
        } else {
          prompt("Copy this shareable link:", fullUrl);
        }
      });
    }

    // Toast helper
    function showToast(msg, duration = 3000) {
      if (!el.toastNotification) return;
      el.toastNotification.textContent = msg;
      el.toastNotification.classList.add('visible');
      setTimeout(() => {
        el.toastNotification.classList.remove('visible');
      }, duration);
    }

    // 12. Listen to state changes to update start node dropdown and undo/redo buttons
    appState.subscribe((state, eventType) => {
      updateStartCityOptions(state.graph, state.startNodeId);

      if (el.btnUndo) el.btnUndo.disabled = !state.canUndo || state.mode !== 'edit';
      if (el.btnRedo) el.btnRedo.disabled = !state.canRedo || state.mode !== 'edit';

      // Save to localStorage whenever graph changes in edit mode
      if (state.mode === 'edit' && ['graph_update', 'node_add', 'node_move', 'node_rename', 'node_delete', 'edge_add', 'edge_update', 'edge_delete', 'history'].includes(eventType)) {
        storage.saveGraphToLocalStorage(state.graph);
      }
    });

    // 13. Initial Boot: Check URL hash, else Kerala preset
    const sharedGraph = storage.decodeGraphFromURL();
    if (sharedGraph && sharedGraph.nodes.length > 0) {
      appState.setGraph(sharedGraph, false);
      showToast("Loaded network from shareable URL link");
    } else if (presets && presets.kerala) {
      appState.loadPreset(presets.kerala);
    } else {
      appState.generateRandomGraph(6);
    }

  });
})();

