const { createBuiltinRegistry, NODE_TYPES } = require('./registry');

const edgeKey = (nodeId, portName) => `${nodeId}.${portName}`;

const buildIncomingIndex = (edges) => {
  /** @type {Record<string, Record<string, Array<{node:string,port:string,delay?:boolean}>>>} */
  const incoming = {};

  edges.forEach((edge) => {
    incoming[edge.to.node] = incoming[edge.to.node] || {};
    incoming[edge.to.node][edge.to.port] = incoming[edge.to.node][edge.to.port] || [];
    incoming[edge.to.node][edge.to.port].push({
      ...edge.from,
      delay: Boolean(edge.delay),
    });
  });

  return incoming;
};

const topologicalSort = (nodes, edges) => {
  const nodeIds = nodes.map((node) => node.id);
  const inDegree = Object.fromEntries(nodeIds.map((id) => [id, 0]));
  const adjacency = Object.fromEntries(nodeIds.map((id) => [id, []]));

  edges.forEach((edge) => {
    if (edge.delay) {
      return;
    }

    inDegree[edge.to.node] += 1;
    adjacency[edge.from.node].push(edge.to.node);
  });

  const queue = nodeIds.filter((id) => inDegree[id] === 0);
  const ordered = [];

  while (queue.length > 0) {
    const current = queue.shift();
    ordered.push(current);

    adjacency[current].forEach((next) => {
      inDegree[next] -= 1;
      if (inDegree[next] === 0) {
        queue.push(next);
      }
    });
  }

  if (ordered.length !== nodeIds.length) {
    throw new Error('Graph contains a cycle within the same scope.');
  }

  return ordered;
};

const partitionByScope = (nodes, edges) => {
  const byId = Object.fromEntries(nodes.map((node) => [node.id, node]));
  const scopes = {};

  nodes.forEach((node) => {
    const scope = node.scope || 'main';
    scopes[scope] = scopes[scope] || { nodes: [], edges: [] };
    scopes[scope].nodes.push(node);
  });

  edges.forEach((edge) => {
    const fromScope = (byId[edge.from.node]?.scope) || 'main';
    const toScope = (byId[edge.to.node]?.scope) || 'main';

    if (fromScope === toScope) {
      scopes[fromScope].edges.push(edge);
    }
  });

  return scopes;
};

const resolveInputValue = (sources, values, carryValues) => {
  for (let i = 0; i < sources.length; i += 1) {
    const source = sources[i];
    const key = edgeKey(source.node, source.port);

    if (source.delay) {
      if (carryValues[key] !== undefined) {
        return carryValues[key];
      }
      continue;
    }

    if (values[key] !== undefined) {
      return values[key];
    }
  }

  return undefined;
};

const executeScopeOnce = ({ scopedGraph, runtime, registry, values, carryValues, crossScopeIncoming }) => {
  const orderedNodeIds = topologicalSort(scopedGraph.nodes, scopedGraph.edges);
  const incomingIndex = buildIncomingIndex(scopedGraph.edges);

  const mergedIncoming = { ...incomingIndex };
  scopedGraph.nodes.forEach((node) => {
    if (crossScopeIncoming[node.id]) {
      const current = mergedIncoming[node.id] || {};
      const external = crossScopeIncoming[node.id];
      const merged = { ...current };

      Object.keys(external).forEach((portName) => {
        merged[portName] = [...(current[portName] || []), ...(external[portName] || [])];
      });

      mergedIncoming[node.id] = merged;
    }
  });

  orderedNodeIds.forEach((nodeId) => {
    const node = scopedGraph.nodes.find((item) => item.id === nodeId);
    const def = registry[node.type];
    if (!def) {
      throw new Error(`Unknown node type: ${node.type}`);
    }

    const inputSources = mergedIncoming[node.id] || {};
    const inputs = {};

    Object.keys(inputSources).forEach((portName) => {
      const sources = inputSources[portName];
      inputs[portName] = resolveInputValue(sources, values, carryValues);
    });

    const outputs = def.execute({
      node,
      inputs,
      params: { ...(def.defaultParams || {}), ...(node.params || {}) },
      runtime,
    });

    Object.entries(outputs || {}).forEach(([portName, value]) => {
      values[edgeKey(node.id, portName)] = value;
    });
  });
};

const executeGraph = ({ graph, registry = createBuiltinRegistry() }) => {
  const scopes = partitionByScope(graph.nodes, graph.edges);
  const runtime = {
    step: 0,
    metrics: {},
  };

  const values = {};
  const carryValues = {};

  const byId = Object.fromEntries(graph.nodes.map((node) => [node.id, node]));
  /** @type {Record<string, Record<string, Array<{node:string,port:string,delay?:boolean}>>>} */
  const crossScopeIncoming = {};

  graph.edges.forEach((edge) => {
    const fromScope = (byId[edge.from.node]?.scope) || 'main';
    const toScope = (byId[edge.to.node]?.scope) || 'main';

    if (fromScope !== toScope) {
      crossScopeIncoming[edge.to.node] = crossScopeIncoming[edge.to.node] || {};
      crossScopeIncoming[edge.to.node][edge.to.port] = crossScopeIncoming[edge.to.node][edge.to.port] || [];
      crossScopeIncoming[edge.to.node][edge.to.port].push({
        ...edge.from,
        delay: Boolean(edge.delay),
      });
    }
  });

  if (!scopes.main) {
    throw new Error('Graph must contain a main scope.');
  }

  const mainWithoutLoops = {
    nodes: scopes.main.nodes.filter((node) => node.type !== NODE_TYPES.FOR_LOOP),
    edges: scopes.main.edges.filter((edge) => {
      const toNode = scopes.main.nodes.find((node) => node.id === edge.to.node);
      return toNode && toNode.type !== NODE_TYPES.FOR_LOOP;
    }),
  };

  executeScopeOnce({
    scopedGraph: mainWithoutLoops,
    runtime,
    registry,
    values,
    carryValues,
    crossScopeIncoming,
  });
  Object.assign(carryValues, values);

  const loopNodes = scopes.main.nodes.filter((node) => node.type === NODE_TYPES.FOR_LOOP);

  loopNodes.forEach((loopNode) => {
    const params = { ...(registry[NODE_TYPES.FOR_LOOP].defaultParams || {}), ...(loopNode.params || {}) };
    const iterations = Number(params.iterations ?? 1);
    const targetScope = String(params.targetScope || 'train');

    if (!Number.isInteger(iterations) || iterations <= 0) {
      throw new RangeError('control.forLoop: iterations must be positive integer.');
    }

    if (!scopes[targetScope]) {
      throw new Error(`control.forLoop: target scope "${targetScope}" not found.`);
    }

    for (let i = 0; i < iterations; i += 1) {
      runtime.step = i;
      executeScopeOnce({
        scopedGraph: scopes[targetScope],
        runtime,
        registry,
        values,
        carryValues,
        crossScopeIncoming,
      });

      Object.assign(carryValues, values);
    }

    values[edgeKey(loopNode.id, 'done')] = true;
  });

  return {
    values,
    metrics: runtime.metrics,
    steps: runtime.step + 1,
  };
};

module.exports = {
  executeGraph,
};
