# Fibre Optic Network Design with Prim's Algorithm — Documentation (`docs.md`)

## 1. Project Overview
**Fibre Optic Network Design** is an interactive, browser-based educational application built for Algorithm Design courses. It visualizes how **Prim's Algorithm** finds the Minimum Spanning Tree (MST) to connect a network of cities using minimum optical fibre cable distance and cost.

The application is completely static (HTML5, modern CSS3, vanilla JavaScript) with **zero build step and zero backend dependencies**. It runs simply by opening `index.html` directly in any modern web browser or served via any static web server (GitHub Pages, Netlify, Vercel, Python HTTP server).

---

## 2. System Architecture & Component Design

### 2.1 Directory Structure
```
/
├── index.html              # Main application shell with semantic layout & panels
├── css/
│   └── style.css           # Dark fibre optic theme, layout grid, animations & glows
├── js/
│   ├── minHeap.js          # Min-Priority Queue implementation
│   ├── prim.js             # Prim's Algorithm with step-by-step snapshot generation
│   ├── state.js            # Unified state management & undo/redo history
│   ├── graphCanvas.js      # Interactive SVG canvas (node/edge drag, creation, edit)
│   ├── player.js           # Playback engine (Play, Pause, Step Next/Prev, Scrubber)
│   ├── render.js           # DOM & SVG renderer for snapshots, queue, code & stats
│   ├── storage.js          # JSON import/export, localStorage & URL hash sharing
│   ├── quiz.js             # Quiz engine with explanation breakdown & score tracking
│   └── app.js              # Application entry point, tabs & modal controllers
├── data/
│   ├── presets.js          # Predefined network topologies (Kerala, Small, Medium, Star)
│   ├── codeSnippets.js     # Multilingual algorithm implementations (JS, Python, C++, Java)
│   └── quizQuestions.js    # Interactive conceptual & algorithmic quiz bank
├── tests/
│   ├── prim.test.js        # Node.js automated test runner for Prim's algorithm
│   └── prim.test.html      # Browser-based test verification runner
├── plan.md                 # Project implementation plan
├── docs.md                 # System documentation & execution log
└── README.md               # Quickstart guide & project overview
```

### 2.2 Design Principles
1. **Separation of Computation and Animation:**
   - Prim's algorithm runs *once* synchronously to generate an immutable chronological list of **snapshots**.
   - The visualizer acts strictly as a deterministic state player over the snapshots list.
2. **True Double-Click Portability:**
   - Universal module design that works natively over `file://` (no CORS restrictions) and supports CommonJS for automated unit testing in Node.js.
3. **Fibre Optic Theming:**
   - High-contrast dark theme (`#080c14` background), cyan (`#00f0ff`) laser pulses, neon green (`#00ff88`) chosen cables, warm amber (`#ffb800`) active considerations, and subdued grey inactive connections.
4. **Resilience & Graceful Degradation:**
   - Handles disconnected components by warning the learner and extracting a Minimum Spanning Forest.
   - Comprehensive input validation preventing self-loops, negative/zero weights, duplicate edges, and invalid city identifiers.

---

## 3. Data Structures & Schemas

### 3.1 Graph Schema
```json
{
  "nodes": [
    { "id": "Kochi", "name": "Kochi Hub", "x": 200, "y": 270 }
  ],
  "edges": [
    { "id": "e5", "u": "Thrissur", "v": "Kochi", "w": 75 }
  ]
}
```

### 3.2 Snapshot Schema
Each step of the algorithm captures an immutable snapshot:
```json
{
  "step": 7,
  "action": "addToMst",
  "status": "added",
  "visited": ["Kochi", "Thrissur"],
  "currentNode": "Thrissur",
  "mstEdges": [{ "id": "e5", "u": "Kochi", "v": "Thrissur", "w": 75 }],
  "queue": [
    { "edgeId": "e4", "u": "Thrissur", "v": "Palakkad", "w": 70 }
  ],
  "considered": { "edgeId": "e5", "u": "Kochi", "v": "Thrissur", "w": 75 },
  "rejectedEdge": null,
  "totalCost": 75,
  "message": "Connected! Cable Kochi ↔ Thrissur (75 km) added to MST. City Thrissur joined the network. Total cable: 75 km.",
  "stats": {
    "visitedCount": 2,
    "totalNodes": 8,
    "mstEdgeCount": 1,
    "queueSize": 3
  }
}
```

---

## 4. Phase-by-Phase Execution Status

| Phase | Description | Status | Verification |
|---|---|---|---|
| **Phase 1: Foundation** | Layout, dark fibre theme CSS variables, responsive panels, top tabs | ✅ Complete | Semantic panels, glowing cyber aesthetics, full responsive grid |
| **Phase 2: Graph Editor** | SVG canvas, drag & drop, node/cable creation, presets, undo/redo, randomizer | ✅ Complete | Node drag, cable drafting, distance validation, 6 network presets |
| **Phase 3: Algorithm Engine** | MinHeap, Prim snapshot generator, disconnected handler, test suite | ✅ Complete | 9 / 9 unit tests passing in Node.js & browser test runner |
| **Phase 4: Step Player & Visual Sync** | Prev/Play/Next/Scrubber, edge glows, queue table, code highlight sync | ✅ Complete | Snapshots drive canvas glowing beams, min-heap table & variables |
| **Phase 5: Content & Polish** | Multilingual code (JS/Py/C++/Java), theory guide, quiz, JSON import/export, URL hash | ✅ Complete | Full educational theory notes, 10 quiz questions, hash sharing |
| **Phase 6: Verification & Delivery** | Cross-platform test, test suite execution, final documentation | ✅ Complete | Automated test run, zero-build double-click verified |

---

## 5. Technical Implementation Details

### 5.1 Priority Queue (`js/minHeap.js`)
- Standard array-backed Binary Min-Heap with $O(\log N)$ push and pop operations.
- Supports custom comparator functions (default comparing `.w` edge distance).
- Features non-destructive `.getSortedItems()` method for inspecting the queue in true priority order on the UI table.

### 5.2 Prim's Engine (`js/prim.js`)
- Accepts any graph `{ nodes, edges }` and an optional `startNodeId`.
- Enforces Cut Property: always expands from the set of currently visited vertices.
- Tracks edge endpoints to properly identify the newly connected vertex in undirected networks.
- Distinguishes between:
  - `start`: initial hub vertex selection.
  - `candidate`: pushing incident edges into the Min-Priority Queue.
  - `considered`: popping minimum edge from queue for evaluation.
  - `added`: successfully appending to MST when the other vertex is unvisited.
  - `rejected`: discarding cross-cut edges when both vertices are already visited (loop avoidance).
  - `done`: full spanning tree formed with $V - 1$ edges.
  - `disconnected`: priority queue emptied with isolated components remaining.
- Computes connected components via breadth-first search for diagnostic reporting.

### 5.3 Graph Editor & Interactive Canvas (`js/graphCanvas.js`)
- Inline responsive SVG with SVG filter definitions (`glow-cyan`, `glow-emerald`, `glow-amber`).
- Event-driven mouse and touch interactions:
  - Click empty space to add new city with name prompt.
  - Drag node to reposition dynamically.
  - Drag between nodes (or tap node A then node B on mobile) to lay an optical cable with distance prompt.
  - Double click node to rename; double click edge badge to update distance.
  - Delete key deletes selected city or cable.
  - Live animated optical pulses on chosen MST edges (`stroke-dasharray` and CSS keyframe flow).

### 5.4 State Machine & History (`js/state.js`)
- Immutable history stacks (`undoStack`, `redoStack`) with up to 30 steps of undo/redo.
- Keyboard shortcuts (`Ctrl+Z`, `Ctrl+Y`).
- Deterministic simulation lifecycle (`edit` mode $\leftrightarrow$ `visualize` mode).
- Random graph generator producing topologically valid, planar-spaced network graphs.

### 5.5 Multilingual Code Viewer & Algorithm Trace (`js/render.js`, `data/codeSnippets.js`)
- Displays code in JavaScript, Python 3, C++ (STL), and Java.
- Uses semantic line-mapping (`lineMap`) so that each algorithm decision (`startVisit`, `pushStartNeighbors`, `popMin`, `skipVisited`, `addToMst`, `pushNeighbors`, `finish`) highlights the corresponding line in real-time.
- Programmatically validated across all 4 programming languages to ensure that all line numbers fall strictly within line boundaries.
- **Robust Single-Pass Tokenizer:** Parses code using a single-pass regex matching stream to completely eliminate HTML attribute collision bugs (such as sequential regex passes matching `class` within previously inserted `<span class="...">` attributes).
- Rich syntax highlighting for keywords, standard library types (`Set`, `vector`, `priority_queue`, `heapq`, `PriorityQueue`), string literals (`.tok-str`), comments, and numbers.

### 5.6 Storage, Export & URL Sharing (`js/storage.js`)
- `exportGraphJSON`: Generates formatted `.json` file for download.
- `parseAndValidateGraph`: Validates JSON schema, removes self-loops, and normalizes weights.
- `encodeGraphToURL` / `decodeGraphFromURL`: Base64 compressed representation in URL hash (`#...`) allowing instant link sharing without backend servers.
- `localStorage`: Persists user customizations and quiz results.

### 5.7 Quiz Engine (`js/quiz.js`, `data/quizQuestions.js`)
- 10 conceptual and algorithmic questions covering MST definitions, Cut Property, time complexity with heaps, Kruskal comparison, disconnected components, and telecom ring protection.
- Instant pedagogical feedback with explanation breakdowns.
- Final rank scoring (Apprentice, Technician, Senior Engineer, Chief Architect).

### 5.8 Single-Screen Viewport Architecture & Docked Right-Bottom Player
- **Zero-Scroll Layout:** The Visualizer dashboard fits entirely within `100vh` viewport height (`height: 100vh; overflow: hidden`), eliminating vertical page scrolling.
- **Left Column:** SVG network canvas with top editing toolbar and an integrated bottom HUD bar containing plain-English step explanations and real-time network telemetry (Connected Cities, Total Cable, Capital Budget in ₹, MST status).
- **Right Column:**
  - **Top:** Multilingual algorithm code trace card (`.code-viewer-card`).
  - **Middle:** Compact Priority Queue (Min-Heap) and Variables Scope inspector (`.inspector-card`).
  - **Right Bottom:** Compact Player Controller (`.player-card`) anchored permanently in place with timeline scrubber, step badge, speed slider, playback buttons (`⏮ ◀ ▶ ⏸ ▶ ⏭ ↺`), and mode switchers (`✏️ Edit Graph`, `▶ Calculate MST`).
- **Independent Scroll Architecture for Theory & Quiz:** While the visualizer tab is strictly locked to `overflow: hidden` for single-screen ergonomics, `#tab-panel-theory` and `#tab-panel-quiz` are configured with `height: 100%; overflow-y: auto !important;` and custom laser-styled scrollbars, allowing all 6 theory sections, comparison tables, and quiz questions to scroll smoothly without ever being clipped or stuck.

### 5.9 Priority Queue Dynamics & Hub-Spoke Completion Handling
- **Dynamic Queue Status Indicators:**
  - Replaced static `"Waiting"` labels with contextual city-aware and cycle-aware status indicators:
    - `★ Next: Connects [City]`: Lowest-weight edge queued, next to connect an unvisited city.
    - `2nd: Route to [City]`: Runner-up candidate connecting the same target city with higher cost.
    - `Alt route to [City]`: Alternative candidate edge reaching a city already targeted by a cheaper queued edge.
    - `Loop ([City] already joined)`: Candidate whose target endpoint is already part of the MST cut (will be discarded upon pop to prevent cycles).
    - `Omitted (Loop avoided)`: Displayed when the algorithm completes and remaining queue entries represent redundant cyclic cables.
- **Core Exchange (Hub & Spoke) Completion Resolution:**
  - In star topologies like `Core Exchange Hub`, all peripheral nodes connect directly to the central hub via spokes of lower weights than the outer rim cables. Once $V - 1$ edges are selected, the MST is mathematically complete, but heavier rim cables remain inside the binary heap.
  - To prevent learner confusion (previously appearing as though the algorithm stalled while rim cables remained marked active/cyan):
    - Visualizer dynamically shifts non-MST cables to `.edge-dim` styling with badge text updated to `w km (Omitted)`.
    - Remaining queue items transition to amber `.pq-badge-omitted` badges (`Omitted (Loop avoided)`).
    - HUD message clearly explains: *"Minimum Spanning Tree Complete! All N cities connected with N-1 optical cables. Remaining queued cables are redundant and safely omitted to prevent expensive loops."*
    - Variables inspector displays `0 active (K omitted loops)`.
### 5.10 Chronological City Connection Sequence & Ring/Mesh Topology Visualization
- **Live Chronological City Order Tracking (`cityOrder`):**
  - Prim's snapshot recorder (`js/prim.js`) tracks the immutable arrival sequence of every city entering the MST cut:
    - Order #1: Initial Start Hub (`startId`).
    - Order #2 through #V: Successive destination cities joined via popped minimum cables.
    - Each record preserves: `{ order, cityId, cityName, cableText, edgeId, cableDist, cumulativeDist, step }`.
- **Dedicated "City Order" Inspector Tab:**
  - Added a dedicated 3rd inspector tab in the sidebar right alongside the Priority Queue:
    - Shows live-updating arrival sequence with order badges (`#1`, `#2`, ...), active city indicators, connection cable route, individual cable distance, and running cumulative network distance.
- **On-Canvas Sequence Badges & Cable Order:**
  - In `js/graphCanvas.js`:
    - Each connected node displays an emerald glowing numerical badge: `#1`, `#2`, `#3`... at `(-14, -14)` on the SVG node.
    - Each selected MST cable badge displays its chronological selection rank: `#1 • 15 km`, `#2 • 17 km`, etc.
    - Dynamic width calculations for node labels and cable distance badges prevent text clipping.
- **Full MST Results & Final City Order Modal:**
  - A dedicated modal dialog (`#modal-mst-summary`) accessible via the HUD `"📋 MST Summary"` button or upon completion:
    - Visual sequence flow ticker with chronological city pills (`#1 Central Metro ➜ #2 North Gateway ➜ ...`).
    - Comprehensive city connection ledger with exact cable routes and distances.
    - Omitted Ring/Mesh Cross-Cables table explaining why redundant cables were skipped to avoid loops.
    - Telemetry metrics (Total Cities Interconnected, Total Optical Cable Laid, CapEx Budget in ₹, Total Cable Saved).
    - One-click copy summary button for course homework and reports.
- **Regional Ring & Mesh Topology & Spoke Completion (`presets.medium`):**
  - Resolved missing cross-connect cables by adding direct links from central hub `Central Metro (N1)` to `West Valley (N7)` (`20 km`) and `Northeast Tech (N3)` (`23 km`).
  - Restored full radial spoke mesh connectivity across all 7 perimeter cities (`N2` North, `N3` Northeast, `N4` East, `N5` South, `N6` Southwest, `N7` West, `N8` Northwest).
- **SVG Filter Zero-Area Bounding-Box Bug Fix (Vertical/Horizontal Cables):**
  - Resolved an SVG rendering bug where perfectly vertical lines (`x1 === x2`, like `Central Metro (350, 230)` to `North Gateway (350, 65)`) or horizontal lines (`y1 === y2`) had zero bounding-box area (`width = 0`).
  - Standard SVG filters with `filterUnits="objectBoundingBox"` (`filter="url(#glow-emerald)"`) produced a 0-pixel filter subregion in Chromium and Firefox, causing vertical MST lines to vanish completely while their badges remained visible.
  - Replaced inline SVG line filters with CSS `filter: drop-shadow(...)` on `.edge-chosen .edge-line`, `.edge-considered .edge-line`, and `.edge-candidate .edge-line`. This renders high-intensity laser glows uniformly across all angles, orientations, and coordinates without bounding-box clipping.
- **Top Bar Overflow & Responsive Layout Engineering:**
  - Compacted branding to `FIBRE MST [Prim's]` and streamlined navigation tab labels (`Visualizer`, `Theory`, `Quiz`).
  - Constrained `<select>` dropdown max-widths (`145px` on desktop down to `85px` on mobile) with `text-overflow: ellipsis` so long topology names or city hub titles never push controls outside the viewport.
  - Implemented progressive responsive breakpoints at `1240px`, `1040px`, `820px`, and `650px`:
    - At `< 1240px`: Button text labels collapse to sleek icon buttons (`[🔗]`, `[💾]`, `[📂]`).
    - At `< 1040px`: Redundant control labels (`Topo:`, `Start:`) and the secondary rate input are hidden.
    - At `< 820px` & `< 650px`: Brand tags and titles scale down, guaranteeing zero overflow on laptops and smaller screens.

---

## 6. Verification & Automated Test Results

The test suite in `tests/prim.test.js` was executed using Node.js:

```
=== Running Prim's Algorithm Engine Unit Tests ===

Testing MinHeap Priority Queue:
  ✓ MinHeap basic push, peek, pop ordering
  ✓ MinHeap getSortedItems returns sorted array without modifying heap

Testing Prim's Algorithm Engine:
  ✓ Textbook 5-node graph computes correct MST cost
  ✓ Start-node invariance: Total MST cost is identical regardless of starting city
  ✓ Kerala Fibre Grid preset solves to valid MST with V-1 edges
  ✓ Disconnected graph detection and component reporting
  ✓ Cycle prevention: snapshots record rejected edges
  ✓ Single node graph edge case
  ✓ Equal edge weights graph handled deterministically without errors

Testing Algorithm Code Trace & Snippet Line Mappings:
  ✓ Algorithm actions have valid line mappings across all 4 programming languages
  ✓ Snapshots generated by Prim's engine contain non-null line and action properties
  ✓ City connection sequence (cityOrder) records chronological arrival for all cities

========================================
Results: 12 / 12 tests passed.
========================================
```

In addition, `tests/prim.test.html` is provided for in-browser visual testing.

---

## 7. How to Demo & Deliver
1. **Direct Run:** Open `index.html` in any web browser.
2. **Local Server (Optional):** Run `python3 -m http.server 8000` and visit `http://localhost:8000`.
3. **Run Unit Tests:** Execute `node tests/prim.test.js`.

