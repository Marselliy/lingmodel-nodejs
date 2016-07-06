# lingmodel-nodejs [![npm version](https://badge.fury.io/js/lingmodel-nodejs.svg)](https://badge.fury.io/js/lingmodel-nodejs)
Module for data series categorization, based on linguistic modelling approach.
##Installation
**Install module:**
```cmd
npm install lingmodel-nodejs
```
##Example
**Set dependency**
```js
var lingmodel = require('lingmodel-nodejs');
```

**Initialize categorizer:**
- Alphabet: {0, 1, 2, 3, 4, 5, 6, 7, 8, 9}
- Intervalization method: equal intervals
- Number of derivatives: 10
```js
var categorizer = lingmodel.getCategorizer('0123456789'.split(''), 'EQUAL', 10);
```

**Train categorizer with linear function:**
```js
categorizer.train(
[
  {
    data : [1,3,5,7,9,11,13,15,17,19,21,23,25],
    name : 'y'
  }
], 'Linear');
```

**Train categorizer with quadratic function:**
```js
categorizer.train(
[
  {
    data : [1,4,9,16,25,36,49,64,81,100,121,144,169],
    name : 'y'
  }
], 'Quadratic');
```

**Train categorizer with exponential function:**
```js
categorizer.train(
[
  {
    data : [1,2,4,8,16,32,64,128,256,512,1024,2048,4096],
    name : 'y'
  }
], 'Exponential');
```

**Categorize unknown function:**
```js
categorizer.categorize(
[
  {
    data : [-5,-6,-7,-8,-9,-10,-11,-12,-13,-14,-15,-16,-17,-18],
    name : 'y'
  }
]).result;
```
Result: **'Linear'**
