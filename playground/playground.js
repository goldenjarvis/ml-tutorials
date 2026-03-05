/* global MLToolbox */

const registry = MLToolbox.graph.createBuiltinRegistry();
const nodeDefs = Object.values(registry);

const state = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  nodeCounter: 1,
};

const workspace = document.getElementById('workspace');
const edgesCanvas = document.getElementById('edges-canvas');
const palette = document.getElementById('palette');
const runOutput = document.getElementById('run-output');

const inspectorEmpty = document.getElementById('inspector-empty');
const inspectorForm = document.getElementById('inspector-form');
const nodeIdInput = document.getElementById('node-id');
const nodeTypeInput = document.getElementById('node-type');
const nodeScopeInput = document.getElementById('node-scope');
const nodeParamsInput = document.getElementById('node-params');

const fromNodeSelect = document.getElementById('from-node');
const fromPortSelect = document.getElementById('from-port');
const toNodeSelect = document.getElementById('to-node');
const toPortSelect = document.getElementById('to-port');
const edgeList = document.getElementById('edge-list');

const btnRun = document.getElementById('btn-run');
const btnAddEdge = document.getElementById('btn-add-edge');
const btnSaveNode = document.getElementById('btn-save-node');
const btnLoadExample = document.getElementById('btn-load-example');
const btnExport = document.getElementById('btn-export');
const btnImport = document.getElementById('btn-import');
const edgeDelayedInput = document.getElementById('edge-delayed');

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getNodeById = (id) => state.nodes.find((node) => node.id === id);

const createNodeElement = (node) => {
  const el = document.createElement('div');
  el.className = 'workspace-node';
  el.dataset.nodeId = node.id;
  el.style.left = `${node.position.x}px`;
  el.style.top = `${node.position.y}px`;

  const title = document.createElement('div');
  title.className = 'node-title';
  title.textContent = `${node.id} (${node.scope})`;

  const type = document.createElement('div');
  type.className = 'node-type';
  type.textContent = node.type;

  el.appendChild(title);
  el.appendChild(type);

  let dragOffset = null;

  const onPointerMove = (event) => {
    if (!dragOffset) {
      return;
    }

    const rect = workspace.getBoundingClientRect();
    const x = clamp(event.clientX - rect.left - dragOffset.dx, 0, rect.width - 180);
    const y = clamp(event.clientY - rect.top - dragOffset.dy, 0, rect.height - 70);

    node.position = { x, y };
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    redrawEdges();
  };

  const onPointerUp = () => {
    dragOffset = null;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  };

  el.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) {
      return;
    }

    selectNode(node.id);
    const rect = el.getBoundingClientRect();
    dragOffset = {
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top,
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  });

  el.addEventListener('click', () => selectNode(node.id));

  return el;
};

const renderNodes = () => {
  workspace.querySelectorAll('.workspace-node').forEach((nodeEl) => nodeEl.remove());
  state.nodes.forEach((node) => workspace.appendChild(createNodeElement(node)));
  highlightSelectedNode();
  redrawEdges();
};

const highlightSelectedNode = () => {
  workspace.querySelectorAll('.workspace-node').forEach((el) => {
    el.classList.toggle('selected', el.dataset.nodeId === state.selectedNodeId);
  });
};

const resizeCanvasToWorkspace = () => {
  const rect = workspace.getBoundingClientRect();
  edgesCanvas.width = rect.width;
  edgesCanvas.height = rect.height;
};

const nodeCenter = (nodeId) => {
  const node = getNodeById(nodeId);
  if (!node) {
    return { x: 0, y: 0 };
  }

  return {
    x: node.position.x + 90,
    y: node.position.y + 35,
  };
};

const redrawEdges = () => {
  resizeCanvasToWorkspace();
  const ctx = edgesCanvas.getContext('2d');
  ctx.clearRect(0, 0, edgesCanvas.width, edgesCanvas.height);
  ctx.lineWidth = 2;

  state.edges.forEach((edge) => {
    const from = nodeCenter(edge.from.node);
    const to = nodeCenter(edge.to.node);

    ctx.strokeStyle = edge.delay ? '#d97706' : '#2563eb';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    const midX = (from.x + to.x) / 2;
    ctx.bezierCurveTo(midX, from.y, midX, to.y, to.x, to.y);
    ctx.stroke();
  });
};

const renderPalette = () => {
  palette.innerHTML = '';

  nodeDefs.forEach((def) => {
    const item = document.createElement('div');
    item.className = 'palette-item';
    item.draggable = true;
    item.dataset.type = def.type;
    item.textContent = def.type;

    item.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/node-type', def.type);
    });

    palette.appendChild(item);
  });
};

const syncPortOptions = () => {
  const fromNode = getNodeById(fromNodeSelect.value);
  const toNode = getNodeById(toNodeSelect.value);

  const fromDef = fromNode ? registry[fromNode.type] : null;
  const toDef = toNode ? registry[toNode.type] : null;

  fromPortSelect.innerHTML = '';
  (fromDef?.outputPorts || []).forEach((port) => {
    const option = document.createElement('option');
    option.value = port;
    option.textContent = port;
    fromPortSelect.appendChild(option);
  });

  toPortSelect.innerHTML = '';
  (toDef?.inputPorts || []).forEach((port) => {
    const option = document.createElement('option');
    option.value = port;
    option.textContent = port;
    toPortSelect.appendChild(option);
  });
};

const renderConnectionSelectors = () => {
  const selectedFrom = fromNodeSelect.value;
  const selectedTo = toNodeSelect.value;

  fromNodeSelect.innerHTML = '';
  toNodeSelect.innerHTML = '';

  state.nodes.forEach((node) => {
    const a = document.createElement('option');
    a.value = node.id;
    a.textContent = `${node.id} (${node.type})`;

    const b = a.cloneNode(true);
    fromNodeSelect.appendChild(a);
    toNodeSelect.appendChild(b);
  });

  if (selectedFrom) {
    fromNodeSelect.value = selectedFrom;
  }
  if (selectedTo) {
    toNodeSelect.value = selectedTo;
  }

  syncPortOptions();
};

const renderEdgeList = () => {
  edgeList.innerHTML = '';

  state.edges.forEach((edge, index) => {
    const li = document.createElement('li');
    const delayedTag = edge.delay ? ' [delayed]' : '';
    li.textContent = `${edge.from.node}.${edge.from.port} -> ${edge.to.node}.${edge.to.port}${delayedTag}`;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'x';
    removeBtn.addEventListener('click', () => {
      state.edges.splice(index, 1);
      renderEdgeList();
      redrawEdges();
    });

    li.appendChild(removeBtn);
    edgeList.appendChild(li);
  });
};

const selectNode = (nodeId) => {
  state.selectedNodeId = nodeId;
  const node = getNodeById(nodeId);
  highlightSelectedNode();

  if (!node) {
    inspectorEmpty.classList.remove('hidden');
    inspectorForm.classList.add('hidden');
    return;
  }

  inspectorEmpty.classList.add('hidden');
  inspectorForm.classList.remove('hidden');

  nodeIdInput.value = node.id;
  nodeTypeInput.value = node.type;
  nodeScopeInput.value = node.scope || 'main';
  nodeParamsInput.value = JSON.stringify(node.params || {}, null, 2);
};

const addNode = (type, x, y) => {
  const def = registry[type];

  if (!def) {
    return;
  }

  const node = {
    id: `n${state.nodeCounter}`,
    type,
    scope: type === MLToolbox.graph.NODE_TYPES.FOR_LOOP ? 'main' : 'main',
    params: { ...(def.defaultParams || {}) },
    position: { x, y },
  };

  if (type === MLToolbox.graph.NODE_TYPES.HYPOTHESIS_LINEAR ||
      type === MLToolbox.graph.NODE_TYPES.LOSS_MSE ||
      type === MLToolbox.graph.NODE_TYPES.GRADIENT_LINEAR_MSE ||
      type === MLToolbox.graph.NODE_TYPES.WEIGHT_UPDATE_SGD ||
      type === MLToolbox.graph.NODE_TYPES.METRIC_COLLECTOR) {
    node.scope = 'train';
  }

  state.nodeCounter += 1;
  state.nodes.push(node);

  renderNodes();
  renderConnectionSelectors();
  selectNode(node.id);
};

const readGraph = () => ({
  nodes: state.nodes.map((node) => ({
    id: node.id,
    type: node.type,
    scope: node.scope,
    params: node.params,
    position: node.position,
  })),
  edges: state.edges.map((edge) => ({
    from: { ...edge.from },
    to: { ...edge.to },
    delay: Boolean(edge.delay),
  })),
});

const loadGraph = (graph) => {
  state.nodes = graph.nodes.map((node) => ({
    ...node,
    scope: node.scope || 'main',
    params: node.params || {},
    position: node.position || { x: 100, y: 100 },
  }));

  state.edges = (graph.edges || []).map((edge) => ({
    ...edge,
    delay: Boolean(edge.delay),
  }));
  state.nodeCounter = state.nodes.length + 1;
  state.selectedNodeId = null;

  renderNodes();
  renderConnectionSelectors();
  renderEdgeList();
  selectNode(null);
};

const exampleGraph = () => ({
  nodes: [
    {
      id: 'n1',
      type: MLToolbox.graph.NODE_TYPES.DATA_GENERATOR,
      scope: 'main',
      params: { count: 40, xStart: -1, xStep: 0.1, trueW: 3, trueB: -0.2, noise: 0.05 },
      position: { x: 30, y: 40 },
    },
    {
      id: 'n2',
      type: MLToolbox.graph.NODE_TYPES.WEIGHT_INIT,
      scope: 'main',
      params: { mode: 'random', randomScale: 0.5 },
      position: { x: 30, y: 200 },
    },
    {
      id: 'n3',
      type: MLToolbox.graph.NODE_TYPES.FOR_LOOP,
      scope: 'main',
      params: { iterations: 120, targetScope: 'train' },
      position: { x: 30, y: 360 },
    },
    {
      id: 'n4',
      type: MLToolbox.graph.NODE_TYPES.HYPOTHESIS_LINEAR,
      scope: 'train',
      params: {},
      position: { x: 340, y: 40 },
    },
    {
      id: 'n5',
      type: MLToolbox.graph.NODE_TYPES.LOSS_MSE,
      scope: 'train',
      params: {},
      position: { x: 590, y: 40 },
    },
    {
      id: 'n6',
      type: MLToolbox.graph.NODE_TYPES.GRADIENT_LINEAR_MSE,
      scope: 'train',
      params: {},
      position: { x: 340, y: 200 },
    },
    {
      id: 'n7',
      type: MLToolbox.graph.NODE_TYPES.WEIGHT_UPDATE_SGD,
      scope: 'train',
      params: { learningRate: 0.05 },
      position: { x: 590, y: 200 },
    },
    {
      id: 'n8',
      type: MLToolbox.graph.NODE_TYPES.METRIC_COLLECTOR,
      scope: 'train',
      params: { metricName: 'train' },
      position: { x: 840, y: 120 },
    },
  ],
  edges: [
    { from: { node: 'n1', port: 'x' }, to: { node: 'n4', port: 'x' } },
    { from: { node: 'n2', port: 'w' }, to: { node: 'n4', port: 'w' } },
    { from: { node: 'n2', port: 'b' }, to: { node: 'n4', port: 'b' } },
    { from: { node: 'n4', port: 'yPred' }, to: { node: 'n5', port: 'yPred' } },
    { from: { node: 'n1', port: 'y' }, to: { node: 'n5', port: 'yTrue' } },
    { from: { node: 'n1', port: 'x' }, to: { node: 'n6', port: 'x' } },
    { from: { node: 'n4', port: 'yPred' }, to: { node: 'n6', port: 'yPred' } },
    { from: { node: 'n1', port: 'y' }, to: { node: 'n6', port: 'yTrue' } },
    { from: { node: 'n2', port: 'w' }, to: { node: 'n7', port: 'w' } },
    { from: { node: 'n2', port: 'b' }, to: { node: 'n7', port: 'b' } },
    { from: { node: 'n6', port: 'gradW' }, to: { node: 'n7', port: 'gradW' } },
    { from: { node: 'n6', port: 'gradB' }, to: { node: 'n7', port: 'gradB' } },
    { from: { node: 'n7', port: 'w' }, to: { node: 'n4', port: 'w' }, delay: true },
    { from: { node: 'n7', port: 'b' }, to: { node: 'n4', port: 'b' }, delay: true },
    { from: { node: 'n7', port: 'w' }, to: { node: 'n8', port: 'w' } },
    { from: { node: 'n7', port: 'b' }, to: { node: 'n8', port: 'b' } },
    { from: { node: 'n5', port: 'loss' }, to: { node: 'n8', port: 'loss' } },
  ],
});

workspace.addEventListener('dragover', (event) => {
  event.preventDefault();
});

workspace.addEventListener('drop', (event) => {
  event.preventDefault();
  const type = event.dataTransfer.getData('text/node-type');
  if (!type) {
    return;
  }

  const rect = workspace.getBoundingClientRect();
  addNode(type, event.clientX - rect.left - 90, event.clientY - rect.top - 20);
});

fromNodeSelect.addEventListener('change', syncPortOptions);
toNodeSelect.addEventListener('change', syncPortOptions);

btnAddEdge.addEventListener('click', () => {
  const fromNode = fromNodeSelect.value;
  const fromPort = fromPortSelect.value;
  const toNode = toNodeSelect.value;
  const toPort = toPortSelect.value;

  if (!fromNode || !fromPort || !toNode || !toPort) {
    alert('Select both node and port endpoints.');
    return;
  }

  const duplicate = state.edges.some((edge) =>
    edge.from.node === fromNode &&
    edge.from.port === fromPort &&
    edge.to.node === toNode &&
    edge.to.port === toPort &&
    Boolean(edge.delay) === Boolean(edgeDelayedInput.checked),
  );

  if (duplicate) {
    return;
  }

  state.edges.push({
    from: { node: fromNode, port: fromPort },
    to: { node: toNode, port: toPort },
    delay: Boolean(edgeDelayedInput.checked),
  });

  renderEdgeList();
  redrawEdges();
});

btnSaveNode.addEventListener('click', () => {
  const node = getNodeById(state.selectedNodeId);
  if (!node) {
    return;
  }

  try {
    node.scope = nodeScopeInput.value.trim() || 'main';
    node.params = JSON.parse(nodeParamsInput.value || '{}');
    renderNodes();
    renderConnectionSelectors();
    selectNode(node.id);
  } catch (error) {
    alert(`Invalid node params JSON: ${error.message}`);
  }
});

btnRun.addEventListener('click', () => {
  try {
    const graph = readGraph();
    const result = MLToolbox.graph.executeGraph({ graph });
    const metrics = result.metrics.train || [];
    const first = metrics[0] || null;
    const last = metrics[metrics.length - 1] || null;

    runOutput.textContent = JSON.stringify(
      {
        summary: {
          stepCount: result.steps,
          metricPoints: metrics.length,
          first,
          last,
        },
        metrics,
      },
      null,
      2,
    );
  } catch (error) {
    runOutput.textContent = `Execution failed:\n${error.stack || error.message}`;
  }
});

btnLoadExample.addEventListener('click', () => {
  loadGraph(exampleGraph());
});

btnExport.addEventListener('click', async () => {
  const graphText = MLToolbox.graph.serializeGraph(readGraph());
  await navigator.clipboard.writeText(graphText);
  runOutput.textContent = 'Graph JSON copied to clipboard.';
});

btnImport.addEventListener('click', () => {
  const text = window.prompt('Paste graph JSON');
  if (!text) {
    return;
  }

  try {
    const graph = MLToolbox.graph.deserializeGraph(text);
    loadGraph(graph);
  } catch (error) {
    alert(`Import failed: ${error.message}`);
  }
});

window.addEventListener('resize', redrawEdges);

renderPalette();
loadGraph(exampleGraph());
