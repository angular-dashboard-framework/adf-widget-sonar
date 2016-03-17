'use strict';

sonarADFWidget.
controller('sonarLineChart', sonarLineChart);

function sonarLineChart(data){
  var vm = this;
  vm.series = ['Lines of code','Technial debt','Test-Coverage','Amount Unit-Tests'];
  vm.labels = data.dates;
  var linesOfCode = data.linesOfCode;
  var technicalDebt = data.technicalDebt;
  var coverage = data.coverage;
  var amountTest = data.amountTest;

  vm.data = [linesOfCode,technicalDebt,coverage,amountTest];


  vm.labelz = ["January", "February", "March", "April", "May", "June", "July"];
  vm.seriez = ['Series A', 'Series B'];
  vm.dataz = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];


}
