var lingmodel = require('./lingmodel');

module.exports.getCategorizer = function (alphabet, intervalization_method, derCount) {

  categorizer = {isTraining : true, alphabet : alphabet, method : intervalization_method, derCount : derCount, cumulative : {}, result : {}};

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
    this.cumulative[setname] = this.cumulative[setname] || {};
    this.cumulative[setname].name = setname;
    this.cumulative[setname].categories = this.cumulative[setname].categories || {};
    this.cumulative[setname].categories[category] = this.cumulative[setname].categories[category] || {};
    if (this.cumulative[setname].categories[category].alphabet == undefined) {
      this.cumulative[setname].categories[category] = model;
      this.cumulative[setname].categories[category].count = 1;
    } else {
      knownModel = this.cumulative[setname].categories[category];
      for (var der = 0; der <= knownModel.derCount; der++) {
          for (var i in knownModel.matrixes[der]) {
              for (var j in knownModel.matrixes[der][i]) {
                  knownModel.matrixes[der][i][j] += model.matrixes[der][i][j];
              };
          };
      };
      this.cumulative[setname].categories[category].count++;
    };
  };

  categorizer.train = function (datasets) {
    for (var key in datasets) {
      this.trainSingle(datasets[key].data, datasets[key].name, datasets[key].category);
    };
  }

  categorizer.endTraining = function () {
    if (this.isTraining) {
      this.isTraining = false;
      this.result = JSON.parse(JSON.stringify(this.cumulative));
      for (var setKey in this.result) {
        for (var catKey in this.result[setKey].categories) {
          for (var matrKey in this.result[setKey].categories[catKey].matrixes) {
            for (var i in this.result[setKey].categories[catKey].matrixes[matrKey]) {
              for (var j in this.result[setKey].categories[catKey].matrixes[matrKey][i]) {
                this.result[setKey].categories[catKey].matrixes[matrKey][i][j] /= this.result[setKey].categories[catKey].count;

              };
            };
          };
        };
      };
    };
  };

  categorizer.categorize = function(dataset) {
    if (this.isTraining) {
      this.endTraining();
    }
    model = lingmodel.getLinguisticModel(dataset.data, this.alphabet, this.method, this.derCount);

    var compares = {};
    for (var catKey in this.result[dataset.name].categories) {
      compares[catKey] = {};
      compares[catKey].mean = 0;
      compares[catKey].deviations = lingmodel.compareModels(model, this.result[dataset.name].categories[catKey]);
      for (var i = 0; i < compares[catKey].deviations.length; i++) {
        compares[catKey].mean += compares[catKey].deviations[i];
      }
      compares[catKey].mean /= compares[catKey].deviations.length;
    }

    var minMean = 1;
    for (var catKey in compares) {
      if (minMean > compares[catKey].mean) {
        compares.result = catKey;
        minMean = compares[catKey].mean;
      }
    }
    return compares;
  };

  categorizer.categorizeMult = function (datasets) {
    deviations = {};
    nums = {};
    for (var key in datasets) {
      result = categorizer.categorize(datasets[key]);
      if (!deviations[result.result]) {
        deviations[result.result] = result[result.result].mean;
        nums[result.result] = 1;
      } else {
        deviations[result.result] += result[result.result].mean;
        nums[result.result] ++;
      }
    }
    for (var key in deviations) {
      deviations[key] /= nums[key];
    };
    var min = 1;
    var minCat;
    for (var key in deviations) {
      if (min > deviations[key]) {
        min = deviations[key];
        minCat = key;
      }
    }
    return {deviations : deviations, result : minCat};
  };

  return categorizer;
};
