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
    a[i] = Math.random() + 10;
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

console.log(
  `from statistic : mean ${mean} variance ${variance}  standardDeviation ${standardDeviation}`,
);

console.log(`from calculus : derivative array `, derivativesArray);

// How to find roots , and use these tools to to fitting problem.
//

/** Scaling  */

// [12,13,-9,10,20,90,108,78] -> [-10..10]

// [0,1]
// xmin <= x <= xmax
// 0 <= x-xmin <= xmax-xmin
// 0 <= (x-xmin) /(xmax-xmin) <= 1

// const normalize = (array) => {
//     const xmin = Math.min(...array)
//     const xmax = Math.max(...array)
//     return (x) => (x-xmin)/(xmax-xmin)
// }

// const normalizer = normalize(data)

// console.log(data.map(normalizer))

// LERP : Linear Interpolation
const lerp = (a, b, t) => a + t * (b - a);

const normalization = (xmin, xmax, ymin, ymax, x) =>
  lerp(ymin, ymax, (x - xmin) / (xmax - xmin));

// Structure is preserved -> Order , gap ratio or slope will remain same

// scaling them or we shifting them
const Transform = {
  shift: (c) => (x) => x + c,
  scale: (m) => (x) => m * x,
};

const shiftBy10 = Transform.shift(10)
const scaleBy10 = Transform.scale(10)

console.log(scaleBy10(20))

// Aim : [x1..x2] -> [y1..y2]

// x1 ----x--- x2 
// shift by -x1
// 0 -----x-x1-----x2-x1
// scale by 1/(x2-x1)
// 0------ (x-x1)/(x2-x1)----1
// scale by (y2-y1)
// 0-------t*(y2-y1)----(y2-y1)
// shift by y1
// y1---------t*(y2-y1)+y1-----------------y2

const xmin = Math.min(...data)
const xmax = Math.max(...data)

const ymin = -100;
const ymax = 100;



const newScaledValued = x => {
    let ans = Transform.shift(-1*xmin)(x)
    ans = Transform.scale(1/(xmax-xmin))(ans)
    ans = Transform.scale(ymax-ymin)(ans)
    ans = Transform.shift(ymin)(ans)
    return ans
}

console.log(newScaledValued(10.5))
console.log(normalization(xmin,xmax,ymin,ymax,10.5))


// Z -score 


// LogScale => x => Math.log(x)
// sigmoid => x => 1/(1+Math.exp(-1*x))


// 1,10,1000,10000
// log(x)
// 0,1,2,3


// Netwon Raphson 



// SCALE -> SHIFT -> WARP => [ AI ]


// Machine Learing is finding the function which mimics the real output based on given input. 

// Hypothesis -> function -> model -> f(parameters)

// Error function -> E 

// calculus to optimize 

// Tune the model parameters to minimize the error -> trained weights 
