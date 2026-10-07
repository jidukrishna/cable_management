/**
 * Conceptual & Algorithmic Quiz Questions for Prim's Algorithm
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FibreMST = root.FibreMST || {};
    root.FibreMST.quizQuestions = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  return [
    {
      id: "q1",
      question: "What is the primary objective of finding a Minimum Spanning Tree (MST) in optical fibre layout?",
      options: [
        "To connect all cities with the absolute minimum total trenching and cable length without cycles",
        "To find the shortest single path between the two farthest cities in the network",
        "To create redundant cyclic loops so cable cuts do not disconnect any city",
        "To minimize the maximum cable bandwidth required at each network junction"
      ],
      correctIndex: 0,
      explanation: "An MST connects all V vertices in a connected graph using exactly V - 1 edges with the minimum possible total edge weight, creating a tree (connected, acyclic graph) that minimizes overall laying cost."
    },
    {
      id: "q2",
      question: "How does Prim's algorithm choose which edge to add at each step?",
      options: [
        "It picks the globally cheapest edge in the entire graph, regardless of where it connects",
        "It greedily selects the cheapest edge that connects a visited vertex to an unvisited vertex",
        "It uses Depth-First Search to find the deepest back-edge in the network",
        "It always connects the node that currently has the highest degree (number of connections)"
      ],
      correctIndex: 1,
      explanation: "Prim's algorithm grows a single tree from a starting vertex. At every step, it considers the 'cut' between visited and unvisited vertices and picks the minimum-weight cross-boundary edge (the Cut Property)."
    },
    {
      id: "q3",
      question: "If all edge weights in a connected graph are strictly distinct, what can we say about the MST?",
      options: [
        "There may still be multiple MSTs of identical total cost",
        "The graph cannot have any valid spanning tree",
        "The Minimum Spanning Tree is guaranteed to be unique",
        "Prim's algorithm will run in O(V) linear time"
      ],
      correctIndex: 2,
      explanation: "When all edge weights in a connected graph are distinct, the minimum weight edge crossing any cut is strictly unique, which guarantees that there is one and only one unique Minimum Spanning Tree."
    },
    {
      id: "q4",
      question: "What happens to the total MST cost if you choose a different starting city for Prim's algorithm on a connected graph?",
      options: [
        "The total cost may vary depending on how central the starting city is",
        "The total cost remains identical, although the order in which edges are added may differ",
        "The total cost will double if you start from an exterior leaf node",
        "The algorithm fails if the start node is not the minimum degree vertex"
      ],
      correctIndex: 1,
      explanation: "The total cost of the MST is an intrinsic property of the graph itself. Regardless of which vertex Prim's begins from, the resulting tree will always have the exact same minimum total weight."
    },
    {
      id: "q5",
      question: "What is the time complexity of Prim's algorithm using an adjacency list and a Binary Min-Heap?",
      options: [
        "O(V^2)",
        "O(V + E)",
        "O((V + E) log V)",
        "O(V! / E!)"
      ],
      correctIndex: 2,
      explanation: "Each vertex is inserted and extracted from the priority queue, taking O(V log V). Each edge is examined and can result in a priority queue push/decrease-key, taking O(E log V). Total running time is O((V + E) log V)."
    },
    {
      id: "q6",
      question: "When is Kruskal's algorithm generally preferred over Prim's algorithm?",
      options: [
        "On very dense graphs where E is close to V^2",
        "On sparse graphs where E is small (e.g. E ~ V) and edges are already sorted or easily sortable",
        "When the graph has directed optical amplifiers",
        "When the graph contains disconnected components and only one component needs to be connected"
      ],
      correctIndex: 1,
      explanation: "Kruskal's algorithm (using Disjoint Set / Union-Find) runs in O(E log E) or O(E log V). On sparse graphs where E is small, Kruskal's is very simple and fast. For dense graphs, Prim's (especially with Fibonacci heaps) is theoretically superior."
    },
    {
      id: "q7",
      question: "What occurs when Prim's algorithm is executed on a disconnected graph with 2 separate islands of cities?",
      options: [
        "The algorithm encounters an infinite loop and crashes",
        "It spans only the connected component containing the start node; other cities remain unvisited",
        "It automatically inserts imaginary zero-weight edges across the gap",
        "It throws a negative cycle exception"
      ],
      correctIndex: 1,
      explanation: "Because Prim's grows a tree strictly via reachable edges, once the priority queue empties with unvisited nodes remaining, only the connected component of the starting city is spanned (requiring a Minimum Spanning Forest to span the rest)."
    },
    {
      id: "q8",
      question: "Does Prim's algorithm work correctly if some edge weights are negative?",
      options: [
        "Yes, Prim's algorithm correctly finds the MST even with negative edge weights (unlike Dijkstra)",
        "No, Prim's algorithm always fails if any weight is less than zero",
        "Only if there are no negative cycles in the graph",
        "Only if Kruskal's algorithm is run first to filter out the negative edges"
      ],
      correctIndex: 0,
      explanation: "Unlike Dijkstra's shortest path algorithm (which fails on negative edge weights), Prim's greedy choice property (the Cut Property) remains mathematically valid with negative weights. Adding a constant C to all weights preserves MST structure."
    },
    {
      id: "q9",
      question: "How does our visualizer prevent cycles when popping an edge (u, v) from the Priority Queue?",
      options: [
        "By running a Breadth-First Search check on the entire graph at every step",
        "By verifying whether the destination vertex 'v' has already been added to the 'visited' set",
        "By calculating the determinant of the Laplacian matrix",
        "By deleting edges whose weight is greater than the average degree"
      ],
      correctIndex: 1,
      explanation: "Since 'u' was already visited when its outgoing edges were pushed, if 'v' has also become visited by the time (u, v) is extracted, adding (u, v) would form a cycle between already-connected nodes. Hence, it is discarded."
    },
    {
      id: "q10",
      question: "In real-world mission-critical telecom engineering, why might a pure MST layout be modified with a few extra cables?",
      options: [
        "Because an MST has zero redundancy: any single cable cut partitions the network into two disconnected halves",
        "Because light cannot travel through a tree topology without bending loss",
        "Because optical switches cannot route packets without loops",
        "Because an MST requires more total cable than a complete mesh graph"
      ],
      correctIndex: 0,
      explanation: "While an MST minimizes upfront capital expenditure (CapEx), trees have a single point of failure (bridge edges). Real telecom operators often use an MST as a baseline and add selective ring closures to achieve 2-vertex connectivity (resilience)."
    }
  ];
});

