/**
 * Network presets for Fibre Optic MST Visualizer
 * Compatible with browser (window.FibreMST.presets) and Node.js (module.exports)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FibreMST = root.FibreMST || {};
    root.FibreMST.presets = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    kerala: {
      name: "Kerala Fibre Grid (KFON)",
      description: "Major regional optical backbone across Kerala districts with realistic road/rail distances (km).",
      startNode: "Kochi",
      nodes: [
        { id: "Trivandrum", name: "Thiruvananthapuram", x: 260, y: 520 },
        { id: "Kollam", name: "Kollam", x: 220, y: 440 },
        { id: "Alappuzha", name: "Alappuzha", x: 190, y: 360 },
        { id: "Kochi", name: "Kochi Hub", x: 200, y: 270 },
        { id: "Thrissur", name: "Thrissur", x: 250, y: 190 },
        { id: "Palakkad", name: "Palakkad", x: 380, y: 180 },
        { id: "Kozhikode", name: "Kozhikode", x: 170, y: 110 },
        { id: "Kannur", name: "Kannur", x: 120, y: 40 }
      ],
      edges: [
        { id: "e1", u: "Kannur", v: "Kozhikode", w: 90 },
        { id: "e2", u: "Kozhikode", v: "Thrissur", w: 120 },
        { id: "e3", u: "Kozhikode", v: "Palakkad", w: 130 },
        { id: "e4", u: "Palakkad", v: "Thrissur", w: 70 },
        { id: "e5", u: "Thrissur", v: "Kochi", w: 75 },
        { id: "e6", u: "Kochi", v: "Alappuzha", w: 55 },
        { id: "e7", u: "Alappuzha", v: "Kollam", w: 85 },
        { id: "e8", u: "Kollam", v: "Trivandrum", w: 65 },
        { id: "e9", u: "Kochi", v: "Palakkad", w: 145 },
        { id: "e10", u: "Kochi", v: "Kollam", w: 140 },
        { id: "e11", u: "Thrissur", v: "Alappuzha", w: 125 }
      ]
    },

    small: {
      name: "Textbook Example (5 Cities)",
      description: "Classic 5-node weighted graph ideal for learning step-by-step priority queue decisions.",
      startNode: "A",
      nodes: [
        { id: "A", name: "City A", x: 120, y: 140 },
        { id: "B", name: "City B", x: 340, y: 80 },
        { id: "C", name: "City C", x: 500, y: 200 },
        { id: "D", name: "City D", x: 380, y: 380 },
        { id: "E", name: "City E", x: 150, y: 330 }
      ],
      edges: [
        { id: "e1", u: "A", v: "B", w: 4 },
        { id: "e2", u: "A", v: "E", w: 8 },
        { id: "e3", u: "B", v: "C", w: 8 },
        { id: "e4", u: "B", v: "E", w: 11 },
        { id: "e5", u: "C", v: "D", w: 2 },
        { id: "e6", u: "C", v: "E", w: 7 },
        { id: "e7", u: "D", v: "E", w: 4 }
      ]
    },

    medium: {
      name: "Regional Ring & Mesh (8 Cities)",
      description: "An 8-city telecom network with multiple redundant ring cables and cross-connects.",
      startNode: "N1",
      nodes: [
        { id: "N1", name: "Central Metro", x: 350, y: 230 },
        { id: "N2", name: "North Gateway", x: 350, y: 65 },
        { id: "N3", name: "Northeast Tech", x: 535, y: 115 },
        { id: "N4", name: "East Port", x: 565, y: 275 },
        { id: "N5", name: "South Hub", x: 385, y: 395 },
        { id: "N6", name: "Southwest Coast", x: 175, y: 385 },
        { id: "N7", name: "West Valley", x: 115, y: 235 },
        { id: "N8", name: "Northwest Park", x: 165, y: 100 }
      ],
      edges: [
        { id: "e1", u: "N1", v: "N2", w: 15 },
        { id: "e2", u: "N2", v: "N3", w: 22 },
        { id: "e3", u: "N3", v: "N4", w: 20 },
        { id: "e4", u: "N4", v: "N5", w: 25 },
        { id: "e5", u: "N5", v: "N6", w: 18 },
        { id: "e6", u: "N6", v: "N7", w: 19 },
        { id: "e7", u: "N7", v: "N8", w: 16 },
        { id: "e8", u: "N8", v: "N2", w: 17 },
        { id: "e9", u: "N1", v: "N4", w: 24 },
        { id: "e10", u: "N1", v: "N6", w: 21 },
        { id: "e11", u: "N1", v: "N8", w: 19 },
        { id: "e12", u: "N1", v: "N5", w: 23 },
        { id: "e13", u: "N1", v: "N7", w: 20 },
        { id: "e14", u: "N1", v: "N3", w: 23 }
      ]
    },

    dense: {
      name: "Dense Multi-Route Grid (6 Cities)",
      description: "A highly connected 6-node network showing frequent queue updates and edge rejections.",
      startNode: "X1",
      nodes: [
        { id: "X1", name: "Alpha", x: 180, y: 120 },
        { id: "X2", name: "Beta", x: 420, y: 110 },
        { id: "X3", name: "Gamma", x: 530, y: 280 },
        { id: "X4", name: "Delta", x: 380, y: 440 },
        { id: "X5", name: "Epsilon", x: 170, y: 420 },
        { id: "X6", name: "Zeta", x: 70, y: 260 }
      ],
      edges: [
        { id: "e1", u: "X1", v: "X2", w: 10 },
        { id: "e2", u: "X2", v: "X3", w: 12 },
        { id: "e3", u: "X3", v: "X4", w: 15 },
        { id: "e4", u: "X4", v: "X5", w: 14 },
        { id: "e5", u: "X5", v: "X6", w: 8 },
        { id: "e6", u: "X6", v: "X1", w: 18 },
        { id: "e7", u: "X1", v: "X3", w: 14 },
        { id: "e8", u: "X2", v: "X4", w: 26 },
        { id: "e9", u: "X2", v: "X5", w: 19 },
        { id: "e10", u: "X6", v: "X4", w: 20 },
        { id: "e11", u: "X1", v: "X4", w: 30 }
      ]
    },

    star: {
      name: "Hub & Spoke Topology (6 Cities)",
      description: "A central aggregation point connecting satellite districts, testing direct edge selection.",
      startNode: "HUB",
      nodes: [
        { id: "HUB", name: "Core Exchange", x: 320, y: 260 },
        { id: "S1", name: "Sub-Station 1", x: 320, y: 80 },
        { id: "S2", name: "Sub-Station 2", x: 500, y: 170 },
        { id: "S3", name: "Sub-Station 3", x: 460, y: 410 },
        { id: "S4", name: "Sub-Station 4", x: 180, y: 410 },
        { id: "S5", name: "Sub-Station 5", x: 140, y: 170 }
      ],
      edges: [
        { id: "e1", u: "HUB", v: "S1", w: 25 },
        { id: "e2", u: "HUB", v: "S2", w: 30 },
        { id: "e3", u: "HUB", v: "S3", w: 28 },
        { id: "e4", u: "HUB", v: "S4", w: 22 },
        { id: "e5", u: "HUB", v: "S5", w: 18 },
        { id: "e6", u: "S1", v: "S2", w: 35 },
        { id: "e7", u: "S2", v: "S3", w: 40 },
        { id: "e8", u: "S3", v: "S4", w: 32 },
        { id: "e9", u: "S4", v: "S5", w: 31 },
        { id: "e10", u: "S5", v: "S1", w: 29 }
      ]
    },

    disconnected: {
      name: "Disconnected Sub-Networks (Island Grid)",
      description: "Demonstrates graceful error handling and Spanning Forest when parts of the graph are isolated.",
      startNode: "IslandA1",
      nodes: [
        { id: "IslandA1", name: "Port City", x: 140, y: 160 },
        { id: "IslandA2", name: "Harbor Town", x: 260, y: 100 },
        { id: "IslandA3", name: "Coast Bay", x: 200, y: 320 },
        { id: "IslandB1", name: "Mountain Pass", x: 440, y: 160 },
        { id: "IslandB2", name: "Valley Base", x: 560, y: 260 },
        { id: "IslandB3", name: "Highland Peak", x: 430, y: 370 }
      ],
      edges: [
        // Component A
        { id: "e1", u: "IslandA1", v: "IslandA2", w: 14 },
        { id: "e2", u: "IslandA2", v: "IslandA3", w: 18 },
        { id: "e3", u: "IslandA1", v: "IslandA3", w: 12 },
        // Component B (No bridge connecting to A)
        { id: "e4", u: "IslandB1", v: "IslandB2", w: 20 },
        { id: "e5", u: "IslandB2", v: "IslandB3", w: 15 },
        { id: "e6", u: "IslandB1", v: "IslandB3", w: 25 }
      ]
    }
  };
});
