'use strict';

sonarADFWidget.controller('compare', compare);

function compare(data,METRIC_NAMES) {
  var vm = this;

  vm.METRIC_NAMES = METRIC_NAMES;
  vm.projectLeft = data.projectLeft;
  vm.projectRight = data.projectRight;

}

sonarADFWidget.controller('editController', editController);

function editController($scope, $http, sonarApi, sonarEndpoint) {
  var vm = this;

  $scope.updateProjects = function() {
    var url;
    if ($scope.config.apiUrl) {
      url = $scope.config.apiUrl;
    } else {
      url = sonarEndpoint.url;
    }
    vm.projects = [];
    sonarApi.getProjects(url).then(function(data) {
      data.forEach(function(project) {
        var proj = {
          name: project.k
        }
        vm.projects.push(proj);
      });
    });
  }
  $scope.updateProjects();

}
