module.exports.getMean = function(data) {
  sum = 0;
  for (var key in data) {
    sum += data[key];
  };
  return sum / data.length;
};
module.exports.getDeviation = function(data) {
  sum = 0;
  mean = this.getMean(data);
  for (var key in data) {
    sum += (data[key] - mean) * (data[key] - mean);
  };
  return Math.sqrt(sum / data.length);
};
