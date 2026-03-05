/**
 * @param {{nodes:any[],edges:any[]}} graph
 * @returns {string}
 */
const serializeGraph = (graph) => JSON.stringify(graph, null, 2);

/**
 * @param {string} text
 * @returns {{nodes:any[],edges:any[]}}
 */
const deserializeGraph = (text) => {
  const parsed = JSON.parse(text);

  if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error('Invalid graph JSON. Expected { nodes: [], edges: [] }.');
  }

  return parsed;
};

module.exports = {
  serializeGraph,
  deserializeGraph,
};
