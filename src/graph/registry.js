const { ensureFiniteNumber, ensureNumberList } = require('../utils/guards');

/**
 * @typedef {{id:string,type:string,scope?:string,params?:Record<string, unknown>}} GraphNode
 * @typedef {{from:{node:string,port:string},to:{node:string,port:string}}} GraphEdge
 * @typedef {{nodes:GraphNode[],edges:GraphEdge[]}} GraphDefinition
 */

const NODE_TYPES = {
  DATA_GENERATOR: 'data.generator.linear',
  WEIGHT_INIT: 'model.weightInit.linear',
  HYPOTHESIS_LINEAR: 'model.hypothesis.linear',
  LOSS_MSE: 'training.loss.mse',
  GRADIENT_LINEAR_MSE: 'training.gradient.linearMSE',
  WEIGHT_UPDATE_SGD: 'training.update.sgd',
  FOR_LOOP: 'control.forLoop',
  METRIC_COLLECTOR: 'observe.metric.collector',
};

const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

const createBuiltinRegistry = () => {
  /** @type {Record<string, any>} */
  const registry = {};

  registry[NODE_TYPES.DATA_GENERATOR] = {
    type: NODE_TYPES.DATA_GENERATOR,
    inputPorts: [],
    outputPorts: ['x', 'y'],
    defaultParams: {
      count: 32,
      xStart: -1,
      xStep: 0.1,
      trueW: 2,
      trueB: 0.5,
      noise: 0,
    },
    execute: ({ params }) => {
      const count = Number(params.count ?? 32);
      ensureFiniteNumber(count, 'count');
      if (!Number.isInteger(count) || count <= 0) {
        throw new RangeError('data.generator.linear: count must be a positive integer.');
      }

      const xStart = Number(params.xStart ?? -1);
      const xStep = Number(params.xStep ?? 0.1);
      const trueW = Number(params.trueW ?? 2);
      const trueB = Number(params.trueB ?? 0.5);
      const noise = Number(params.noise ?? 0);

      [xStart, xStep, trueW, trueB, noise].forEach((value, index) =>
        ensureFiniteNumber(value, `param[${index}]`),
      );

      const x = Array.from({ length: count }, (_, index) => xStart + index * xStep);
      const y = x.map((value) => trueW * value + trueB + (Math.random() * 2 - 1) * noise);

      return { x, y };
    },
  };

  registry[NODE_TYPES.WEIGHT_INIT] = {
    type: NODE_TYPES.WEIGHT_INIT,
    inputPorts: [],
    outputPorts: ['w', 'b'],
    defaultParams: {
      mode: 'random',
      randomScale: 0.5,
      w: 0,
      b: 0,
    },
    execute: ({ params }) => {
      const mode = String(params.mode ?? 'random');
      if (mode === 'manual') {
        const w = Number(params.w ?? 0);
        const b = Number(params.b ?? 0);
        ensureFiniteNumber(w, 'w');
        ensureFiniteNumber(b, 'b');
        return { w, b };
      }

      const randomScale = Number(params.randomScale ?? 0.5);
      ensureFiniteNumber(randomScale, 'randomScale');
      return {
        w: (Math.random() * 2 - 1) * randomScale,
        b: (Math.random() * 2 - 1) * randomScale,
      };
    },
  };

  registry[NODE_TYPES.HYPOTHESIS_LINEAR] = {
    type: NODE_TYPES.HYPOTHESIS_LINEAR,
    inputPorts: ['x', 'w', 'b'],
    outputPorts: ['yPred'],
    defaultParams: {},
    execute: ({ inputs }) => {
      const x = ensureNumberList(inputs.x, 'x');
      const w = Number(inputs.w);
      const b = Number(inputs.b);
      ensureFiniteNumber(w, 'w');
      ensureFiniteNumber(b, 'b');

      return {
        yPred: x.map((value) => w * value + b),
      };
    },
  };

  registry[NODE_TYPES.LOSS_MSE] = {
    type: NODE_TYPES.LOSS_MSE,
    inputPorts: ['yPred', 'yTrue'],
    outputPorts: ['loss'],
    defaultParams: {},
    execute: ({ inputs }) => {
      const yPred = ensureNumberList(inputs.yPred, 'yPred');
      const yTrue = ensureNumberList(inputs.yTrue, 'yTrue');
      if (yPred.length !== yTrue.length) {
        throw new RangeError('training.loss.mse: yPred and yTrue length mismatch.');
      }

      const loss = average(yPred.map((value, index) => {
        const diff = value - yTrue[index];
        return diff * diff;
      }));

      return { loss };
    },
  };

  registry[NODE_TYPES.GRADIENT_LINEAR_MSE] = {
    type: NODE_TYPES.GRADIENT_LINEAR_MSE,
    inputPorts: ['x', 'yPred', 'yTrue'],
    outputPorts: ['gradW', 'gradB'],
    defaultParams: {},
    execute: ({ inputs }) => {
      const x = ensureNumberList(inputs.x, 'x');
      const yPred = ensureNumberList(inputs.yPred, 'yPred');
      const yTrue = ensureNumberList(inputs.yTrue, 'yTrue');

      if (x.length !== yPred.length || yPred.length !== yTrue.length) {
        throw new RangeError('training.gradient.linearMSE: input lengths mismatch.');
      }

      const n = x.length;
      const diffs = yPred.map((value, index) => value - yTrue[index]);

      const gradW = (2 / n) * diffs.reduce((sum, diff, index) => sum + diff * x[index], 0);
      const gradB = (2 / n) * diffs.reduce((sum, diff) => sum + diff, 0);

      return { gradW, gradB };
    },
  };

  registry[NODE_TYPES.WEIGHT_UPDATE_SGD] = {
    type: NODE_TYPES.WEIGHT_UPDATE_SGD,
    inputPorts: ['w', 'b', 'gradW', 'gradB'],
    outputPorts: ['w', 'b'],
    defaultParams: {
      learningRate: 0.01,
    },
    execute: ({ inputs, params }) => {
      const w = Number(inputs.w);
      const b = Number(inputs.b);
      const gradW = Number(inputs.gradW);
      const gradB = Number(inputs.gradB);
      const learningRate = Number(params.learningRate ?? 0.01);

      [w, b, gradW, gradB, learningRate].forEach((value, index) =>
        ensureFiniteNumber(value, `value[${index}]`),
      );

      return {
        w: w - learningRate * gradW,
        b: b - learningRate * gradB,
      };
    },
  };

  registry[NODE_TYPES.FOR_LOOP] = {
    type: NODE_TYPES.FOR_LOOP,
    inputPorts: [],
    outputPorts: ['done'],
    defaultParams: {
      iterations: 100,
      targetScope: 'train',
    },
    execute: () => ({ done: true }),
  };

  registry[NODE_TYPES.METRIC_COLLECTOR] = {
    type: NODE_TYPES.METRIC_COLLECTOR,
    inputPorts: ['loss', 'w', 'b'],
    outputPorts: ['latest'],
    defaultParams: {
      metricName: 'train',
    },
    execute: ({ inputs, params, runtime }) => {
      const loss = Number(inputs.loss);
      const w = Number(inputs.w);
      const b = Number(inputs.b);
      ensureFiniteNumber(loss, 'loss');
      ensureFiniteNumber(w, 'w');
      ensureFiniteNumber(b, 'b');

      const metricName = String(params.metricName ?? 'train');
      runtime.metrics[metricName] = runtime.metrics[metricName] || [];
      runtime.metrics[metricName].push({ step: runtime.step, loss, w, b });

      return {
        latest: { loss, w, b },
      };
    },
  };

  return registry;
};

module.exports = {
  NODE_TYPES,
  createBuiltinRegistry,
};
