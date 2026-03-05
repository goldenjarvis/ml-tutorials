const ML = require('./src');

const graph = {
  nodes: [
    {
      id: 'data',
      type: ML.graph.NODE_TYPES.DATA_GENERATOR,
      scope: 'main',
      params: { count: 40, xStart: -1, xStep: 0.1, trueW: 3, trueB: -0.2, noise: 0.05 },
    },
    {
      id: 'init',
      type: ML.graph.NODE_TYPES.WEIGHT_INIT,
      scope: 'main',
      params: { mode: 'random', randomScale: 0.5 },
    },
    {
      id: 'loop',
      type: ML.graph.NODE_TYPES.FOR_LOOP,
      scope: 'main',
      params: { iterations: 120, targetScope: 'train' },
    },
    { id: 'hyp', type: ML.graph.NODE_TYPES.HYPOTHESIS_LINEAR, scope: 'train', params: {} },
    { id: 'loss', type: ML.graph.NODE_TYPES.LOSS_MSE, scope: 'train', params: {} },
    { id: 'grad', type: ML.graph.NODE_TYPES.GRADIENT_LINEAR_MSE, scope: 'train', params: {} },
    {
      id: 'update',
      type: ML.graph.NODE_TYPES.WEIGHT_UPDATE_SGD,
      scope: 'train',
      params: { learningRate: 0.05 },
    },
    {
      id: 'metrics',
      type: ML.graph.NODE_TYPES.METRIC_COLLECTOR,
      scope: 'train',
      params: { metricName: 'train' },
    },
  ],
  edges: [
    { from: { node: 'data', port: 'x' }, to: { node: 'hyp', port: 'x' } },
    { from: { node: 'init', port: 'w' }, to: { node: 'hyp', port: 'w' } },
    { from: { node: 'init', port: 'b' }, to: { node: 'hyp', port: 'b' } },
    { from: { node: 'hyp', port: 'yPred' }, to: { node: 'loss', port: 'yPred' } },
    { from: { node: 'data', port: 'y' }, to: { node: 'loss', port: 'yTrue' } },
    { from: { node: 'data', port: 'x' }, to: { node: 'grad', port: 'x' } },
    { from: { node: 'hyp', port: 'yPred' }, to: { node: 'grad', port: 'yPred' } },
    { from: { node: 'data', port: 'y' }, to: { node: 'grad', port: 'yTrue' } },
    { from: { node: 'init', port: 'w' }, to: { node: 'update', port: 'w' } },
    { from: { node: 'init', port: 'b' }, to: { node: 'update', port: 'b' } },
    { from: { node: 'grad', port: 'gradW' }, to: { node: 'update', port: 'gradW' } },
    { from: { node: 'grad', port: 'gradB' }, to: { node: 'update', port: 'gradB' } },
    { from: { node: 'update', port: 'w' }, to: { node: 'hyp', port: 'w' }, delay: true },
    { from: { node: 'update', port: 'b' }, to: { node: 'hyp', port: 'b' }, delay: true },
    { from: { node: 'loss', port: 'loss' }, to: { node: 'metrics', port: 'loss' } },
    { from: { node: 'update', port: 'w' }, to: { node: 'metrics', port: 'w' } },
    { from: { node: 'update', port: 'b' }, to: { node: 'metrics', port: 'b' } },
  ],
};

const result = ML.graph.executeGraph({ graph });
const train = result.metrics.train || [];

console.log('training steps:', train.length);
console.log('initial:', train[0]);
console.log('final:', train[train.length - 1]);
