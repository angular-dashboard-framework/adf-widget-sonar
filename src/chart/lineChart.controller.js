'use strict';

sonarADFWidget.
controller('sonarLineChart', sonarLineChart);
//setup controller
function sonarLineChart(data, METRIC_NAMES) {
  //initialize controller variable
  var vm = this;
  var series = [];
  var values = [];
  for (var i = 0; i < data.length; i++) {
    series.push(METRIC_NAMES[data[i].metric]);
    values.push(data[i].values);
  }

  //setup the chart legend and labels
  vm.series = series;
  vm.labels = data[0].dates;
  vm.values = values;
}

sonarADFWidget.controller('editController', editController);

function editController($scope, sonarApi, sonarEndpoint) {
  var vm = this;
  if(!$scope.config.timespan) {
    $scope.config.timespan= {};
  }

  // convert strings to date objects
  if($scope.config.timespan.fromDateTime){
    $scope.config.timespan.fromDateTime = new Date($scope.config.timespan.fromDateTime);
    $scope.config.timespan.toDateTime = new Date($scope.config.timespan.toDateTime);
  }
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

  $scope.inlineOptions = {
    customClass: getDayClass,
    minDate: new Date(),
    showWeeks: true
  };
  if(!$scope.dateOptions){
    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };
  }

  $scope.toggleMin = function() {
    $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
    $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
  };

  $scope.toggleMin();

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };

  $scope.open2 = function() {
    $scope.popup2.opened = true;
  };

  $scope.formats = ['yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];
  $scope.altInputFormats = ['M!/d!/yyyy'];

  $scope.popup1 = {
    opened: false
  };

  $scope.popup2 = {
    opened: false
  };

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date(tomorrow);
  afterTomorrow.setDate(tomorrow.getDate() + 1);
  $scope.events = [{
    date: tomorrow,
    status: 'full'
  }, {
    date: afterTomorrow,
    status: 'partially'
  }];

  function getDayClass(data) {
    var date = data.date,
      mode = data.mode;
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }
    return '';
  }
}
