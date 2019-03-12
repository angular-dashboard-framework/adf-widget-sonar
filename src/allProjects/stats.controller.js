'use strict';

sonarADFWidget.
controller('sonarStatsCtrl', sonarStatsCtrl);

function sonarStatsCtrl(data){
  var vm = this;
  console.log(data);
  if (data){
    console.log(data);
    if (data.support){
      vm.support = data;
    }else{
      vm.data = data;
    }
  }


}
