var statistics = require('./statistics'),
    fs = require('fs');

methods = {};
methods['EQUAL'] = function () {

};
methods['NORMAL'] = function (mean, deviation) {
  return function (x) {
    return Math.exp(-(x - mean) * (x - mean) / (2 * deviation * deviation)) / (deviation * Math.sqrt(2 * Math.PI));
  };
}
var getMethod = function (intervalization_method, mean, deviation) {
  return methods[intervalization_method](mean, deviation);
}

/**
 * Returns integral for f(x) from left to right
 */
var integrate = function (f, left, right) {
  lowerSum = 0;
  upperSum = 0;
  for (var x = left; x < right; x += (right - left) / 100) {
    lowerSum += f(x) * (right - left) / 100;
    upperSum += f(x + (right - left) / 100) * (right - left) / 100;
  };
  return (lowerSum + upperSum) / 2;
}

/**
 * Returns intervals for data series
 */
module.exports.getIntervals = function (data, alphabet, intervalization_method) {
  sorteddata = [].concat(data);
  sorteddata.sort(function (e1, e2) {
    return e1 - e2;
  });
  min = sorteddata[0];
  max = sorteddata[sorteddata.length - 1];
  mean = statistics.getMean(sorteddata);
  deviation = statistics.getDeviation(sorteddata);


  if (intervalization_method == 'EQUAL') {
    intervals = [];
    for (var i = 0; i < alphabet.length; i++) {
      intervals[i] = {left : min + (i / alphabet.length) * (max - min), right : min + ( (i + 1) / alphabet.length) * (max - min) };
    };
    return intervals;
  } else {
    F = methods[intervalization_method](mean, deviation);
    throw new Error('Method isn\'t implemented');

  }
};
