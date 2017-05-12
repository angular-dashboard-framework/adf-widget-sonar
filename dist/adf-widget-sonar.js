(function(window, undefined) {'use strict';

//app initialisation with dependencies
var sonarADFWidget = angular.module('adf.widget.sonar', ['adf.provider', 'chart.js', 'ui.bootstrap', 'ui.bootstrap.datepicker','angular-svg-round-progressbar'])
.constant("sonarEndpoint", {
  "url": "https://sonarqube.com"
}).constant("METRIC_NAMES", {"open_issues":"Open Issues","ncloc":"Lines of Code",
"public_documented_api_density": "Public documented API density","duplicated_lines_density": "Duplicated Lines (%)",
"sqale_index":"SQALE index", "coverage": "Coverage (%)", "tests": "Tests" })
  .config(['ChartJsProvider', function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
      chartColors: ['#16688d', '#fdb45c'],
      responsive: false,
      maintainAspectRatio: true,
      legend:{
        display:true
      }
    });
    // Configure all line charts
    ChartJsProvider.setOptions('line', {
      showLines: true
    });
  }])
  .config(["dashboardProvider", function(dashboardProvider) {
    dashboardProvider
      .widget('sonar-all-projects-statistics', {
        title: 'Sonar Statistics of all Projects ',
        description: 'Displays all SonarQube statistics',
        templateUrl: '{widgetsPath}/sonar/src/allProjects/view.html',
        resolve: {
          data: ["sonarApi", "config", "sonarEndpoint", function(sonarApi, config, sonarEndpoint) {
            if (config.apiUrl) {
              return sonarApi.getAllProjectsStatistics(config.apiUrl);
            }
            else if (sonarEndpoint.url){
              return sonarApi.getAllProjectsStatistics(sonarEndpoint.url);
            }
            return 'Please Setup the Widget';
          }]
        },
        category: 'SonarQube',
        controller: 'sonarStatsCtrl',
        controllerAs: 'vm',
        edit: {
          templateUrl: '{widgetsPath}/sonar/src/allProjects/edit.html'
        }
      })
      .widget('sonar-linechart', {
        title: 'Sonar Linechart of a Project',
        description: 'Displays a linechart with different metrics',
        templateUrl: '{widgetsPath}/sonar/src/chart/view.html',
        resolve: {
          data: ["sonarApi", "config", "sonarEndpoint", function(sonarApi, config, sonarEndpoint) {
            var apiUrl;
            if (config.apiUrl) {
              apiUrl = config.apiUrl;
            } else {
              apiUrl = sonarEndpoint.url;
            }
            if (apiUrl && config.project && config.metrics){
              return sonarApi.getChartData(config.apiUrl, config.project, config.metrics, config.timespan);
            } else{
              return 'Please Setup the Widget';
            }
          }]
        },
        category: 'SonarQube',
        controller: 'sonarLineChart',
        controllerAs: 'vm',
        edit: {
          templateUrl: '{widgetsPath}/sonar/src/chart/edit.html'
        }
      })
      .widget('sonar-compare', {
        title: 'Sonar Project Compare',
        description: 'Displays a table to compare two projects',
        templateUrl: '{widgetsPath}/sonar/src/compare/view.html',
        resolve: {
          data: ["sonarApi", "config", "sonarEndpoint", function(sonarApi, config, sonarEndpoint) {

            if (config.apiUrl){
              return sonarApi.getMetrics(config.apiUrl, config.projectname1, config.projectname2);
            }
            else if (sonarEndpoint.url && config.projectname1 && config.projectname2){
              return sonarApi.getMetrics(sonarEndpoint.url, config.projectname1,config.projectname2);
            }
            return 'Please Setup the Widget';
          }]
        },
        category: 'SonarQube',
        controller: 'compare',
        controllerAs: 'vm',
        edit: {
          templateUrl: '{widgetsPath}/sonar/src/compare/edit.html'
        }
      })
      .widget('project-progress', {
        title: 'Project Progress',
        description: 'Visualizes the progress of a project',
        templateUrl: '{widgetsPath}/sonar/src/project-progress/view.html',
        resolve: {
          data: ["sonarApi", "config", function(sonarApi, config) {
            if (config.projectBeginn){
              return sonarApi.getProjectTime(config.projectBeginn, config.projectEnd);
            }
            return 'Please Setup the Widget';
          }]
        },
        controller: 'progress',
        controllerAs: 'vm',
        edit: {
          templateUrl: '{widgetsPath}/sonar/src/project-progress/edit.html'
        }
      });

  }]);

angular.module("adf.widget.sonar").run(["$templateCache", function($templateCache) {$templateCache.put("{widgetsPath}/sonar/src/allProjects/edit.html","<form role=form><div class=form-group><label for=sample>API-URL</label> <input type=text class=form-control id=sample ng-model=config.apiUrl placeholder=Sonar-URL></div></form>");
$templateCache.put("{widgetsPath}/sonar/src/allProjects/view.html","<style type=text/css>\n  .content {\n    text-align: right;\n    color: white;\n  }\n  .coverage {\n    background-color: #f0ad4e;\n    border-radius: 8px;\n  }\n  .linesOfCode {\n    background-color: #337ab7;\n    margin-bottom: 2%;\n    border-radius: 8px;\n  }\n  .linesOfCodePencil {\n    float: left;\n    font-size: 3em;\n    margin-top: 25px;\n  }\n  .coverageTask {\n    float: left;\n    font-size: 3em;\n    margin-top: 25px;\n  }\n</style><div><div class=\"content col-md-12\"><div class=\"col-md-12 linesOfCode\"><span class=\"glyphicon glyphicon-pencil linesOfCodePencil\"></span><h1>{{(vm.data.linesOfCode | number)||0}}</h1><h4>Lines of code</h4></div><div class=\"col-md-12 coverage\"><span class=\"glyphicon glyphicon-tasks coverageTask\"></span><h1>{{(vm.data.coverage | number:2)||0}}%</h1><h4>Average test coverage</h4></div></div></div>");
$templateCache.put("{widgetsPath}/sonar/src/chart/edit.html","<style type=text/css></style><form role=form><div class=form-group ng-controller=\"editController as vm\"><label for=sample>API-URL</label><p><input class=form-control id=sample ng-model=config.apiUrl placeholder=Sonar-URL type=text ng-change=updateProjects()></p><label for=sample>Project</label> (*Required)<p><input id=project name=project type=text class=form-control autocomplete=off placeholder=\"Choose project\" ng-model=config.project required uib-typeahead=\"project.name for project in vm.projects | limitTo:10 | filter:$viewValue\"></p><label for=sample>Timespan</label><p><label class=radio-inline><input name=timespan ng-model=config.timespan.type type=radio value=dynamic>Dynamic</label> <label class=radio-inline><input name=timespan ng-model=config.timespan.type type=radio value=static>Static</label> <label class=radio-inline><input name=timespan ng-model=config.timespan.type type=radio value=no>None</label></p><div ng-if=\"config.timespan.type==\'static\'\"><p class=input-group><input class=form-control datepicker-options=dateOptions is-open=popup1.opened ng-model=config.timespan.fromDateTime placeholder=von show-button-bar=false type=text uib-datepicker-popup={{format}}> <span class=input-group-btn><button class=\"btn btn-default\" ng-click=open1() type=button><i class=\"glyphicon glyphicon-calendar\"></i></button></span></p><p class=input-group><input class=form-control datepicker-options=dateOptions is-open=popup2.opened ng-model=config.timespan.toDateTime placeholder=bis show-button-bar=false type=text uib-datepicker-popup={{format}}> <span class=input-group-btn><button class=\"btn btn-default\" ng-click=open2() type=button><i class=\"glyphicon glyphicon-calendar\"></i></button></span></p></div><p ng-if=\"config.timespan.type==\'dynamic\'\"><label class=radio-inline><input name=timespan.dynamic ng-model=config.timespan.dynamic type=radio value=week>last week</label> <label class=radio-inline><input name=timespan.dynamic ng-model=config.timespan.dynamic type=radio value=month>last month</label> <label class=radio-inline><input name=timespan.dynamic ng-model=config.timespan.dynamic type=radio value=year>last year</label></p><label for=sample>Metric Selection</label><div class=checkbox><label><input ng-model=config.metrics.linesOfCode type=checkbox>Lines of Code</label></div><div class=checkbox><label><input ng-model=config.metrics.technicalDebt type=checkbox>Technical Debt</label></div><div class=checkbox><label><input ng-model=config.metrics.amountTest type=checkbox>Number Unit-Tests</label></div><div class=checkbox><label><input ng-model=config.metrics.testCoverage type=checkbox>Test Coverage</label></div><div class=checkbox><label><input ng-model=config.metrics.issues type=checkbox>Open Issues</label></div><div class=checkbox><label><input ng-model=config.metrics.rulesviolations type=checkbox>Duplicate Code (%)</label></div></div></form>");
$templateCache.put("{widgetsPath}/sonar/src/chart/view.html","<canvas id=line class=\"chart chart-line\" chart-data=vm.values chart-labels=vm.labels chart-series=vm.series chart-options=options chart-dataset-override=datasetOverride style=\"width: 100%\"></canvas>");
$templateCache.put("{widgetsPath}/sonar/src/compare/edit.html","<form role=form><div class=form-group ng-controller=\"editController as vm\"><label for=url>API-URL</label> <input type=text class=form-control id=url ng-model=config.apiUrl placeholder=Sonar-URL ng-change=updateProjects()> <label for=project1>Choose Project 1</label> <input type=text class=form-control id=project1 ng-model=config.projectname1 ng-required=true placeholder=\"Project 1\" uib-typeahead=\"project.name for project in vm.projects | limitTo:10 | filter:$viewValue\"> <label for=project2>Choose Project 2</label> <input type=text class=form-control id=project2 ng-model=config.projectname2 ng-required=true placeholder=\"Project 2\" uib-typeahead=\"project.name for project in vm.projects | limitTo:10 | filter:$viewValue\"></div></form>");
$templateCache.put("{widgetsPath}/sonar/src/compare/view.html","<div class=\"alert alert-info\" ng-if=!vm.projectLeft>Please configure the widget</div><div ng-if=vm.projectLeft class=\"col-md-12 centerText\"><table class=table><tr><th>Metric</th><th>{{vm.projectLeft.data.component.name}}</th><th>{{vm.projectRight.data.component.name}}</th></tr><tr ng-repeat=\"metric in vm.projectLeft.data.component.measures\"><td>{{vm.METRIC_NAMES[metric.metric]}}</td><td>{{vm.projectLeft.data.component.measures[$index].value}}</td><td>{{vm.projectRight.data.component.measures[$index].value}}</td></tr></table></div>");
$templateCache.put("{widgetsPath}/sonar/src/project-progress/edit.html","<form role=form><div class=form-group ng-controller=editController><label for=sample>Project</label> <input type=text class=form-control id=sample ng-model=config.projectname ng-required=true placeholder=\"Project name\"> <label for=sample>Project Timespan</label><p class=input-group><input class=form-control datepicker-options=dateOptions is-open=popup1.opened ng-model=config.projectBeginn placeholder=from show-button-bar=false type=text uib-datepicker-popup={{format}}> <span class=input-group-btn><button class=\"btn btn-default\" ng-click=open1() type=button><i class=\"glyphicon glyphicon-calendar\"></i></button></span></p><p class=input-group><input class=form-control datepicker-options=dateOptions is-open=popup2.opened ng-model=config.projectEnd placeholder=to show-button-bar=false type=text uib-datepicker-popup={{format}}> <span class=input-group-btn><button class=\"btn btn-default\" ng-click=open2() type=button><i class=\"glyphicon glyphicon-calendar\"></i></button></span></p></div></form>");
$templateCache.put("{widgetsPath}/sonar/src/project-progress/view.html","<style>\n  .daysLeft {\n    text-align: center;\n    max-height: 700px;\n  }\n\n  .info {\n    width: 65%;\n    margin-left: 17.5%;\n    margin-top: -80%;\n    margin-bottom: 35%;\n  }\n\n</style><div class=\"alert alert-info\" ng-if=!vm.result.daysLeft>Please configure the widget</div><div ng-if=vm.result.daysLeft class=daysLeft><div ng-init=\"progress=vm.progressProperties\"><round-progress max=progress.max current=progress.current color=\"{{ (current / max < 0.75) ? \'#EF3939\' : \'#337AB7\' }}\" bgcolor=#F5F5F5 radius=360 stroke=67 semi=false rounded=true clockwise=true responsive=true duration=800 animation=easeInOutQuart animation-delay=0></round-progress></div><div class=info><h1 style=font-size:2em>{{config.projectname}}</h1><h1>{{vm.result.daysLeft}}/{{vm.result.maxDays}}</h1><p>Projekttage</p></div></div>");}]);


sonarADFWidget.
controller('progress', progress);

function progress(data, roundProgressConfig){
  var vm = this;
  roundProgressConfig.max = data.maxDays;
  roundProgressConfig.current = data.daysLeft;
  vm.result = data;
  vm.progressProperties=roundProgressConfig;
}
progress.$inject = ["data", "roundProgressConfig"];



sonarADFWidget.controller('compare', compare);

function compare(data,METRIC_NAMES) {
  var vm = this;

  vm.METRIC_NAMES = METRIC_NAMES;
  vm.projectLeft = data.projectLeft;
  vm.projectRight = data.projectRight;

}
compare.$inject = ["data", "METRIC_NAMES"];

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
sonarLineChart.$inject = ["data", "METRIC_NAMES"];

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
editController.$inject = ["$scope", "sonarApi", "sonarEndpoint"];



sonarADFWidget.
controller('sonarStatsCtrl', sonarStatsCtrl);

function sonarStatsCtrl(data){
  var vm = this;
  vm.data = data;
}
sonarStatsCtrl.$inject = ["data"];



sonarADFWidget.
factory('sonarApi', sonarApi);

//function factory sonar
function sonarApi($http, $q) {

  function createApiUrlProjects(sonarUrl) {
    return sonarUrl + '/api/projects/index?format=json';
  }

  function createApiUrlAllProjectsStatistics(sonarUrl) {
    return sonarUrl + '/api/resources?metrics=ncloc,coverage';
  }

  function createApiUrlMetrics(sonarUrl, projectname) {
    return sonarUrl + '/api/measures/component?componentKey=' + projectname + '&metricKeys=open_issues,ncloc,public_documented_api_density,duplicated_lines_density,sqale_index';
  }

  function getProjectTime(projectBeginn, projectEnd) {
    var beginn = new Date(projectBeginn);
    var end = new Date(projectEnd);
    var today = new Date();

    var maxDays = workingDaysBetweenDates(beginn, end);
    var daysLeft = workingDaysBetweenDates(today, end)

    return {
      'maxDays': maxDays,
      'daysLeft': daysLeft
    };

  }

  function workingDaysBetweenDates(startDate, endDate) {

    // Validate input
    if (endDate < startDate){
      return 0;
    }

    // Calculate days between dates
    var millisecondsPerDay = 86400 * 1000; // Day in milliseconds
    startDate.setHours(0, 0, 0, 1); // Start just after midnight
    endDate.setHours(23, 59, 59, 999); // End just before midnight
    var diff = endDate - startDate; // Milliseconds between datetime objects
    var days = Math.ceil(diff / millisecondsPerDay);

    // Subtract two weekend days for every week in between
    var weeks = Math.floor(days / 7);
    days = days - (weeks * 2);

    // Handle special cases
    var startDay = startDate.getDay();
    var endDay = endDate.getDay();

    // Remove weekend not previously removed.
    if (startDay - endDay > 1)
    {
      days = days - 2;
    }

    // Remove start day if span starts on Sunday but ends before Saturday
    if (startDay === 0 && endDay != 6){
      days = days - 1;
    }

    // Remove end day if span ends on Saturday but starts after Sunday
    if (endDay === 6 && startDay != 0)
    {
      days = days - 1;
    }

    return days;
  }


  function createMetricsString(metrics) {
    var metricsString = "";
    if (metrics.linesOfCode) {
      metricsString += "ncloc,";
    }
    if (metrics.technicalDebt) {
      metricsString += "sqale_index,";
    }
    if (metrics.amountTest) {
      metricsString += "tests,";
    }
    if (metrics.testCoverage) {
      metricsString += "coverage,";
    }
    if (metrics.issues) {
      metricsString += "open_issues,";
    }
    if (metrics.rulesviolations) {
      metricsString += "duplicated_lines_density,";
    }
    return metricsString.slice(0, -1);
  }

  function getMetrics(sonarUrl, projectname1, projectname2) {
    var apiUrlProject1 = createApiUrlMetrics(sonarUrl, projectname1);
    var apiUrlProject2 = createApiUrlMetrics(sonarUrl, projectname2);
    var api1 = $http.get(apiUrlProject1);
    var api2 = $http.get(apiUrlProject2);
    var responsesArray = $q.all([api1, api2])
      .then(function(response) {
        var projectLeft = response[0];
        var projectRight = response[1];
        var projectMetrics = {
          'projectLeft': projectLeft,
          'projectRight': projectRight
        };
        return projectMetrics;
      });

    return responsesArray;
  }


  function getChartData(sonarUrl, projectname, metrics, timespan) {

    var apiUrl;
    var fromDateTime;
    var toDateTime;
    var metricsString = createMetricsString(metrics);
    if (timespan.type === 'dynamic') {
      var today = new Date();
      switch(timespan.dynamic) {
        case 'week':
          fromDateTime = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          fromDateTime = new Date(today.getFullYear(), today.getMonth() - 1, today.getDay());
          break;
        case 'year':
          fromDateTime = new Date(today.getFullYear() - 1, today.getMonth(), today.getDay());
          break;
      }
      toDateTime = today;
    } else if (timespan.type === 'static') {
      fromDateTime = timespan.fromDateTime;
      toDateTime = timespan.toDateTime;
    }
    if ((fromDateTime && toDateTime)) {
      apiUrl = sonarUrl + '/api/timemachine?resource=' + projectname + '&metrics=' + metricsString + '&fromDateTime=' + fromDateTime + '&toDateTime=' + toDateTime;
    } else {
      apiUrl = sonarUrl + '/api/timemachine?resource=' + projectname + '&metrics=' + metricsString;
    }
    return $http({
      method: 'GET',
      url: apiUrl,
      headers: {
        'Accept': 'application/json'
      }
    }).then(function(response) {
      var metricsArray = [];
      var responseData = response.data[0];
      var cols = responseData.cols;
      var cells = responseData.cells;
      for (var x = 0; x < cols.length; x++) {
        var values = [];
        var dates = [];
        for (var y = 0; y < cells.length; y++) {
          dates[y] = cells[y].d.split("T")[0];
          values[y] = cells[y].v[x];

        }
        var metricsObj = {
          'metric': cols[x].metric,
          'values': values,
          'dates': dates
        };
        metricsArray.push(metricsObj);
      }
      return metricsArray;
    });

  }

  function generateArray(projects) {
    var linesOfCodeSum = 0;
    var avarageCoverage = 0;
    for (var i = 0; i < projects.length; i++) {
      if (projects[i].msr[0]) {
        var linesOfCode = projects[i].msr[0].val;
        linesOfCodeSum += linesOfCode;
      }
      if (projects[i].msr[1]) {
        var coverage = projects[i].msr[1].val;
        avarageCoverage += coverage;
      }
    }
    avarageCoverage = avarageCoverage / projects.length;
    return {
      'linesOfCode': linesOfCodeSum,
      'coverage': avarageCoverage
    };
  }

  function getProjects(sonarUrl) {
    var apiUrl = createApiUrlProjects(sonarUrl);

    return $http({
      method: 'GET',
      url: apiUrl,
      headers: {
        'Accept': 'application/json'
      }
    }).then(function(response) {
      return response.data;
    });
  }

  function getAllProjectsStatistics(sonarUrl){
    var apiUrl = createApiUrlAllProjectsStatistics(sonarUrl);

    return $http({
      method: 'GET',
      url: apiUrl,
      headers: {
        'Accept': 'application/json'
      }
    }).then(function(response) {
      var projects = response.data;
      return generateArray(projects);
    });
  }

  return {
    getProjects: getProjects,
    getAllProjectsStatistics: getAllProjectsStatistics,
    getChartData: getChartData,
    getMetrics: getMetrics,
    getProjectTime: getProjectTime
  };

}
sonarApi.$inject = ["$http", "$q"];
})(window);