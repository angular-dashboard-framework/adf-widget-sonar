'use strict';

sonarADFWidget.controller('compare', compare);

function compare(data) {
  var vm = this;
  if(data != "Please Setup the Widget"){
    vm.projectLeft = data.projectLeft.split(':')[1];
    vm.projectRight = data.projectRight.split(':')[1];
    var projectLeftMetrics = data.resp.projectLeft.data.component.measures;
    var projectRightMetrics = data.resp.projectRight.data.component.measures;
    var compareTable = [];
    angular.forEach(projectLeftMetrics, function (metricLeft) {
      angular.forEach(projectRightMetrics, function (metricRight) {
        if (metricRight.metric === metricLeft.metric) {
          compareTable.push({metricName: metricLeft.metric,
            projectValLeft: metricLeft.value, projectValRight: metricRight.value});
        }
      });
    });
    vm.compareTable = compareTable;
  }

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
        };
        vm.projects.push(proj);
      });
    });
  };
  $scope.updateProjects();

}
