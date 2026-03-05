// // variables are nothing placeholder

// let x = 10
// console.log(x)

// const myfunc = (x) => {
//     return 4*x + 10
// }

// console.log(myfunc(10))

// Dataset genearation , calculus and we will linear regression ( curve fitting problem)

// Random Numbers
// const a = Math.random()
// console.log(a)

// Numbers -> Algebra -> Statistic -> Calculus

// Number
const getRandomNumber = (sampleCount) => {
  let a = [];
  for (let i = 0; i < sampleCount; i++) {
    a[i] = Math.random();
  }
  return a;
};

// Statistics
const getMean = (data) => {
  let sum = 0;
  const count = data.length;
  for (let i = 0; i < data.length; i++) {
    sum = sum + data[i];
  }
  return sum / count;
};

const getVariance = (data) => {
  const mean = getMean(data);
  const count = data.length;
  let ssum = 0;
  for (let i = 0; i < count; i++) {
    const x = data[i];
    ssum = ssum + (x - mean) * (x - mean);
  }
  return ssum / count;
};

const getSD = (data) => {
  const variance = getVariance(data);
  return Math.sqrt(variance);
};

// Calculus
const derivateAtX1 = (x1, x2, y1, y2) => {
  const deltaY = y2 - y1;
  const deltaX = x2 - x1;
  const derivate = deltaY / deltaX;
  return derivate;
};

const getDerivatives = (data) => {
  const derivativesArray = [];
  const sampleCount = data.length;
  for (let i = 0; i < sampleCount - 1; i++) {
    derivativesArray[i] = derivateAtX1(i, i + 1, data[i], data[i + 1]);
  }
  return derivativesArray;
};

const data = getRandomNumber(5);
const mean = getMean(data);
const variance = getVariance(data);
const standardDeviation = getSD(data);
const derivativesArray = getDerivatives(data);

console.log(`data is `, data);

console.log(`from statistic : mean ${mean} variance ${variance}  standardDeviation ${standardDeviation}`);

console.log(`from calculus : derivative array `, derivativesArray);

// How to find roots , and use these tools to to fitting problem.
//

// Visualization
const app = document.getElementById('app');
app.style.border = '1px solid black';
app.style.flex = 1;

const drawingBoard = document.createElement('canvas');

const setupCanvas = (canvas) => {
  canvas.style.border = '1px solid gray';
  // Ensure explicit CSS size before reading clientWidth/clientHeight.
  if (!canvas.style.width) {
    canvas.style.width = '300px';
  }
  if (!canvas.style.height) {
    canvas.style.height = '300px';
  }

  const Wcss = canvas.clientWidth;
  const Hcss = canvas.clientHeight;

  const dpr = window.devicePixelRatio || 1;

  const Wbuff = Math.round(Wcss * dpr);
  const HBuff = Math.round(Hcss * dpr);
  canvas.height = HBuff;
  canvas.width = Wbuff;

  const ctx = canvas.getContext('2d');
  const scaleX = canvas.width / Wcss;
  const scaleY = canvas.height / Hcss;
  ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
  ctx.imageSmoothingEnabled = false;

  const Wphy = Wcss * dpr;
  const Hphy = Hcss * dpr;
  const scaleToScreenX = Wphy / canvas.width;
  const scaleToScreenY = Hphy / canvas.height;
  console.log(
    `[canvas-metrics] dpr=${dpr}; css=${Wcss}x${Hcss}; buffer=${canvas.width}x${canvas.height}; ` +
      `physical≈${Math.round(Wphy)}x${Math.round(Hphy)}; scaleToScreen=${scaleToScreenX.toFixed(3)}x${scaleToScreenY.toFixed(3)}; ` +
      `\n\n[FINAL]use draw coords x:[0..${Wcss}], y:[0..${Hcss}] ; ` +
      `\n1-physical-pixel units are ${(1 / scaleX).toFixed(4)} in x and ${(1 / scaleY).toFixed(4)} in y`
  );

  return { ctx, xRange: Wcss, yRange: Hcss, scaleX, scaleY };
};

const drawGrids = ({ ctx, xRange, yRange, scaleX, scaleY }, stepSize = 1) => {
  ctx.clearRect(0, 0, xRange, yRange);
  const xSteps = Math.floor(xRange / stepSize);
  const ySteps = Math.floor(yRange / stepSize);
  const onePhysicalX = 1 / scaleX;
  const onePhysicalY = 1 / scaleY;

  ctx.strokeStyle = 'rgba(0,0,0,0.9)';
  ctx.lineWidth = onePhysicalX;

  for (let i = 0; i < xSteps + 1; i++) {
    ctx.fillRect(i * stepSize, 0, onePhysicalX, yRange);
    // ctx.beginPath();
    // ctx.moveTo(x, 0);
    // ctx.lineTo(x, yRange);
    // ctx.stroke();
  }

  for (let i = 0; i < ySteps + 1; i++) {
    // const y = i * stepSize + crispOffset;
    // ctx.beginPath();
    // ctx.moveTo(0, y);
    // ctx.lineTo(xRange, y);
    // ctx.stroke();
    ctx.fillRect(0, i * stepSize, xRange, onePhysicalY);
  }

  for (let i = 0; i < xSteps + 1; i++) {
    for (let j = 0; j < ySteps + 1; j++) {
      if ((i % 2 == 0 && j % 2 == 0) || (i + j) % 2 == 0 || true) {
        ctx.fillStyle = `rgba(${255 / (i + j + 0.1)},0,0,0.9)`;
        ctx.fillRect(i * stepSize, j * stepSize, stepSize, stepSize);
      }
    }
  }
};

app.appendChild(drawingBoard);
const setup = setupCanvas(drawingBoard);
let stepSize = 40;
let forward = true;
const sleep = (ms) => new Promise((res, rej) => setTimeout(res, ms));

drawGrids(setup, stepSize);

// const {ctx} = setup
// ctx.fillRect(100,100,1,1)

// const tick = async () => {
//   drawGrids(setup, stepSize);
//   forward
//     ? stepSize <= 100
//       ? stepSize++
//       : (forward = false)
//     : stepSize > 2
//       ? stepSize--
//       : (forward = true);
//   await sleep(50);
//   requestAnimationFrame(tick);
// };
// requestAnimationFrame(tick);

// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", async () => {
//     try {
//       const registration = await navigator.serviceWorker.register("./sw.js");
//       console.log("[pwa] service worker registered:", registration.scope);
//     } catch (error) {
//       console.warn("[pwa] service worker registration failed:", error);
//     }
//   });
// }

// const Normalizer = {
//   linearNormalizer: (xmin, xmax, xminTarget, xMaxTarget) => {
//     // xmin <= x <= xmax
//     // 0 <= x-xmin <= xmax-xmin
//     // 0 <= (x-xmin) / (xmax-xmin) <= 1
//     // 0 <= ((x-xmin) / (xmax-xmin)) * (xMaxTarget - xminTarget) <= xMaxTarget - xminTarget
//     // xminTarget <= (((x-xmin) / (xmax-xmin)) * (xMaxTarget - xminTarget) ) + xminTarget <= xMaxTarget

//     return (x) => {
//       return (
//         ((x - xmin) / (xmax - xmin)) * (xMaxTarget - xminTarget) + xminTarget
//       );
//     };
//   },
// };

// const n = Normalizer.linearNormalizer(-20, 20, -100, 100);
// console.log(n(0));

const lerp = (a) => (b) => (t) => a + (b - a) * t;

const map = (xmin) => (xmax) => (ymin) => (ymax) => (x) => lerp(ymin)(ymax)((x - xmin) / (xmax - xmin));

console.log(map(-10)(10)(-100)(100)(10));

// prettier-ignore
const compose = (...fns) => x => fns.reduceRight((v,f)=>f(v),x)
// prettier-ignore
const pipe = (...fns) => x => fns.reduce((v,f)=>f(v),x)

// compose(f, g, h)(x) -> f(g(h(x))) => [f1,f2,f3] -> first f3 , then f2, then f1

const t = {
  shift: (c) => (x) => x + c,
  scale: (k) => (x) => k * x,
  warp: (fn) => (x) => fn(x),
  warpFns: {
    sigmoid: (x) => 1 / (1 + Math.exp(-1 * x)),
    tanh: (x) => Math.tanh(x),
    sin: (x) => Math.sin(x),
    cos: (x) => Math.cos(x),
  },
};

const linearTranformation = pipe(t.scale(1), t.shift(20), t.warp(t.warpFns.sigmoid));
console.log(linearTranformation(1));
