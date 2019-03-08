'use strict';

sonarADFWidget.
controller('sonarStatsCtrl', sonarStatsCtrl);

function sonarStatsCtrl(data){
  var vm = this;
  if (!data.support){
    vm.support = data;
  }else{
    vm.data = data;
  }

}
