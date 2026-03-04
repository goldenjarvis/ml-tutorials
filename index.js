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

console.log(
  `from statistic : mean ${mean} variance ${variance}  standardDeviation ${standardDeviation}`,
);

console.log(
  `from calculus : derivative array `, derivativesArray
);


// How to find roots , and use these tools to to fitting problem.
// 
