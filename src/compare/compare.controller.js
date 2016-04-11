'use strict';

sonarADFWidget.
controller('compare', compare);

function compare(data) {
  var vm = this;

  vm.projectLeft = data.projectLeft;
  vm.projectRight = data.projectRight;

}
