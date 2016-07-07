var categorization = require('./src/categorization');

/**
 * Initialize categorizer
 * Alphabet : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
 * Intervals : equal
 * Number of derivatives : 10
 */
categorizer = categorization.getCategorizer('0123456789'.split(''), 'EQUAL', 10);

/**
 * Train categorizer with linear function
 */
categorizer.train(
[
  {
    data : [1,3,5,7,9,11,13,15,17,19,21,23,25],
    name : 'y',
    category : 'Linear'
  }
]);

/**
 * Train categorizer with quadratic and exponential functions
 */
categorizer.train(
[
  {
    data : [1,4,9,16,25,36,49,64,81,100,121,144,169],
    name : 'y',
    category : 'Quadratic'
  },
  {
    data : [1,2,4,8,16,32,64,128,256,512,1024,2048,4096],
    name : 'y',
    category : 'Exponential'
  }
]);

/**
 * Categorize unknown function
 * Returns 'Linear'
 */
console.log(categorizer.categorize(
  {
    data : [-5,-6,-7,-8,-9,-10,-11,-12,-13,-14,-15,-16,-17,-18],
    name : 'y'
  }
));
