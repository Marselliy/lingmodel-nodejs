var lingmodel = require('./lingmodel');

module.exports.getCategorizer = function (alphabet, intervalization_method, derCount) {

  categorizer = {isTraining : true, alphabet : alphabet, method : intervalization_method, derCount : derCount, cumulative : {}, result : {}};

  /**
   * Trains categorizer with single dataset
   */
  categorizer.trainSingle = function (dataset, setname, category) {
    if (!this.isTraining) {
      this.result = JSON.parse(JSON.stringify(this.cumulative));
      for (var catKey in this.result) {
        for (var modKey in this.result[catKey].models) {
          for (var matrKey in this.result[catKey].models[modKey].matrixes) {
            for (var i = 0; i < this.result[catKey].models[modKey].matrixes[matrKey].length; i++) {
              for (var j = 0; j < this.result[catKey].models[modKey].matrixes[matrKey][i].length; j++) {
                this.result[catKey].models[modKey].matrixes[matrKey][i][j] *= this.result[catKey].count;
              };
            };
          };
        };
      };
      this.isTraining = true;
    };
    model = lingmodel.getLinguisticModel(dataset, alphabet, intervalization_method, derCount);
    this.cumulative[category] = this.cumulative[category] || {};
    this.cumulative[category].name = category;
    this.cumulative[category].models = this.cumulative[category].models || {};
    this.cumulative[category].models[setname] = this.cumulative[category].models[setname] || {};
    if (this.cumulative[category].models[setname].alphabet == undefined) {
      this.cumulative[category].models[setname] = model;
      this.cumulative[category].count = 1;
    } else {
      knownModel = this.cumulative[category].models[setname];
      for (var der = 0; der <= knownModel.derCount; der++) {
          for (var i = 0; i < knownModel.matrixes[der].length; i++) {
              for (var j = 0; j < knownModel.matrixes[der].length; j++) {
                  knownModel.matrixes[der][i][j] += model.matrixes[der][i][j];
              };
          };
      };
      this.cumulative[category].count++;
    };
  };

  /**
   * Trains categorizer with multiple datasets
   */
  categorizer.train = function (datasets, category) {
    for (var key in datasets) {
      this.trainSingle(datasets[key].data, datasets[key].name, category);
    };
  }

  /**
   * Called before categorization. Calculates resulting knowledge base
   */
  categorizer.endTraining = function () {
    if (this.isTraining) {
      this.isTraining = false;
      this.result = JSON.parse(JSON.stringify(this.cumulative));
      for (var catKey in this.result) {
        for (var modKey in this.result[catKey].models) {
          for (var matrKey in this.result[catKey].models[modKey].matrixes) {
            for (var i = 0; i < this.result[catKey].models[modKey].matrixes[matrKey].length; i++) {
              for (var j = 0; j < this.result[catKey].models[modKey].matrixes[matrKey][i].length; j++) {
                this.result[catKey].models[modKey].matrixes[matrKey][i][j] /= this.result[catKey].count;
              };
            };
          };
        };
      };
    };
  };

  /**
   * Returns category for datasets
   */
  categorizer.categorize = function(datasets) {
    if (this.isTraining) {
      this.endTraining();
    }
    lingmodels = {};
    for (var key in datasets) {
      lingmodels[datasets[key].name] = lingmodel.getLinguisticModel(datasets[key].data, this.alphabet, this.method, this.derCount);
    };
    var compares = {};
    for (var key in this.result) {
        compares[key] = {};
        for (var model in lingmodels) {
            compares[key][model] = lingmodel.compareModels(lingmodels[model], this.result[key].models[model]);
        };
        compares[key].total = 0;
        for (var set in compares[key]) {
            for (var i = 0; i < compares[key][set].length; i++) {
                compares[key].total += compares[key][set][i];
            };
        };
        compares[key].total /= this.derCount;
    };
    var min = this.alphabet.length * this.alphabet.length;
    var resDiag;
    for (var diag in compares) {
        if (min > compares[diag].total) {
            min = compares[diag].total;
            resDiag = diag;
        }
    };
    compares.result = resDiag;
    return compares;
  };

  return categorizer;
};
