'use strict';

sonarADFWidget.
controller('progress', progress);

function progress(data, roundProgressConfig){
  var vm = this;
  roundProgressConfig.max = data.maxDays;
  roundProgressConfig.current = data.daysLeft;
  vm.result = data;
  vm.progressProperties=roundProgressConfig;
}
