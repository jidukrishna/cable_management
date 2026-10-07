# Fibre Optic Network Design with Prim's Algorithm

An interactive educational website and algorithm visualization tool built for Computer Science & Algorithm Design courses. Designed with a dark fibre optic telecom theme, learners can construct regional optical networks, set cable distances in kilometres, select a central hub city, and observe **Prim's Algorithm** build the Minimum Spanning Tree (MST) step by step with synchronized code execution across JavaScript, Python, C++, and Java.

---

## 🌟 Key Features

### 1. Single-Screen Viewport Dashboard
- **Zero-Scroll Ergonomics:** The Visualizer dashboard fits entirely within `100vh` viewport height (`overflow: hidden`), eliminating vertical page scrolling.
- **Docked Right-Bottom Player:** Compact timeline player permanently anchored at the bottom right. The timeline scrubber, speed slider, playback controls, and mode switcher are always at your fingertips.
- **Integrated Canvas HUD:** The step-by-step narrative explanation and live network metrics (Connected Cities, Total Cable, Capital Budget in ₹, MST status) sit directly beneath the graph canvas.

### 2. Interactive SVG Network Canvas
- **Click & Create:** Add regional cities with customized names and geographic placement.
- **Laying Cables:** Drag between cities (or tap city A then city B on mobile/touch screens) to lay optical cables. Enter cable length in km.
- **Edit & Delete:** Drag cities dynamically, edit cable distances, rename nodes on double-click, and delete elements with the Delete key.
- **Undo & Redo:** Full history tracking (`Ctrl+Z`, `Ctrl+Y`) for seamless network experimentation.
- **Random Network Generator:** Automatically generates connected, geographically balanced test topologies.

### 3. Real-Time Optical Edge States
- 🌟 **Chosen:** Glowing neon emerald beam with flowing laser pulse animation.
- 🟡 **Evaluating:** Pulsing amber beam currently popped from the priority queue.
- 🔵 **Candidate:** Dashed cyan beam waiting inside the Min-Priority Queue.
- 🔴 **Cycle Discarded:** Dashed ruby beam discarded because the destination city is already connected.

### 4. Verified Multilingual Code Trace
- Trace line-by-line algorithm execution in **JavaScript**, **Python 3**, **C++ (STL)**, or **Java**.
- Active line highlights in real-time as each decision (enqueue, pop, cycle skip, MST addition, finish) occurs.
- Token syntax highlighting for keywords, standard library types (`Set`, `vector`, `priority_queue`, `heapq`, `PriorityQueue`, `Comparator`), numbers, and comments.

### 5. Telecom Economics & Priority Queue Telemetry
- **Priority Queue Inspector:** Inspect the live binary min-heap showing candidate cables with dynamic context badges.
- **City Connection Order:** Real-time chronological sequence tracking showing exactly which city joined when, via which cable route, and cumulative network distance.
- **On-Canvas Sequence Badges:** Glowing numerical order badges (`#1`, `#2`, `#3`, ...) on city nodes and cable selection sequence prefixes (`#1 • 15 km`).
- **Comprehensive MST Summary Modal:** Interactive breakdown detailing chronological sequence flow pills, connection ledger, omitted ring/mesh cables with cycle prevention rationales, and one-click copy summary.
- **Variables Scope:** Live inspection of the visited vertex set, candidate edges, and running total distance.
- **Network Budget Counter:** Calculates estimated capital trenching costs (e.g., ₹ 50,000/km) with live Indian rupee currency formatting.
- **Plain-English Step Narratives:** Explains the greedy choice and cut property for each decision.

### 6. Theory & Interactive Quiz
- **Curated Theory Guide:** Learn the engineering motivation, the Cut Property, complexity analysis ($O((V+E)\log V)$), and comparisons with Kruskal's algorithm.
- **10-Question Interactive Quiz:** Instant pedagogical explanations for each answer, score ranking, and persistent high scores in `localStorage`.

### 7. Sharing & Presets
- **Pre-built Topologies:** Includes Kerala Fibre Grid (KFON), Textbook 5-Node Graph, Regional Ring & Mesh (8 nodes), Dense Grid (6 nodes), Hub & Spoke, and Disconnected Islands.
- **URL Hash Sharing:** Share any custom-built graph via a compressed URL link.
- **JSON Export & Import:** Save networks to local `.json` files and load them anytime.

---

## ⌨️ Keyboard & Mouse Controls

| Action | Shortcut / Gesture | Mode |
|---|---|---|
| **Add City** | Click "➕ Add City" or double-click canvas | Edit Mode |
| **Lay Cable** | Drag between 2 cities, or tap City A then City B | Edit Mode |
| **Move City** | Drag city node | Edit Mode |
| **Rename City** | Double-click city node | Edit Mode |
| **Edit Cable Length** | Double-click cable distance badge | Edit Mode |
| **Delete Element** | Select element + `Delete` or `Backspace` | Edit Mode |
| **Undo / Redo** | `Ctrl+Z` / `Ctrl+Y` (or `Cmd+Z` / `Cmd+Y`) | Edit Mode |
| **Play / Pause** | `Space` | Visualize Mode |
| **Step Forward / Backward**| `→` (Right Arrow) / `←` (Left Arrow) | Visualize Mode |
| **Jump to Start / End** | `Home` / `End` | Visualize Mode |

---

## 🚀 How to Run

This is a **zero-build static site**. No Node.js build step, no npm packages, and no backend server are required!

### Option A: Direct Browser Open (Double Click)
Simply double-click `index.html` in your file explorer to open it directly in Google Chrome, Mozilla Firefox, Apple Safari, or Microsoft Edge.

### Option B: Local Static Server
If you prefer running a local HTTP server:

```bash
# Using Python 3:
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

---

## 🧪 Automated Testing

Automated unit tests verify the correctness of the Min-Priority Queue, Prim's algorithm engine, start-node invariance, disconnected island handling, cycle avoidance, edge cases, multilingual code line mappings, and chronological city order tracking.

### Running Tests in Terminal
```bash
node tests/prim.test.js
```

**Test Output:**
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

### Running Tests in Browser
Open `tests/prim.test.html` in any web browser to see visual test execution results.

---

## 📁 Project Structure

```
.
├── index.html              # Main application entry point & single-screen layout
├── css/
│   └── style.css           # Dark fibre theme, laser animations, and responsive layout
├── js/
│   ├── minHeap.js          # Min-Priority Queue implementation
│   ├── prim.js             # Prim's algorithm engine with snapshot recorder
│   ├── state.js            # Central state management, undo/redo, and simulation coordinator
│   ├── graphCanvas.js      # Interactive SVG canvas for network editing & rendering
│   ├── player.js           # Playback engine (Play, Pause, Step Next/Prev, Scrubber)
│   ├── render.js           # DOM & SVG synchronizer (narrative, queue, city order, code viewer)
│   ├── storage.js          # JSON export/import, localStorage & URL hash sharing
│   ├── quiz.js             # Quiz engine with instant explanations & score tracking
│   └── app.js              # Application orchestrator & event wiring
├── data/
│   ├── presets.js          # Topologies (KFON Kerala, Textbook, Ring, Dense, Star, Disconnected)
│   ├── codeSnippets.js     # Multilingual algorithm code (JS, Python, C++, Java) with line maps
│   └── quizQuestions.js    # 10 comprehensive quiz questions with pedagogical explanations
├── tests/
│   ├── prim.test.js        # Automated Node.js unit test suite (12/12 tests)
│   └── prim.test.html      # In-browser test runner
├── plan.md                 # Original architecture and implementation plan
├── docs.md                 # Detailed technical documentation and phase execution log
└── README.md               # User & developer guide
```

---

## 📜 Documentation
- Complete technical specifications and phase execution status: [`docs.md`](docs.md)
- Original design plan: [`plan.md`](plan.md)

---

## 📄 License
MIT License. Created for education in Computer Science and Algorithm Design.
