# Implementation Plan: Fibre Optic Network Design with Prim's Algorithm

**Version: Static site (plain HTML, CSS, JavaScript, no build step, no backend)**

A website for an Algorithm Design course. Learners build a network of cities, set cable distances as weights, click **Calculate**, and watch Prim's algorithm build the minimum cost spanning tree step by step, with the code highlighted alongside.

---

## 1. Concept

A learner builds a network of cities, sets cable distances (weights), and clicks **Calculate**. The site runs Prim's algorithm one step at a time, highlighting the code line being executed while the graph, priority queue, and total cost update live.

Fibre theme:

- Cities are nodes
- Candidate cables are dim lines
- Chosen cables glow like light pulses
- The final MST is the cheapest cable layout

---

## 2. Why Static

- Prim's runs entirely in the browser, so no server or database is needed
- Free hosting (GitHub Pages, Netlify, Vercel) and near-zero maintenance
- Can be opened by double-clicking `index.html`, which makes it easy to submit or demo
- Nothing to install or build

**Not possible with static:** user accounts, server-side score storage, shared or collaborative graphs.
**Still possible:** progress saved per browser with `localStorage`, JSON save/load via file download/upload, shareable links (graph encoded in the URL).

---

## 3. Page Layout

| Area | Content |
|---|---|
| **Main panel (centre/left)** | SVG canvas: click to add a city, drag to move it, drag between two cities to add a cable, then enter the distance |
| **Side panel (right)** | Code viewer with the current line highlighted, plus a variables box (visited set, current edge, total) |
| **Bottom panel** | Step controls (Prev / Play / Next / speed slider / Reset), step explanation sentence, priority queue table, total cost |
| **Top tabs** | Theory, Visualizer, Quiz (simple show/hide sections, no router) |

On mobile, the side panel stacks below the canvas.

---

## 4. Core Technical Idea

Do not animate while the algorithm runs. Instead:

1. Run Prim's **once** and record a list of **step snapshots**.
2. The UI is a **player over that list**. Next / Prev / Play / slider all mean "render snapshot `i`".

Benefits: step-back, jump-to-step, and replay are trivial; algorithm logic stays separate from UI; code highlight can never drift because each snapshot carries its line number.

### Snapshot shape

```js
{
  step: 7,
  line: 12,                       // code line to highlight
  visited: ["Kochi", "Aluva"],
  mstEdges: [{ u: "Kochi", v: "Aluva", w: 12 }],
  queue: [{ u: "Aluva", v: "Angamaly", w: 9 }],
  considered: { u: "Aluva", v: "Angamaly", w: 9 },
  status: "added",                // added | rejected | candidate
  totalCost: 12,
  message: "Edge Aluva-Angamaly (9 km) is the cheapest candidate, so add it."
}
```

### Where snapshots are pushed

1. Pick start node
2. Push neighbours of the newly visited node into the queue
3. Pop the minimum edge
4. Skip if the far end is already visited (rejected)
5. Add the edge to the MST and update cost
6. Finish (all nodes visited, or queue empty)

---

## 5. Tech Stack (no build step)

| Concern | Choice |
|---|---|
| Markup / styling | Plain HTML + CSS (CSS variables for the dark fibre theme) |
| Logic | Vanilla JavaScript using ES modules (`<script type="module">`) |
| Graph canvas | Inline SVG, hand-written drag and click handlers |
| Code panel | Prism.js from a CDN (or hand-made `<pre>` with per-line `<span>` for easy highlighting) |
| State | One plain JS object plus a `render()` function |
| Persistence | `localStorage` (progress), JSON file download/upload (graphs), URL hash (share links) |
| Testing | Small test page or Node script for `prim.js` (no framework needed) |
| Hosting | GitHub Pages, Netlify, or Vercel (static) |

Note: ES modules need a local server (e.g. VS Code Live Server or `python -m http.server`) when testing from `file://`. If true double-click opening is required, use a single `app.js` with no imports.

---

## 6. Folder Structure

```
fibre-mst/
  index.html
  css/
    style.css            # theme tokens, layout, edge/node states
  js/
    app.js               # init, tabs, wiring
    state.js             # graph + player state
    prim.js              # Prim's + snapshot recorder
    minHeap.js           # priority queue
    graphCanvas.js       # SVG add/move/delete nodes and edges
    player.js            # prev/play/next/speed/reset
    render.js            # draws snapshot: graph, queue table, cost, code line
    storage.js           # localStorage, JSON import/export, URL share
    quiz.js
  data/
    presets.js           # sample networks (incl. Kerala districts)
    codeSnippets.js      # JS / Python / C++ / Java with line maps
    quizQuestions.js
  tests/
    prim.test.html       # or prim.test.js for Node
  README.md
```

---

## 7. Phases and Tasks

### Phase 1: Foundation (1-2 days)
- [ ] Create `index.html` with main, side, and bottom panels
- [ ] Dark fibre theme (CSS variables: cyan/green glow, dim grey edges)
- [ ] Tab switching between Theory / Visualizer / Quiz

### Phase 2: Graph Editor (3 days)
- [ ] Click to add a city with a name (default A, B, C)
- [ ] Drag to move cities
- [ ] Drag between two cities to create a cable; weight input popup
- [ ] Edit and delete nodes and edges
- [ ] Validation: no zero or negative weights, no duplicate edges, no self-loops
- [ ] Presets: small (5 nodes), medium (8 nodes), Kerala districts example
- [ ] Clear canvas and undo

### Phase 3: Algorithm Engine (2 days)
- [ ] Implement min-heap
- [ ] Implement Prim's with snapshot recording
- [ ] Start-city parameter
- [ ] Handle disconnected graphs: "network not fully connectable" message, or minimum spanning forest
- [ ] Tests: known graphs, single node, disconnected, equal weights, total cost independent of start node

### Phase 4: Step Player and Visual Sync (3 days)
- [ ] Controls: Prev / Play / Pause / Next / Reset / speed slider / scrubber
- [ ] Edge states: **normal, candidate, considered, chosen, rejected**
- [ ] Node states: unvisited, visited, current
- [ ] Priority queue table synced to snapshot
- [ ] Running total cost (km and optional ₹ via cost-per-km input)
- [ ] Code line highlighting synced to snapshot
- [ ] Variables box and plain-English explanation per step
- [ ] Lock editing during a run; "Edit again" returns to edit mode

### Phase 5: Content and Polish (2-3 days)
- [ ] Theory: why MST for fibre, how Prim's works, pseudocode, complexity O(E log V), comparison with Kruskal's
- [ ] Code tabs: JavaScript, Python, C++, Java (static, line-mapped to step numbers)
- [ ] Quiz: 8-10 questions with explanations; score saved in `localStorage`
- [ ] JSON save/load and shareable URL link
- [ ] Responsive layout and mobile tap-to-select mode
- [ ] Accessibility: keyboard controls, ARIA labels, colour-blind safe states (dashed/solid/thick plus text labels)

### Phase 6: Test and Deploy (1 day)
- [ ] Cross-browser test (Chrome, Firefox, Safari, Edge)
- [ ] Mobile and tablet check
- [ ] Performance check with 20-30 nodes
- [ ] Deploy to GitHub Pages / Netlify / Vercel
- [ ] README with usage notes

**Estimated total: 10-14 working days for one developer.**

---

## 8. Feature Suggestions

**High value (v1 if time allows)**
- Start-city selector (order changes, total cost stays the same)
- Explanation sentence per step
- Cost in ₹ via a cost-per-km input
- Random graph generator
- Save/load graph as JSON

**Later versions**
- Predict-the-next-edge mode (learner clicks the edge Prim's will pick)
- Auto distance from on-screen pixel distance, with manual override
- Kruskal's tab to compare on the same graph
- Editable, runnable code using Pyodide (still static, runs in the browser)

---

## 9. Key Decision: "Code Runs on the Side"

| Option | Description | Effort | Recommendation |
|---|---|---|---|
| **Trace-only** | Code is displayed and highlighted as the algorithm progresses | Low | **Use for v1** |
| **Editable and runnable** | Learner edits code and runs it; visuals follow | High | Later version |

---

## 10. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Code highlight drifts from visuals | Snapshots carry the line number (single source of truth) |
| Disconnected graphs confuse learners | Clear message, plus optional spanning forest result |
| Cluttered canvas with many edges | Cap nodes (e.g. 15), weight labels with background, zoom/pan |
| Mobile drag is fiddly | Tap-to-select mode as an alternative to drag |
| Colour-only state cues | Line styles and text labels in addition to colour |
| Vanilla JS grows messy | Keep modules small; `state.js` + one `render()` function as the only way UI updates |
| ES modules fail on `file://` | Use a local server, or bundle into a single `app.js` |

---

## 11. Definition of Done (v1)

- A user can build a graph, pick a start city, and click Calculate
- Prim's runs step by step with working Prev / Next / Play / Reset
- Graph, queue table, cost, explanation, and code highlight stay in sync at every step
- Disconnected and invalid inputs are handled gracefully
- Theory page and quiz are complete
- Works on desktop and mobile, deployed as a static site at a public URL

---

## 12. Open Questions

1. Is the audience undergrads, self-learners, or interview prep?
2. Trace-only or runnable code for v1?
3. Must it open by double-click (single file, no modules), or is a local server fine?
4. Any deadline or team size that changes the phase timeline?
