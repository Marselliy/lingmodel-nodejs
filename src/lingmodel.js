var intervalization = require('./intervalization.js');

/**
 * Returns transition matrix for data series
 */
var getTransitionMatrix = function (data, alphabet, distribution) {

  // Calculate intervals
  intervals = intervalization.getIntervals(data, alphabet, distribution);

  // Make linguistic chain
  chain = [];
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < intervals.length; j++) {
      if (intervals[j]['left'] < data[i] && data[i] <= intervals[j]['right']) {
        chain[i] = alphabet[j];
        continue;
      }
    }
  };

  // Count symbols
  counts = {};
  for (var i = 0; i < alphabet.length; i++) {
    counts[ alphabet[i] ] = 0;
    for (var j = 0; j < alphabet.length; j++) {
      counts[ alphabet[i] +  alphabet[j] ] = 0;
    };
  };
  for (var i = 0; i < chain.length - 1; i++) {
    counts[ chain[i] ] ++;
    counts[ chain[i] + chain[i + 1] ] ++;
  };
  counts[ chain[chain.length - 1] ] ++;

  // Calculate matrix
  matrix = {};
  for (var i = 0; i < alphabet.length; i++) {
    matrix[ alphabet[i] ] = {};
    for (var j = 0; j < alphabet.length; j++) {
      matrix[ alphabet[i] ][ alphabet[j] ] = counts[ alphabet[i] + alphabet[j] ] / counts[ alphabet[i] ] || 0;
    };
  };
  return matrix;
};

/**
 * Returns linguistic model for data series
 */
module.exports.getLinguisticModel = function (data, alphabet, intervalization_method, derCount) {
  model = {'alphabet' : alphabet, 'method' : intervalization_method, 'derCount' : derCount};

  // Compute derivatives
  derivatives = [];
  derivatives[0] = data;
  for (var i = 1; i <= derCount; i++) {
    derivatives[i] = [];
    for (var j = 0; j < data.length - i - 1; j++) {
      derivatives[i][j] = derivatives[i - 1][j + 1] - derivatives[i - 1][j];
    };
  };
  // Get matrixes
  model.matrixes = [];
  for (var i = 0; i <= derCount; i++) {
    model.matrixes[i] = getTransitionMatrix(derivatives[i], alphabet, intervalization_method);
  };
  return model;
};
/**
 * Compares two linguistic models
 */
module.exports.compareModels = function (model1, model2, derivatives) {
  if (model1.alphabet.length != model2.alphabet.length) {
    throw new Error('Can\'t compare models with different alphabet lengths');
  };

  if (model1.method != model2.method) {
    throw new Error('Can\'t compare models with different intervalization methods');
  };

  if (model1.derCount != model2.derCount) {
    throw new Error('Can\'t compare models with different number of derivatives');
  };

  if (!derivatives) {
    derivatives = [];
    for (var i = 0; i < model1.derCount; i++) {
      derivatives.push(i);
    };
  };
  sums = [];
  for (var i = 0; i < derivatives.length; i++) {
    sums.push(0);
    for (var x = 0; x < model1.alphabet.length; x++) {
      for (var y = 0; y < model1.alphabet.length; y++) {
        sums[i] += ( model1.matrixes[ derivatives[i] ][model1.alphabet[x]][model1.alphabet[y]] - model2.matrixes[ derivatives[i] ][model1.alphabet[x]][model1.alphabet[y]] ) *
                   ( model1.matrixes[ derivatives[i] ][model1.alphabet[x]][model1.alphabet[y]] - model2.matrixes[ derivatives[i] ][model1.alphabet[x]][model1.alphabet[y]] );// / (1 + Math.exp(x * 2.71 - 1));
      };
    };
    sums[i] /= (model1.alphabet.length * model1.alphabet.length);
  };
  return sums;

};
