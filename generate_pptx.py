import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6] # blank layout

    # Color Palette
    BG_DARK = RGBColor(8, 12, 20)        # #080c14
    CARD_BG = RGBColor(15, 23, 42)       # #0f172a
    CARD_BORDER = RGBColor(30, 41, 59)   # #1e293b
    CYAN = RGBColor(0, 240, 255)         # #00f0ff
    EMERALD = RGBColor(0, 255, 136)      # #00ff88
    AMBER = RGBColor(255, 184, 0)        # #ffb800
    TEXT_LIGHT = RGBColor(241, 245, 249) # #f1f5f9
    TEXT_MUTED = RGBColor(148, 163, 184) # #94a3b8
    ACCENT_PURPLE = RGBColor(192, 132, 252)

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background() # no line
        return bg

    def add_header(slide, title_text, category_text, speaker_text, time_text):
        # Category / Speaker Pill
        pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.4), Inches(4.5), Inches(0.35))
        pill.fill.solid()
        pill.fill.fore_color.rgb = CARD_BG
        pill.line.color.rgb = CYAN
        pill.line.width = Pt(1)
        tf_pill = pill.text_frame
        tf_pill.word_wrap = True
        p_pill = tf_pill.paragraphs[0]
        p_pill.text = f"{speaker_text.upper()}  |  {time_text}"
        p_pill.font.size = Pt(10)
        p_pill.font.bold = True
        p_pill.font.color.rgb = CYAN
        p_pill.alignment = PP_ALIGN.LEFT

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.7), Inches(0.8))
        tf = title_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(24)
        p.font.bold = True
        p.font.color.rgb = TEXT_LIGHT

    def add_card(slide, left, top, width, height, title="", title_color=CYAN):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        card.line.width = Pt(1.5)

        if title:
            tb = slide.shapes.add_textbox(Inches(left + 0.2), Inches(top + 0.15), Inches(width - 0.4), Inches(0.4))
            tf = tb.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = title
            p.font.size = Pt(14)
            p.font.bold = True
            p.font.color.rgb = title_color
        return card

    # ==========================================
    # SLIDE 1: TITLE SLIDE
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)

    # Decorative Border / Card
    s1_card = add_card(s1, 1.2, 1.2, 10.933, 5.1, "", CYAN)

    tb = s1.shapes.add_textbox(Inches(1.8), Inches(1.8), Inches(9.7), Inches(3.8))
    tf = tb.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = "ALGORITHM DESIGN & OPTIMIZATION"
    p0.font.size = Pt(13)
    p0.font.bold = True
    p0.font.color.rgb = CYAN
    p0.space_after = Pt(14)

    p1 = tf.add_paragraph()
    p1.text = "Fibre Optic Network Design Using Prim's Algorithm"
    p1.font.size = Pt(32)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_LIGHT
    p1.space_after = Pt(12)

    p2 = tf.add_paragraph()
    p2.text = "Interactive Single-Screen Minimum Spanning Tree (MST) Visualizer & Real-World Infrastructure Modeling"
    p2.font.size = Pt(15)
    p2.font.color.rgb = TEXT_MUTED
    p2.space_after = Pt(36)

    p3 = tf.add_paragraph()
    p3.text = "Presented by: Team of 3  •  Duration: 10 Minutes  •  Live System Demonstration"
    p3.font.size = Pt(12)
    p3.font.bold = True
    p3.font.color.rgb = EMERALD

    # ==========================================
    # SLIDE 2: SPEAKER 1 - REAL-WORLD MOTIVATION
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "Real-World Engineering Motivation: Telecom Infrastructure", "Motivation", "Speaker 1", "0:00 - 1:15")

    # 3 Cards
    c1 = add_card(s2, 0.8, 1.8, 3.6, 5.0, "1. The High Cost of Cable", CYAN)
    tb1 = s2.shapes.add_textbox(Inches(1.0), Inches(2.4), Inches(3.2), Inches(4.2))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    for item in [
        "Trenching & laying optical fiber costs between ₹50,000 to ₹1,00,000 per kilometer.",
        "Budget constraints demand zero redundant cycles in the primary backbone.",
        "Every superfluous route wastefully burns millions of rupees in public infrastructure capex."
    ]:
        p = tf1.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    c2 = add_card(s2, 4.8, 1.8, 3.6, 5.0, "2. Full Interconnectivity", EMERALD)
    tb2 = s2.shapes.add_textbox(Inches(5.0), Inches(2.4), Inches(3.2), Inches(4.2))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    for item in [
        "All district administrative hubs and tech parks must be interconnected.",
        "Communication packets must travel between any city pair without network partition.",
        "Graph requirement: Connected, undirected weighted graph G = (V, E)."
    ]:
        p = tf2.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    c3 = add_card(s2, 8.8, 1.8, 3.6, 5.0, "3. Real Case: KFON Model", AMBER)
    tb3 = s2.shapes.add_textbox(Inches(9.0), Inches(2.4), Inches(3.2), Inches(4.2))
    tf3 = tb3.text_frame
    tf3.word_wrap = True
    for item in [
        "Modeled directly after the Kerala Fibre Optic Network (KFON).",
        "Connects 14 regional district headquarters from Trivandrum to Kannur.",
        "Demonstrates how graph theory delivers tangible societal & financial ROI."
    ]:
        p = tf3.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    # ==========================================
    # SLIDE 3: SPEAKER 1 - ALGORITHM FOUNDATION & CUT PROPERTY
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, "Theoretical Foundation: MST & The Cut Property", "Theory", "Speaker 1", "1:15 - 2:15")

    c_left = add_card(s3, 0.8, 1.8, 5.6, 5.0, "The Cut Property (Greedy Core)", CYAN)
    tb_l = s3.shapes.add_textbox(Inches(1.0), Inches(2.4), Inches(5.2), Inches(4.2))
    tf_l = tb_l.text_frame
    tf_l.word_wrap = True
    for item in [
        "Formal Definition: For any partition (cut) of vertices into sets S and V \\ S, the minimum-weight edge crossing the cut belongs to the MST.",
        "Greedy Invariant: At each iteration, Prim's grows a tree T from a single start vertex.",
        "The crossing edge (u ∈ T, v ∉ T) with minimum weight is safe to add without creating loops.",
        "Optimality Proof: Guaranteed global minimum total weight by induction."
    ]:
        p = tf_l.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    c_right = add_card(s3, 6.8, 1.8, 5.6, 5.0, "Tree Properties in Telecom", EMERALD)
    tb_r = s3.shapes.add_textbox(Inches(7.0), Inches(2.4), Inches(5.2), Inches(4.2))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True
    for item in [
        "Exactly |V| - 1 Cables: An 8-city regional grid requires exactly 7 optical connections.",
        "Acyclic Guarantee: Zero routing loops, eliminating broadcast storms in optical switches.",
        "Start-Node Invariance: Starting from Central Metro, North Gateway, or Kochi yields the exact same total cost.",
        "Minimum Total Cost: sum(w_e) for all e in T is minimized across all 2^E spanning subgraphs."
    ]:
        p = tf_r.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    # ==========================================
    # SLIDE 4: SPEAKER 1 - PRIM'S VS KRUSKAL'S
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, "Algorithm Comparison: Prim's vs. Kruskal's", "Comparison", "Speaker 1", "2:15 - 3:00")

    # Comparison Grid
    add_card(s4, 0.8, 1.8, 11.7, 5.0, "Why Prim's for Telecom Metro Networks?", CYAN)
    tb_comp = s4.shapes.add_textbox(Inches(1.0), Inches(2.4), Inches(11.3), Inches(4.2))
    tf_comp = tb_comp.text_frame
    tf_comp.word_wrap = True

    points = [
        ("Core Paradigm", "Vertex-centric growth (Prim's expands outward from a single active telecom hub) vs. Edge-centric forest merging (Kruskal's sorts all cables globally)."),
        ("Operational Realism", "Optical cables are deployed outward from an initial central exchange point (Hub-and-Spoke expansion). You don't lay isolated cables between remote towns before connecting the core."),
        ("Graph Density Advantage", "For dense urban meshes (E ≈ V²), Prim's with Fibonacci heap achieves O(E + V log V), outperforming Kruskal's O(E log E) sorting step."),
        ("Data Structure", "Prim's utilizes a Min-Priority Queue (Binary Heap) tracking candidate frontiers, whereas Kruskal's relies on a Disjoint Set Union (Union-Find) with path compression."),
        ("Handoff Note", "Speaker 2 will now explain how our application translates this mathematical engine into a deterministic single-screen visualizer.")
    ]
    for title, desc in points:
        p = tf_comp.add_paragraph()
        p.text = f"• {title}: {desc}"
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(10)

    # ==========================================
    # SLIDE 5: SPEAKER 2 - SYSTEM ARCHITECTURE
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, "Software Architecture: Static Zero-Build Engine", "Architecture", "Speaker 2", "3:00 - 4:00")

    # 3 Architecture Cards
    add_card(s5, 0.8, 1.8, 3.6, 5.0, "1. Separation of Concerns", CYAN)
    tb_a1 = s5.shapes.add_textbox(Inches(1.0), Inches(2.4), Inches(3.2), Inches(4.2))
    tf_a1 = tb_a1.text_frame
    tf_a1.word_wrap = True
    for item in [
        "Computation vs. Animation: Prim's runs synchronously once, creating immutable chronological snapshots.",
        "The player engine acts strictly as a deterministic state player over the snapshot array.",
        "Guarantees seamless Step Forward, Step Back, Scrubber jump, and Play/Pause."
    ]:
        p = tf_a1.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    add_card(s5, 4.8, 1.8, 3.6, 5.0, "2. Single-Screen Viewport", EMERALD)
    tb_a2 = s5.shapes.add_textbox(Inches(5.0), Inches(2.4), Inches(3.2), Inches(4.2))
    tf_a2 = tb_a2.text_frame
    tf_a2.word_wrap = True
    for item in [
        "100vh Zero-Scroll UI: The visualizer never forces page scrolling.",
        "Canvas on the left, Code Viewer & Priority Queue Inspector on the right.",
        "Docked bottom-right player controls remain pinned and accessible at all times."
    ]:
        p = tf_a2.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    add_card(s5, 8.8, 1.8, 3.6, 5.0, "3. Zero-Build Portability", ACCENT_PURPLE)
    tb_a3 = s5.shapes.add_textbox(Inches(9.0), Inches(2.4), Inches(3.2), Inches(4.2))
    tf_a3 = tb_a3.text_frame
    tf_a3.word_wrap = True
    for item in [
        "100% Vanilla JS, HTML5, and CSS3. Zero webpack, zero npm build dependencies.",
        "Runs instantly via double-click on index.html over file:// protocols.",
        "UMD module exports allow 100% automated headless unit testing in Node.js."
    ]:
        p = tf_a3.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    # ==========================================
    # SLIDE 6: SPEAKER 2 - MIN-PRIORITY QUEUE & SNAPSHOTS
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, "Core Data Structures: Priority Queue & Snapshot Engine", "Core Engine", "Speaker 2", "4:00 - 5:15")

    add_card(s6, 0.8, 1.8, 5.6, 5.0, "Binary Min-Heap Implementation", CYAN)
    tb_heap = s6.shapes.add_textbox(Inches(1.0), Inches(2.4), Inches(5.2), Inches(4.2))
    tf_heap = tb_heap.text_frame
    tf_heap.word_wrap = True
    for item in [
        "Custom MinHeap class storing candidate edges: { edgeId, u, v, w }.",
        "Push Operation: O(log N) bubble-up preserving the min-heap parent invariant.",
        "Pop Operation: O(log N) extract-min retrieving the cheapest optical cable.",
        "Non-destructive Inspection: getSortedItems() provides live sorted preview for the UI table without modifying heap state."
    ]:
        p = tf_heap.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    add_card(s6, 6.8, 1.8, 5.6, 5.0, "Immutable Snapshot Schema", EMERALD)
    tb_snap = s6.shapes.add_textbox(Inches(7.0), Inches(2.4), Inches(5.2), Inches(4.2))
    tf_snap = tb_snap.text_frame
    tf_snap.word_wrap = True
    for item in [
        "step & action: Tracks phase ('startVisit', 'popMin', 'addToMst', 'skipVisited').",
        "status: Triggers UI visual badges ('candidate', 'considered', 'added', 'rejected', 'done').",
        "cityOrder: Chronological arrival ledger recording exact order #1 through #V.",
        "activeLine: Synchronizes exact highlighted code line across JS, Python, C++, and Java.",
        "telemetry: Running cable length, capital capex budget in ₹, and visited set."
    ]:
        p = tf_snap.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    # ==========================================
    # SLIDE 7: SPEAKER 2 - STEP-BY-STEP VISUAL WALKTHROUGH
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7)
    add_header(s7, "Step-by-Step Visualization: Optical Edge States", "Visualization", "Speaker 2", "5:15 - 6:30")

    add_card(s7, 0.8, 1.8, 11.7, 5.0, "Visual State Language on the Interactive Canvas", CYAN)
    tb_vis = s7.shapes.add_textbox(Inches(1.0), Inches(2.4), Inches(11.3), Inches(4.2))
    tf_vis = tb_vis.text_frame
    tf_vis.word_wrap = True

    states = [
        ("🌟 CHOSEN (Laser Emerald #00ff88)", "Selected MST branch. High-intensity glowing line with flowing dash animation. Badge displays sequence rank (e.g., '#1 • 15 km')."),
        ("🟡 EVALUATING (Laser Amber #ffb800)", "Currently popped minimum candidate cable under inspection. Amber pulsing glow signals algorithmic decision-making."),
        ("🔵 CANDIDATE (Laser Cyan #00f0ff)", "Waiting inside the Min-Priority Queue. Dashed laser beam representing available cut-crossing cables."),
        ("🔴 CYCLE REJECTED (Laser Ruby #ef4444)", "Discarded redundant route. Red dashed line explaining that destination city has already joined the network cut."),
        ("⚪ OMITTED (Subdued Slate #1e293b)", "Preserved ring/mesh cross-connects shown faintly with '(Omitted)' tags to demonstrate loop-free spanning tree."),
        ("Handoff Note", "Speaker 3 will now explain our major engineering breakthroughs, mathematical complexity, and business impact.")
    ]
    for title, desc in states:
        p = tf_vis.add_paragraph()
        p.text = f"• {title}: {desc}"
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(8)

    # ==========================================
    # SLIDE 8: SPEAKER 3 - KEY ENGINEERING CHALLENGES
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8)
    add_header(s8, "Key Technical Challenges & Engineering Solutions", "Engineering", "Speaker 3", "6:30 - 7:45")

    add_card(s8, 0.8, 1.8, 3.6, 5.0, "1. The SVG Zero-Area Filter Bug", CYAN)
    tb_ch1 = s8.shapes.add_textbox(Inches(1.0), Inches(2.4), Inches(3.2), Inches(4.2))
    tf_ch1 = tb_ch1.text_frame
    tf_ch1.word_wrap = True
    for item in [
        "Bug: Perfectly vertical cables (x1 === x2, Central Metro to North Gateway) completely vanished from the screen.",
        "Root Cause: SVG objectBoundingBox filter calculates 0-width bounding box, clipping pixels to zero.",
        "Solution: Replaced inline SVG filters with CSS drop-shadow, guaranteeing 100% stroke visibility across all angles."
    ]:
        p = tf_ch1.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    add_card(s8, 4.8, 1.8, 3.6, 5.0, "2. Topology Spoke Symmetry", EMERALD)
    tb_ch2 = s8.shapes.add_textbox(Inches(5.0), Inches(2.4), Inches(3.2), Inches(4.2))
    tf_ch2 = tb_ch2.text_frame
    tf_ch2.word_wrap = True
    for item in [
        "Discovered missing cross-connect cables in the Regional Ring & Mesh preset.",
        "Engineered e13 (Central Metro ↔ West Valley, 20 km) and e14 (Central Metro ↔ Northeast Tech, 23 km).",
        "Completed full radial spoke symmetry across all 7 outer ring cities with zero badge overlap."
    ]:
        p = tf_ch2.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    add_card(s8, 8.8, 1.8, 3.6, 5.0, "3. Responsive Viewport", ACCENT_PURPLE)
    tb_ch3 = s8.shapes.add_textbox(Inches(9.0), Inches(2.4), Inches(3.2), Inches(4.2))
    tf_ch3 = tb_ch3.text_frame
    tf_ch3.word_wrap = True
    for item in [
        "Decoupled panel scrolling architecture (Visualizer locked at 100vh, Theory & Quiz fully scrollable).",
        "Progressive breakpoints (1240px, 1040px, 820px) preventing top-bar control overflow.",
        "Dropdown text truncation with ellipsis ensuring pristine presentation on any laptop or projector."
    ]:
        p = tf_ch3.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    # ==========================================
    # SLIDE 9: SPEAKER 3 - COMPLEXITY ANALYSIS
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9)
    add_header(s9, "Asymptotic Complexity & Data Structure Efficiency", "Complexity", "Speaker 3", "7:45 - 8:30")

    add_card(s9, 0.8, 1.8, 5.6, 5.0, "Time Complexity Breakdown", CYAN)
    tb_tc = s9.shapes.add_textbox(Inches(1.0), Inches(2.4), Inches(5.2), Inches(4.2))
    tf_tc = tb_tc.text_frame
    tf_tc.word_wrap = True
    for item in [
        "Building Adjacency List: O(V + E) upfront mapping.",
        "Heap Insertions: Every edge is enqueued at most twice (undirected) -> 2|E| insertions -> O(E log V).",
        "Heap Extractions: Extract-min performed for every candidate edge -> O(E log V).",
        "Total Time Complexity: O((V + E) log V).",
        "Dense Graphs vs Sparse: In regional telecom grids (sparse, E = O(V)), time reduces to O(V log V)."
    ]:
        p = tf_tc.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    add_card(s9, 6.8, 1.8, 5.6, 5.0, "Space Complexity & Invariant Verification", EMERALD)
    tb_sc = s9.shapes.add_textbox(Inches(7.0), Inches(2.4), Inches(5.2), Inches(4.2))
    tf_sc = tb_sc.text_frame
    tf_sc.word_wrap = True
    for item in [
        "Priority Queue Storage: O(E) maximum capacity in worst-case dense mesh.",
        "Visited Set & City Order: O(V) memory space.",
        "Total Space Complexity: O(V + E).",
        "Disconnected Graph Graceful Handling: Automatically detects unvisited components and yields a Spanning Forest.",
        "Verified Invariance: Automated tests verify identical MST cost regardless of starting hub."
    ]:
        p = tf_sc.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    # ==========================================
    # SLIDE 10: SPEAKER 3 - TELECOM ECONOMICS & ROI
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10)
    add_header(s10, "Economic Optimization: Trenching Capex & ROI", "Economics", "Speaker 3", "8:30 - 9:15")

    add_card(s10, 0.8, 1.8, 5.6, 5.0, "Capital Budget Telemetry", CYAN)
    tb_eco = s10.shapes.add_textbox(Inches(1.0), Inches(2.4), Inches(5.2), Inches(4.2))
    tf_eco = tb_eco.text_frame
    tf_eco.word_wrap = True
    for item in [
        "Live Indian Rupee (₹) Trenching Counter: Configurable cost per kilometer (default ₹50,000/km).",
        "Kerala KFON Case Study: Baseline full mesh requires 1,200+ km of trenching.",
        "Prim's MST Solution: Connects all 8 major hubs using only 510 km of optical fiber.",
        "Financial Savings: Saves over ₹3.45 Crores ($415,000 USD) in trenching capital expenditure."
    ]:
        p = tf_eco.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    add_card(s10, 6.8, 1.8, 5.6, 5.0, "Educational & Pedagogical Impact", EMERALD)
    tb_ped = s10.shapes.add_textbox(Inches(7.0), Inches(2.4), Inches(5.2), Inches(4.2))
    tf_ped = tb_ped.text_frame
    tf_ped.word_wrap = True
    for item in [
        "Multilingual Code Trace: Synchronized execution across JavaScript, Python 3, C++ STL, and Java.",
        "10-Question Interactive Quiz: Real-time feedback with Cut Property pedagogical rationales.",
        "Interactive Graph Editor: Students can draw custom topologies, add cities, drag nodes, and verify MST outputs.",
        "One-Click MST Summary Report: Instant clipboard export for laboratory assignments and reports."
    ]:
        p = tf_ped.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    # ==========================================
    # SLIDE 11: SPEAKER 3 - CONCLUSION & SUMMARY
    # ==========================================
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11)
    add_header(s11, "Project Summary & Key Takeaways", "Conclusion", "Speaker 3", "9:15 - 9:45")

    add_card(s11, 0.8, 1.8, 11.7, 5.0, "Core Achievements of our Project", CYAN)
    tb_sum = s11.shapes.add_textbox(Inches(1.0), Inches(2.4), Inches(11.3), Inches(4.2))
    tf_sum = tb_sum.text_frame
    tf_sum.word_wrap = True

    takeaways = [
        ("Bridging Theory and Practice", "Transformed an abstract textbook algorithm into a tangible, production-grade telecom engineering tool."),
        ("Robust Software Engineering", "Implemented immutable snapshot state machines, custom binary min-heaps, and resolved low-level SVG rendering engine bugs."),
        ("Zero Dependency Architecture", "Engineered a completely standalone, portable static application running seamlessly across any browser or device."),
        ("Comprehensive Automated Verification", "12/12 unit tests validating heap integrity, invariance, cycle prevention, and disconnected graph recovery.")
    ]
    for title, desc in takeaways:
        p = tf_sum.add_paragraph()
        p.text = f"• {title}: {desc}"
        p.font.size = Pt(13)
        p.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(14)

    # ==========================================
    # SLIDE 12: ALL SPEAKERS - Q&A
    # ==========================================
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background(s12)

    add_card(s12, 1.2, 1.2, 10.933, 5.1, "", CYAN)
    tb_qa = s12.shapes.add_textbox(Inches(1.8), Inches(1.8), Inches(9.7), Inches(3.8))
    tf_qa = tb_qa.text_frame
    tf_qa.word_wrap = True

    p_qa0 = tf_qa.paragraphs[0]
    p_qa0.text = "CONCLUSION & DEMONSTRATION"
    p_qa0.font.size = Pt(14)
    p_qa0.font.bold = True
    p_qa0.font.color.rgb = CYAN
    p_qa0.space_after = Pt(14)

    p_qa1 = tf_qa.add_paragraph()
    p_qa1.text = "Thank You! Questions & Discussion"
    p_qa1.font.size = Pt(36)
    p_qa1.font.bold = True
    p_qa1.font.color.rgb = TEXT_LIGHT
    p_qa1.space_after = Pt(14)

    p_qa2 = tf_qa.add_paragraph()
    p_qa2.text = "Live Demo Ready: Kerala KFON Backbone  |  Regional Ring & Mesh  |  Interactive Custom Topologies"
    p_qa2.font.size = Pt(15)
    p_qa2.font.color.rgb = EMERALD
    p_qa2.space_after = Pt(24)

    p_qa3 = tf_qa.add_paragraph()
    p_qa3.text = "Team Members: Speaker 1 (Theory)  •  Speaker 2 (Architecture & Demo)  •  Speaker 3 (Engineering & Complexity)"
    p_qa3.font.size = Pt(13)
    p_qa3.font.color.rgb = TEXT_MUTED

    # Save presentation
    output_path = "/home/jidu/temp/aad_web/fibre_mst_presentation.pptx"
    prs.save(output_path)
    print(f"Successfully generated PowerPoint presentation at: {output_path}")

if __name__ == "__main__":
    create_deck()
