
let subjects = [];
let conflicts = [];
let colors = [];

const palette = [
  "#e11d48", "#2563eb", "#16a34a",
  "#f59e0b", "#7c3aed", "#0891b2",
  "#db2777", "#475569"
];

// Add a new subject
function addSubject() {
  const input = document.getElementById("subjectName");
  const name = input.value.trim();

  if (!name) {
    showMessage("Please enter a subject name.");
    return;
  }

  if (subjects.some(s => s.toLowerCase() === name.toLowerCase())) {
    showMessage("Subject already exists.");
    return;
  }

  subjects.push(name);
  input.value = "";
  colors = [];

  updateAll();
  showMessage(name + " added successfully.");
}

// Add a conflict (graph edge)
function addConflict() {
  const a = document.getElementById("subject1").value;
  const b = document.getElementById("subject2").value;

  if (!a || !b) {
    showMessage("Add at least two subjects first.");
    return;
  }

  if (a === b) {
    showMessage("Select two different subjects.");
    return;
  }

  const exists = conflicts.some(edge =>
    (edge[0] === a && edge[1] === b) ||
    (edge[0] === b && edge[1] === a)
  );

  if (exists) {
    showMessage("This conflict already exists.");
    return;
  }

  conflicts.push([a, b]);
  colors = [];
  updateAll();
  showMessage("Conflict added between " + a + " and " + b);
}

// Build adjacency list
function buildGraph() {
  const graph = {};

  subjects.forEach(s => graph[s] = []);

  conflicts.forEach(([a, b]) => {
    graph[a].push(b);
    graph[b].push(a);
  });

  return graph;
}

// Greedy graph coloring algorithm
function greedyColoring() {
  const graph = buildGraph();
  const assigned = {};

  // Process subjects in descending degree order.
  // This is a greedy heuristic to handle highly
  // connected subjects earlier.
  const order = [...subjects].sort((a, b) =>
    graph[b].length - graph[a].length ||
    subjects.indexOf(a) - subjects.indexOf(b)
  );

  for (const subject of order) {
    const used = new Set();

    for (const neighbor of graph[subject]) {
      if (assigned[neighbor] !== undefined) {
        used.add(assigned[neighbor]);
      }
    }

    let color = 0;

    while (used.has(color)) {
      color++;
    }

    assigned[subject] = color;
  }

  return assigned;
}

// Generate timetable
function generateTimetable() {
  if (subjects.length === 0) {
    showMessage("Please add subjects first.");
    return;
  }

  colors = greedyColoring();
  renderResults();
  renderGraph();

  const count = Math.max(...Object.values(colors)) + 1;

  document.getElementById("slotCount").textContent =
    "Time slots used: " + count;

  showMessage("Timetable generated successfully!");
}

// Populate conflict dropdowns
function updateDropdowns() {
  const first = document.getElementById("subject1");
  const second = document.getElementById("subject2");

  const oldFirst = first.value;
  const oldSecond = second.value;

  first.innerHTML = '<option value="">Select subject</option>';
  second.innerHTML = '<option value="">Select subject</option>';

  subjects.forEach(s => {
    const option1 = document.createElement("option");
    option1.value = s;
    option1.textContent = s;
    first.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = s;
    option2.textContent = s;
    second.appendChild(option2);
  });

  first.value = subjects.includes(oldFirst) ? oldFirst : "";
  second.value = subjects.includes(oldSecond) ? oldSecond : "";
}

// Render graph nodes and conflict edges as a list
function renderGraph() {
  const container = document.getElementById("graph");
  container.innerHTML = "";

  if (subjects.length === 0) {
    container.textContent = "No subjects added yet.";
    return;
  }

  subjects.forEach((s, i) => {
    const node = document.createElement("div");
    node.className = "vertex";

    const colorIndex = colors[s];
    node.style.background =
      colorIndex === undefined
        ? "#64748b"
        : palette[colorIndex % palette.length];

    node.textContent = s;
    node.title = "Subject: " + s;
    container.appendChild(node);
  });

  const edgeBox = document.createElement("div");
  edgeBox.style.gridColumn = "1 / -1";
  edgeBox.style.width = "100%";
  edgeBox.style.background = "#f8fafc";
  edgeBox.style.padding = "12px";
  edgeBox.style.borderRadius = "7px";

  const heading = document.createElement("strong");
  heading.textContent = "Graph edges (conflicts)";
  edgeBox.appendChild(heading);

  if (conflicts.length === 0) {
    const p = document.createElement("p");
    p.textContent = "No conflicts defined.";
    edgeBox.appendChild(p);
  } else {
    conflicts.forEach(([a, b]) => {
      const p = document.createElement("p");
      p.textContent = a + " — " + b;
      p.style.margin = "7px 0";
      edgeBox.appendChild(p);
    });
  }

  container.appendChild(edgeBox);
}

// Render timetable table
function renderResults() {
  const tbody = document.getElementById("results");
  tbody.innerHTML = "";

  subjects.forEach(s => {
    const tr = document.createElement("tr");
    const colorIndex = colors[s];

    const subjectCell = document.createElement("td");
    subjectCell.textContent = s;

    const slotCell = document.createElement("td");
    slotCell.textContent =
      colorIndex === undefined
        ? "Not generated"
        : "Time Slot " + (colorIndex + 1);

    const colorCell = document.createElement("td");

    if (colorIndex !== undefined) {
      const tag = document.createElement("span");
      tag.className = "color-tag";
      tag.style.background =
        palette[colorIndex % palette.length];
      tag.textContent = "Slot " + (colorIndex + 1);
      colorCell.appendChild(tag);
    } else {
      colorCell.textContent = "—";
    }

    tr.append(subjectCell, slotCell, colorCell);
    tbody.appendChild(tr);
  });
}

// Render conflict list
function renderConflicts() {
  const list = document.getElementById("conflictList");
  list.innerHTML = "";

  if (conflicts.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No conflicts added.";
    list.appendChild(li);
    return;
  }

  conflicts.forEach(([a, b]) => {
    const li = document.createElement("li");
    li.textContent = a + " cannot be scheduled with " + b;
    list.appendChild(li);
  });
}

function updateAll() {
  updateDropdowns();
  renderGraph();
  renderResults();
  renderConflicts();

  document.getElementById("slotCount").textContent =
    "Time slots used: " +
    (Object.keys(colors).length
      ? Math.max(...Object.values(colors)) + 1
      : 0);
}

function showMessage(message) {
  document.getElementById("message").textContent = message;
}

// Sample dataset
function loadSample() {
  subjects = [
    "Math", "Physics", "Chemistry",
    "CS", "Biology", "English"
  ];

  conflicts = [
    ["Math", "Physics"],
    ["Math", "Chemistry"],
    ["Math", "CS"],
    ["Physics", "CS"],
    ["Physics", "Biology"],
    ["Chemistry", "CS"],
    ["Chemistry", "English"],
    ["CS", "Biology"],
    ["CS", "English"],
    ["Biology", "English"]
  ];

  colors = greedyColoring();
  updateAll();
  renderResults();

  const count = Math.max(...Object.values(colors)) + 1;
  document.getElementById("slotCount").textContent =
    "Time slots used: " + count;

  showMessage("Sample data loaded and timetable generated.");
}

// Reset everything
function resetAll() {
  subjects = [];
  conflicts = [];
  colors = [];

  updateAll();
  showMessage("All subjects and conflicts cleared.");
}

updateAll();