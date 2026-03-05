var MLToolbox = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/utils/guards.js
  var require_guards = __commonJS({
    "src/utils/guards.js"(exports, module) {
      var isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);
      var isNumberList = (values) => Array.isArray(values) && values.length > 0 && values.every(isFiniteNumber);
      var ensureFiniteNumber = (value, name) => {
        if (!isFiniteNumber(value)) {
          throw new TypeError(`${name}: expected a finite number.`);
        }
        return value;
      };
      var ensureNumberList = (values, name) => {
        if (!isNumberList(values)) {
          throw new TypeError(`${name}: expected a non-empty array of finite numbers.`);
        }
        return values;
      };
      var ensureNonZero = (value, name) => {
        if (value === 0) {
          throw new RangeError(`${name}: expected non-zero value.`);
        }
        return value;
      };
      module.exports = {
        isFiniteNumber,
        isNumberList,
        ensureFiniteNumber,
        ensureNumberList,
        ensureNonZero
      };
    }
  });

  // src/fp/index.js
  var require_fp = __commonJS({
    "src/fp/index.js"(exports, module) {
      var { ensureFiniteNumber } = require_guards();
      var identity = (x) => x;
      var constant = (value) => () => value;
      var pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);
      var compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value);
      var mapWith = (fn) => (values) => values.map(fn);
      var reduceWith = (fn, initialValue) => (values) => values.reduce(fn, initialValue);
      var clamp = (min, max) => {
        ensureFiniteNumber(min, "min");
        ensureFiniteNumber(max, "max");
        if (min > max) {
          throw new RangeError("clamp: min must be <= max.");
        }
        return (value) => {
          ensureFiniteNumber(value, "value");
          return Math.min(max, Math.max(min, value));
        };
      };
      module.exports = {
        identity,
        constant,
        pipe,
        compose,
        mapWith,
        reduceWith,
        clamp
      };
    }
  });

  // src/data/index.js
  var require_data = __commonJS({
    "src/data/index.js"(exports, module) {
      var { ensureFiniteNumber } = require_guards();
      var randomSamples = ({ count, offset = 0, span = 1 }) => {
        ensureFiniteNumber(count, "count");
        ensureFiniteNumber(offset, "offset");
        ensureFiniteNumber(span, "span");
        if (!Number.isInteger(count) || count <= 0) {
          throw new RangeError("randomSamples: count must be a positive integer.");
        }
        if (span <= 0) {
          throw new RangeError("randomSamples: span must be > 0.");
        }
        return Array.from({ length: count }, () => offset + Math.random() * span);
      };
      module.exports = {
        randomSamples
      };
    }
  });

  // src/stats/index.js
  var require_stats = __commonJS({
    "src/stats/index.js"(exports, module) {
      var { ensureFiniteNumber, ensureNumberList, ensureNonZero } = require_guards();
      var mean = (values) => {
        const safeValues = ensureNumberList(values, "mean");
        return safeValues.reduce((sum, value) => sum + value, 0) / safeValues.length;
      };
      var variance = (values) => {
        const safeValues = ensureNumberList(values, "variance");
        const avg = mean(safeValues);
        return safeValues.reduce((sum, value) => {
          const diff = value - avg;
          return sum + diff * diff;
        }, 0) / safeValues.length;
      };
      var standardDeviation = (values) => Math.sqrt(variance(values));
      var minMax = (values) => {
        const safeValues = ensureNumberList(values, "minMax");
        return safeValues.reduce(
          (acc, value) => ({
            min: Math.min(acc.min, value),
            max: Math.max(acc.max, value)
          }),
          { min: safeValues[0], max: safeValues[0] }
        );
      };
      var createZScoreNormalizer = (values) => {
        const avg = mean(values);
        const sd = standardDeviation(values);
        ensureNonZero(sd, "standardDeviation");
        return (x) => {
          ensureFiniteNumber(x, "x");
          return (x - avg) / sd;
        };
      };
      var createMinMaxNormalizer = (values) => {
        const { min, max } = minMax(values);
        const span = max - min;
        ensureNonZero(span, "max - min");
        return (x) => {
          ensureFiniteNumber(x, "x");
          return (x - min) / span;
        };
      };
      module.exports = {
        mean,
        variance,
        standardDeviation,
        minMax,
        createZScoreNormalizer,
        createMinMaxNormalizer
      };
    }
  });

  // src/calculus/index.js
  var require_calculus = __commonJS({
    "src/calculus/index.js"(exports, module) {
      var { ensureFiniteNumber, ensureNumberList, ensureNonZero } = require_guards();
      var slopeBetween = (pointA, pointB) => {
        ensureFiniteNumber(pointA == null ? void 0 : pointA.x, "pointA.x");
        ensureFiniteNumber(pointA == null ? void 0 : pointA.y, "pointA.y");
        ensureFiniteNumber(pointB == null ? void 0 : pointB.x, "pointB.x");
        ensureFiniteNumber(pointB == null ? void 0 : pointB.y, "pointB.y");
        const deltaX = pointB.x - pointA.x;
        ensureNonZero(deltaX, "pointB.x - pointA.x");
        return (pointB.y - pointA.y) / deltaX;
      };
      var derivative = (values) => {
        const safeValues = ensureNumberList(values, "derivative");
        if (safeValues.length < 2) {
          throw new RangeError("derivative: expected at least 2 values.");
        }
        return safeValues.slice(0, -1).map((value, index) => safeValues[index + 1] - value);
      };
      var derivativeN = (order) => {
        ensureFiniteNumber(order, "order");
        if (!Number.isInteger(order) || order < 1) {
          throw new RangeError("derivativeN: order must be a positive integer.");
        }
        return (values) => {
          let result = ensureNumberList(values, "derivativeN(values)");
          for (let i = 0; i < order; i += 1) {
            if (result.length < 2) {
              throw new RangeError("derivativeN: insufficient values for requested order.");
            }
            result = derivative(result);
          }
          return result;
        };
      };
      module.exports = {
        slopeBetween,
        derivative,
        derivativeN
      };
    }
  });

  // src/transforms/linear.js
  var require_linear = __commonJS({
    "src/transforms/linear.js"(exports, module) {
      var { ensureFiniteNumber, ensureNonZero } = require_guards();
      var lerp = (start, end) => {
        ensureFiniteNumber(start, "start");
        ensureFiniteNumber(end, "end");
        return (t) => {
          ensureFiniteNumber(t, "t");
          return start + t * (end - start);
        };
      };
      var createRangeMapper = (ranges) => {
        ensureFiniteNumber(ranges == null ? void 0 : ranges.inMin, "ranges.inMin");
        ensureFiniteNumber(ranges == null ? void 0 : ranges.inMax, "ranges.inMax");
        ensureFiniteNumber(ranges == null ? void 0 : ranges.outMin, "ranges.outMin");
        ensureFiniteNumber(ranges == null ? void 0 : ranges.outMax, "ranges.outMax");
        const inputSpan = ranges.inMax - ranges.inMin;
        ensureNonZero(inputSpan, "ranges.inMax - ranges.inMin");
        const toOutput = lerp(ranges.outMin, ranges.outMax);
        return (value) => {
          ensureFiniteNumber(value, "value");
          return toOutput((value - ranges.inMin) / inputSpan);
        };
      };
      var createShift = (offset) => {
        ensureFiniteNumber(offset, "offset");
        return (value) => {
          ensureFiniteNumber(value, "value");
          return value + offset;
        };
      };
      var createScale = (factor) => {
        ensureFiniteNumber(factor, "factor");
        return (value) => {
          ensureFiniteNumber(value, "value");
          return factor * value;
        };
      };
      var createAffine = ({ scale = 1, shift = 0 } = {}) => {
        const scaleFn = createScale(scale);
        const shiftFn = createShift(shift);
        return (value) => shiftFn(scaleFn(value));
      };
      module.exports = {
        lerp,
        createRangeMapper,
        createShift,
        createScale,
        createAffine
      };
    }
  });

  // src/transforms/warps.js
  var require_warps = __commonJS({
    "src/transforms/warps.js"(exports, module) {
      var { ensureFiniteNumber, ensureNonZero } = require_guards();
      var createLogWarp = () => (value) => {
        ensureFiniteNumber(value, "value");
        if (value <= 0) {
          throw new RangeError("createLogWarp: value must be > 0.");
        }
        return Math.log(value);
      };
      var createSigmoidWarp = () => (value) => {
        ensureFiniteNumber(value, "value");
        return 1 / (1 + Math.exp(-value));
      };
      var createTanhWarp = () => (value) => {
        ensureFiniteNumber(value, "value");
        return Math.tanh(value);
      };
      var createPowerWarp = (exponent) => {
        ensureFiniteNumber(exponent, "exponent");
        return (value) => {
          ensureFiniteNumber(value, "value");
          return value ** exponent;
        };
      };
      var createReciprocalWarp = (scale = 1) => {
        ensureFiniteNumber(scale, "scale");
        return (value) => {
          ensureFiniteNumber(value, "value");
          ensureNonZero(value, "value");
          return scale / value;
        };
      };
      module.exports = {
        createLogWarp,
        createSigmoidWarp,
        createTanhWarp,
        createPowerWarp,
        createReciprocalWarp
      };
    }
  });

  // src/transforms/index.js
  var require_transforms = __commonJS({
    "src/transforms/index.js"(exports, module) {
      var linear = require_linear();
      var warps = require_warps();
      module.exports = {
        linear,
        warps
      };
    }
  });

  // src/graph/registry.js
  var require_registry = __commonJS({
    "src/graph/registry.js"(exports, module) {
      var { ensureFiniteNumber, ensureNumberList } = require_guards();
      var NODE_TYPES = {
        DATA_GENERATOR: "data.generator.linear",
        WEIGHT_INIT: "model.weightInit.linear",
        HYPOTHESIS_LINEAR: "model.hypothesis.linear",
        LOSS_MSE: "training.loss.mse",
        GRADIENT_LINEAR_MSE: "training.gradient.linearMSE",
        WEIGHT_UPDATE_SGD: "training.update.sgd",
        FOR_LOOP: "control.forLoop",
        METRIC_COLLECTOR: "observe.metric.collector"
      };
      var average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
      var createBuiltinRegistry = () => {
        const registry = {};
        registry[NODE_TYPES.DATA_GENERATOR] = {
          type: NODE_TYPES.DATA_GENERATOR,
          inputPorts: [],
          outputPorts: ["x", "y"],
          defaultParams: {
            count: 32,
            xStart: -1,
            xStep: 0.1,
            trueW: 2,
            trueB: 0.5,
            noise: 0
          },
          execute: ({ params }) => {
            var _a, _b, _c, _d, _e, _f;
            const count = Number((_a = params.count) != null ? _a : 32);
            ensureFiniteNumber(count, "count");
            if (!Number.isInteger(count) || count <= 0) {
              throw new RangeError("data.generator.linear: count must be a positive integer.");
            }
            const xStart = Number((_b = params.xStart) != null ? _b : -1);
            const xStep = Number((_c = params.xStep) != null ? _c : 0.1);
            const trueW = Number((_d = params.trueW) != null ? _d : 2);
            const trueB = Number((_e = params.trueB) != null ? _e : 0.5);
            const noise = Number((_f = params.noise) != null ? _f : 0);
            [xStart, xStep, trueW, trueB, noise].forEach(
              (value, index) => ensureFiniteNumber(value, `param[${index}]`)
            );
            const x = Array.from({ length: count }, (_, index) => xStart + index * xStep);
            const y = x.map((value) => trueW * value + trueB + (Math.random() * 2 - 1) * noise);
            return { x, y };
          }
        };
        registry[NODE_TYPES.WEIGHT_INIT] = {
          type: NODE_TYPES.WEIGHT_INIT,
          inputPorts: [],
          outputPorts: ["w", "b"],
          defaultParams: {
            mode: "random",
            randomScale: 0.5,
            w: 0,
            b: 0
          },
          execute: ({ params }) => {
            var _a, _b, _c, _d;
            const mode = String((_a = params.mode) != null ? _a : "random");
            if (mode === "manual") {
              const w = Number((_b = params.w) != null ? _b : 0);
              const b = Number((_c = params.b) != null ? _c : 0);
              ensureFiniteNumber(w, "w");
              ensureFiniteNumber(b, "b");
              return { w, b };
            }
            const randomScale = Number((_d = params.randomScale) != null ? _d : 0.5);
            ensureFiniteNumber(randomScale, "randomScale");
            return {
              w: (Math.random() * 2 - 1) * randomScale,
              b: (Math.random() * 2 - 1) * randomScale
            };
          }
        };
        registry[NODE_TYPES.HYPOTHESIS_LINEAR] = {
          type: NODE_TYPES.HYPOTHESIS_LINEAR,
          inputPorts: ["x", "w", "b"],
          outputPorts: ["yPred"],
          defaultParams: {},
          execute: ({ inputs }) => {
            const x = ensureNumberList(inputs.x, "x");
            const w = Number(inputs.w);
            const b = Number(inputs.b);
            ensureFiniteNumber(w, "w");
            ensureFiniteNumber(b, "b");
            return {
              yPred: x.map((value) => w * value + b)
            };
          }
        };
        registry[NODE_TYPES.LOSS_MSE] = {
          type: NODE_TYPES.LOSS_MSE,
          inputPorts: ["yPred", "yTrue"],
          outputPorts: ["loss"],
          defaultParams: {},
          execute: ({ inputs }) => {
            const yPred = ensureNumberList(inputs.yPred, "yPred");
            const yTrue = ensureNumberList(inputs.yTrue, "yTrue");
            if (yPred.length !== yTrue.length) {
              throw new RangeError("training.loss.mse: yPred and yTrue length mismatch.");
            }
            const loss = average(yPred.map((value, index) => {
              const diff = value - yTrue[index];
              return diff * diff;
            }));
            return { loss };
          }
        };
        registry[NODE_TYPES.GRADIENT_LINEAR_MSE] = {
          type: NODE_TYPES.GRADIENT_LINEAR_MSE,
          inputPorts: ["x", "yPred", "yTrue"],
          outputPorts: ["gradW", "gradB"],
          defaultParams: {},
          execute: ({ inputs }) => {
            const x = ensureNumberList(inputs.x, "x");
            const yPred = ensureNumberList(inputs.yPred, "yPred");
            const yTrue = ensureNumberList(inputs.yTrue, "yTrue");
            if (x.length !== yPred.length || yPred.length !== yTrue.length) {
              throw new RangeError("training.gradient.linearMSE: input lengths mismatch.");
            }
            const n = x.length;
            const diffs = yPred.map((value, index) => value - yTrue[index]);
            const gradW = 2 / n * diffs.reduce((sum, diff, index) => sum + diff * x[index], 0);
            const gradB = 2 / n * diffs.reduce((sum, diff) => sum + diff, 0);
            return { gradW, gradB };
          }
        };
        registry[NODE_TYPES.WEIGHT_UPDATE_SGD] = {
          type: NODE_TYPES.WEIGHT_UPDATE_SGD,
          inputPorts: ["w", "b", "gradW", "gradB"],
          outputPorts: ["w", "b"],
          defaultParams: {
            learningRate: 0.01
          },
          execute: ({ inputs, params }) => {
            var _a;
            const w = Number(inputs.w);
            const b = Number(inputs.b);
            const gradW = Number(inputs.gradW);
            const gradB = Number(inputs.gradB);
            const learningRate = Number((_a = params.learningRate) != null ? _a : 0.01);
            [w, b, gradW, gradB, learningRate].forEach(
              (value, index) => ensureFiniteNumber(value, `value[${index}]`)
            );
            return {
              w: w - learningRate * gradW,
              b: b - learningRate * gradB
            };
          }
        };
        registry[NODE_TYPES.FOR_LOOP] = {
          type: NODE_TYPES.FOR_LOOP,
          inputPorts: [],
          outputPorts: ["done"],
          defaultParams: {
            iterations: 100,
            targetScope: "train"
          },
          execute: () => ({ done: true })
        };
        registry[NODE_TYPES.METRIC_COLLECTOR] = {
          type: NODE_TYPES.METRIC_COLLECTOR,
          inputPorts: ["loss", "w", "b"],
          outputPorts: ["latest"],
          defaultParams: {
            metricName: "train"
          },
          execute: ({ inputs, params, runtime }) => {
            var _a;
            const loss = Number(inputs.loss);
            const w = Number(inputs.w);
            const b = Number(inputs.b);
            ensureFiniteNumber(loss, "loss");
            ensureFiniteNumber(w, "w");
            ensureFiniteNumber(b, "b");
            const metricName = String((_a = params.metricName) != null ? _a : "train");
            runtime.metrics[metricName] = runtime.metrics[metricName] || [];
            runtime.metrics[metricName].push({ step: runtime.step, loss, w, b });
            return {
              latest: { loss, w, b }
            };
          }
        };
        return registry;
      };
      module.exports = {
        NODE_TYPES,
        createBuiltinRegistry
      };
    }
  });

  // src/graph/runtime.js
  var require_runtime = __commonJS({
    "src/graph/runtime.js"(exports, module) {
      var { createBuiltinRegistry, NODE_TYPES } = require_registry();
      var edgeKey = (nodeId, portName) => `${nodeId}.${portName}`;
      var buildIncomingIndex = (edges) => {
        const incoming = {};
        edges.forEach((edge) => {
          incoming[edge.to.node] = incoming[edge.to.node] || {};
          incoming[edge.to.node][edge.to.port] = incoming[edge.to.node][edge.to.port] || [];
          incoming[edge.to.node][edge.to.port].push({
            ...edge.from,
            delay: Boolean(edge.delay)
          });
        });
        return incoming;
      };
      var topologicalSort = (nodes, edges) => {
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
          throw new Error("Graph contains a cycle within the same scope.");
        }
        return ordered;
      };
      var partitionByScope = (nodes, edges) => {
        const byId = Object.fromEntries(nodes.map((node) => [node.id, node]));
        const scopes = {};
        nodes.forEach((node) => {
          const scope = node.scope || "main";
          scopes[scope] = scopes[scope] || { nodes: [], edges: [] };
          scopes[scope].nodes.push(node);
        });
        edges.forEach((edge) => {
          var _a, _b;
          const fromScope = ((_a = byId[edge.from.node]) == null ? void 0 : _a.scope) || "main";
          const toScope = ((_b = byId[edge.to.node]) == null ? void 0 : _b.scope) || "main";
          if (fromScope === toScope) {
            scopes[fromScope].edges.push(edge);
          }
        });
        return scopes;
      };
      var resolveInputValue = (sources, values, carryValues) => {
        for (let i = 0; i < sources.length; i += 1) {
          const source = sources[i];
          const key = edgeKey(source.node, source.port);
          if (source.delay) {
            if (carryValues[key] !== void 0) {
              return carryValues[key];
            }
            continue;
          }
          if (values[key] !== void 0) {
            return values[key];
          }
        }
        return void 0;
      };
      var executeScopeOnce = ({ scopedGraph, runtime, registry, values, carryValues, crossScopeIncoming }) => {
        const orderedNodeIds = topologicalSort(scopedGraph.nodes, scopedGraph.edges);
        const incomingIndex = buildIncomingIndex(scopedGraph.edges);
        const mergedIncoming = { ...incomingIndex };
        scopedGraph.nodes.forEach((node) => {
          if (crossScopeIncoming[node.id]) {
            const current = mergedIncoming[node.id] || {};
            const external = crossScopeIncoming[node.id];
            const merged = { ...current };
            Object.keys(external).forEach((portName) => {
              merged[portName] = [...current[portName] || [], ...external[portName] || []];
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
            params: { ...def.defaultParams || {}, ...node.params || {} },
            runtime
          });
          Object.entries(outputs || {}).forEach(([portName, value]) => {
            values[edgeKey(node.id, portName)] = value;
          });
        });
      };
      var executeGraph = ({ graph, registry = createBuiltinRegistry() }) => {
        const scopes = partitionByScope(graph.nodes, graph.edges);
        const runtime = {
          step: 0,
          metrics: {}
        };
        const values = {};
        const carryValues = {};
        const byId = Object.fromEntries(graph.nodes.map((node) => [node.id, node]));
        const crossScopeIncoming = {};
        graph.edges.forEach((edge) => {
          var _a, _b;
          const fromScope = ((_a = byId[edge.from.node]) == null ? void 0 : _a.scope) || "main";
          const toScope = ((_b = byId[edge.to.node]) == null ? void 0 : _b.scope) || "main";
          if (fromScope !== toScope) {
            crossScopeIncoming[edge.to.node] = crossScopeIncoming[edge.to.node] || {};
            crossScopeIncoming[edge.to.node][edge.to.port] = crossScopeIncoming[edge.to.node][edge.to.port] || [];
            crossScopeIncoming[edge.to.node][edge.to.port].push({
              ...edge.from,
              delay: Boolean(edge.delay)
            });
          }
        });
        if (!scopes.main) {
          throw new Error("Graph must contain a main scope.");
        }
        const mainWithoutLoops = {
          nodes: scopes.main.nodes.filter((node) => node.type !== NODE_TYPES.FOR_LOOP),
          edges: scopes.main.edges.filter((edge) => {
            const toNode = scopes.main.nodes.find((node) => node.id === edge.to.node);
            return toNode && toNode.type !== NODE_TYPES.FOR_LOOP;
          })
        };
        executeScopeOnce({
          scopedGraph: mainWithoutLoops,
          runtime,
          registry,
          values,
          carryValues,
          crossScopeIncoming
        });
        Object.assign(carryValues, values);
        const loopNodes = scopes.main.nodes.filter((node) => node.type === NODE_TYPES.FOR_LOOP);
        loopNodes.forEach((loopNode) => {
          var _a;
          const params = { ...registry[NODE_TYPES.FOR_LOOP].defaultParams || {}, ...loopNode.params || {} };
          const iterations = Number((_a = params.iterations) != null ? _a : 1);
          const targetScope = String(params.targetScope || "train");
          if (!Number.isInteger(iterations) || iterations <= 0) {
            throw new RangeError("control.forLoop: iterations must be positive integer.");
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
              crossScopeIncoming
            });
            Object.assign(carryValues, values);
          }
          values[edgeKey(loopNode.id, "done")] = true;
        });
        return {
          values,
          metrics: runtime.metrics,
          steps: runtime.step + 1
        };
      };
      module.exports = {
        executeGraph
      };
    }
  });

  // src/graph/serializer.js
  var require_serializer = __commonJS({
    "src/graph/serializer.js"(exports, module) {
      var serializeGraph = (graph) => JSON.stringify(graph, null, 2);
      var deserializeGraph = (text) => {
        const parsed = JSON.parse(text);
        if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
          throw new Error("Invalid graph JSON. Expected { nodes: [], edges: [] }.");
        }
        return parsed;
      };
      module.exports = {
        serializeGraph,
        deserializeGraph
      };
    }
  });

  // src/graph/index.js
  var require_graph = __commonJS({
    "src/graph/index.js"(exports, module) {
      var { NODE_TYPES, createBuiltinRegistry } = require_registry();
      var { executeGraph } = require_runtime();
      var { serializeGraph, deserializeGraph } = require_serializer();
      module.exports = {
        NODE_TYPES,
        createBuiltinRegistry,
        executeGraph,
        serializeGraph,
        deserializeGraph
      };
    }
  });

  // src/index.js
  var require_index = __commonJS({
    "src/index.js"(exports, module) {
      var fp = require_fp();
      var data = require_data();
      var stats = require_stats();
      var calculus = require_calculus();
      var transforms = require_transforms();
      var graph = require_graph();
      var MLToolbox = {
        fp,
        data,
        stats,
        calculus,
        transforms,
        graph
      };
      module.exports = MLToolbox;
    }
  });
  return require_index();
})();
if (typeof module === 'object' && module.exports) module.exports = MLToolbox; if (typeof globalThis !== 'undefined') globalThis.MLToolbox = MLToolbox;
//# sourceMappingURL=mltb.js.map
