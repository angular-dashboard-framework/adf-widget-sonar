(function(window, undefined) {'use strict';

//app initialisation with dependencies
var sonarADFWidget = angular.module('adf.widget.sonar', ['adf.provider', 'chart.js', 'ui.bootstrap', 'ui.bootstrap.datepicker','angular-svg-round-progressbar'])
.constant("sonarEndpoint", {
  "url": "https://nemo.sonarqube.org"
})
  .config(["dashboardProvider", function(dashboardProvider) {
    dashboardProvider
      .widget('sonar', {
        //setup adf widget
        title: 'All projects statistics',
        description: 'widget to display sonar statistics',
        templateUrl: '{widgetsPath}/sonar/src/view.html',
        resolve: {
          data: ["sonarApi", "config", "sonarEndpoint", function(sonarApi, config, sonarEndpoint) {
            if (config.apiUrl) {
              return sonarApi.parseStuff(config.apiUrl);
            }
            else if (sonarEndpoint.url){
              return sonarApi.parseStuff(sonarEndpoint.url);
            }
            return 'Please Setup the Widget';
          }]
        },
        controller: 'sonarStatsCtrl',
        controllerAs: 'vm',
        edit: {
          templateUrl: '{widgetsPath}/sonar/src/edit.html'
        }
      })
      .widget('', {
        title: 'project linechart',
        description: 'widget to display a linechart with different metrics',
        templateUrl: '{widgetsPath}/sonar/src/chart/view.html',
        resolve: {
          data: ["sonarApi", "config", "sonarEndpoint", function(sonarApi, config, sonarEndpoint) {
            if (config.apiUrl) {
              return sonarApi.getChartData(config.apiUrl, config.project, config.fromDateTime, config.toDateTime, config.metrics, config.timespan);
            }
            else if (sonarEndpoint.url && config.project && config.metrics){
              return sonarApi.getChartData(sonarEndpoint.url,config.project, config.fromDateTime, config.toDateTime, config.metrics, config.timespan);
            }
            return 'Please Setup the Widget';
          }]
        },
        controller: 'sonarLineChart',
        controllerAs: 'vm',
        edit: {
          templateUrl: '{widgetsPath}/sonar/src/chart/edit.html'
        }
      })
      .widget('compare', {
        title: 'project-compare',
        description: 'widget to compare two projects',
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
        controller: 'compare',
        controllerAs: 'vm',
        edit: {
          templateUrl: '{widgetsPath}/sonar/src/compare/edit.html'
        }
      })
      .widget('projectProgress', {
        title: 'project-progress',
        description: 'widget to check the project progress',
        templateUrl: '{widgetsPath}/sonar/src/project-progress/view.html',
        resolve: {
          data: ["sonarApi", "config", "sonarEndpoint", function(sonarApi, config, sonarEndpoint) {
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
      })

  }]);

angular.module("adf.widget.sonar").run(["$templateCache", function($templateCache) {$templateCache.put("{widgetsPath}/sonar/src/edit.html","<form role=form><div class=form-group><label for=sample>API-URL</label> <input type=text class=form-control id=sample ng-model=config.apiUrl placeholder=Sonar-URL></div></form>");
$templateCache.put("{widgetsPath}/sonar/src/view.html","<style type=text/css>\n  .content {\n    text-align: right;\n    color: white;\n  }\n  .coverage {\n    background-color: #f0ad4e;\n    border-radius: 8px;\n  }\n  .linesOfCode {\n    background-color: #337ab7;\n    margin-bottom: 2%;\n    border-radius: 8px;\n  }\n  .linesOfCodePencil {\n    float: left;\n    font-size: 3em;\n    margin-top: 25px;\n  }\n  .coverageTask {\n    float: left;\n    font-size: 3em;\n    margin-top: 25px;\n  }\n</style><div><div class=\"content col-md-12\"><div class=\"col-md-12 linesOfCode\"><span class=\"glyphicon glyphicon-pencil linesOfCodePencil\"></span><h1>{{(vm.data.linesOfCode | number)||0}}</h1><h4>Lines of code</h4></div><div class=\"col-md-12 coverage\"><span class=\"glyphicon glyphicon-tasks coverageTask\"></span><h1>{{(vm.data.coverage | number:2)||0}}%</h1><h4>Average test coverage</h4></div></div></div>");
$templateCache.put("{widgetsPath}/sonar/src/chart/edit.html","<style type=text/css></style><form role=form><div class=form-group ng-controller=\"editController as vm\"><label for=sample>API-URL</label><p><input class=form-control id=sample ng-model=config.apiUrl placeholder=Sonar-URL type=text ng-change=updateProjects()></p><label for=sample>Projekt</label> (*Pflichtfeld)<select name=project id=project class=form-control ng-model=config.project><option ng-repeat=\"project in vm.projects | orderBy: \'name\'\">{{project.name}}</option></select><label for=sample>Zeitspanne</label><p class=input-group><input class=form-control datepicker-options=dateOptions is-open=popup1.opened ng-model=config.fromDateTime placeholder=von show-button-bar=false type=text uib-datepicker-popup={{format}}> <span class=input-group-btn><button class=\"btn btn-default\" ng-click=open1() type=button><i class=\"glyphicon glyphicon-calendar\"></i></button></span></p><p class=input-group><input class=form-control datepicker-options=dateOptions is-open=popup2.opened ng-model=config.toDateTime placeholder=bis show-button-bar=false type=text uib-datepicker-popup={{format}}> <span class=input-group-btn><button class=\"btn btn-default\" ng-click=open2() type=button><i class=\"glyphicon glyphicon-calendar\"></i></button></span></p><p ng-init=\"config.timespan=null\"><label class=radio-inline><input name=timespan ng-model=config.timespan.week type=radio value=1>letzte Woche</label> <label class=radio-inline><input name=timespan ng-model=config.timespan.month type=radio value=1>letzter Monat</label> <label class=radio-inline><input name=timespan ng-model=config.timespan.year type=radio value=1>letztes Jahr</label></p><label for=sample>Kennzahlen Auswahl</label><div class=checkbox><label><input ng-model=config.metrics.linesOfCode type=checkbox>Codezeilen</label></div><div class=checkbox><label><input ng-model=config.metrics.technicalDebt type=checkbox>Technische Schuld (min)</label></div><div class=checkbox><label><input ng-model=config.metrics.amountTest type=checkbox>Anzahl Unit-Tests</label></div><div class=checkbox><label><input ng-model=config.metrics.testCoverage type=checkbox>Test Abdeckung (%)</label></div><div class=checkbox><label><input ng-model=config.metrics.issues type=checkbox>Offene Issues</label></div><div class=checkbox><label><input ng-model=config.metrics.rulesviolations type=checkbox>Code Wiederholung (%)</label></div></div></form>");
$templateCache.put("{widgetsPath}/sonar/src/chart/view.html","<style type=text/css></style><canvas id=line class=\"chart chart-line\" chart-data=vm.values chart-labels=vm.labels chart-legend=true chart-series=vm.series></canvas>");
$templateCache.put("{widgetsPath}/sonar/src/compare/edit.html","<form role=form><div class=form-group><label for=sample>API-URL</label> <input type=text class=form-control id=sample ng-model=config.apiUrl placeholder=Sonar-URL> <label for=sample>Projekt hinzufügen</label> <input type=text class=form-control id=sample ng-model=config.projectname1 ng-required=true placeholder=\"Projekt Links\"> <label for=sample>Projekt hinzufügen</label> <input type=text class=form-control id=sample ng-model=config.projectname2 ng-required=true placeholder=\"Projekt Rechts\"></div></form>");
$templateCache.put("{widgetsPath}/sonar/src/compare/view.html","<style>\n  .border{\n    border: 2px solid black;\n    padding: 0px;\n  }\n  .metricText{\n    text-align: left;\n  }\n  .centerText{\n    text-align: center;\n  }\n  .tableHead{\n    background-color: #F5F5F5;\n  }\n</style><div class=\"col-md-12 centerText\"><div class=\"col-md-4 border\"><div class=\"border metricText tableHead\"><h4>Metrik</h4></div><div ng-repeat=\"metric in vm.projectLeft\"><div class=metricText>{{metric.key}}</div></div></div><div class=\"col-md-4 border\"><div class=\"border tableHead\"><h4>{{config.projectname1}}</h4></div><div class=table-responsive ng-repeat=\"projectLeft in vm.projectLeft\"><div>{{projectLeft.frmt_val}}</div></div></div><div class=\"col-md-4 border\"><div class=\"border tableHead\"><h4>{{config.projectname2}}<h4></h4></h4></div><div class=table-responsive ng-repeat=\"projectRight in vm.projectRight\"><div>{{projectRight.frmt_val}}</div></div></div></div>");
$templateCache.put("{widgetsPath}/sonar/src/project-progress/edit.html","<form role=form><div class=form-group ng-controller=editController><label for=sample>Projekt</label> <input type=text class=form-control id=sample ng-model=config.projectname ng-required=true placeholder=Projektname> <label for=sample>Projekt Zeitraum</label><p class=input-group><input class=form-control datepicker-options=dateOptions is-open=popup1.opened ng-model=config.projectBeginn placeholder=von show-button-bar=false type=text uib-datepicker-popup={{format}}> <span class=input-group-btn><button class=\"btn btn-default\" ng-click=open1() type=button><i class=\"glyphicon glyphicon-calendar\"></i></button></span></p><p class=input-group><input class=form-control datepicker-options=dateOptions is-open=popup2.opened ng-model=config.projectEnd placeholder=bis show-button-bar=false type=text uib-datepicker-popup={{format}}> <span class=input-group-btn><button class=\"btn btn-default\" ng-click=open2() type=button><i class=\"glyphicon glyphicon-calendar\"></i></button></span></p></div></form>");
$templateCache.put("{widgetsPath}/sonar/src/project-progress/view.html","<style>\n  .daysLeft{\n    text-align: center;\n  }\n  .info{\n    width: 65%;\n    margin-left: 17.5%;\n    margin-top: -80%;\n    margin-bottom: 35%;\n  }\n</style><div class=daysLeft><div ng-init=\"progress=vm.progressProperties\"><round-progress max=progress.max current=progress.current color=\"{{ (current / max < 0.75) ? \'#EF3939\' : \'#337AB7\' }}\" bgcolor=#F5F5F5 radius=360 stroke=67 semi=false rounded=true clockwise=false responsive=true duration=800 animation=easeInOutQuart animation-delay=0></round-progress></div><div class=info><h1 style=font-size:2em>{{config.projectname}}</h1><h1>{{vm.result.daysLeft}}/{{vm.result.maxDays}}</h1><p>Projekttage</p></div></div>");}]);


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



sonarADFWidget.
controller('compare', compare);

function compare(data) {
  var vm = this;

  vm.projectLeft = data.projectLeft;
  vm.projectRight = data.projectRight;

}
compare.$inject = ["data"];



sonarADFWidget.
controller('sonarLineChart', sonarLineChart);
//setup controller
function sonarLineChart(data) {
  //initialize controller variable
  var vm = this;
  var series = [];
  var values = [];
  for (var i = 0; i < data.length; i++) {
    series.push(data[i].metric);
    values.push(data[i].values);
  }
  //problems if you put them in an array directly
  var linesOfCode = data.linesOfCode;
  var technicalDebt = data.technicalDebt;
  var coverage = data.coverage;
  var amountTest = data.amountTest;
  //setup the chart legend and labels
  vm.series = series;
  vm.labels = data[0].dates;
  vm.values = values;
}
sonarLineChart.$inject = ["data"];

sonarADFWidget.controller('editController', editController);

function editController($scope, $http, sonarApi) {
  var vm = this;
  $scope.updateProjects = function() {
    var url;
    if ($scope.config.apiUrl) {
      url = $scope.config.apiUrl;
    } else {
      url = jenkinsEndpoint.url;
    }
    vm.projects = [];
    sonarApi.getProjects(url).then(function(data) {
      data.forEach(function(project) {
        var proj = {
          name: project.key
        }
        vm.projects.push(proj);
      });
    });
  }
  $scope.updateProjects();

  //calendar
  $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function() {
    $scope.dt = null;
  };

  $scope.inlineOptions = {
    customClass: getDayClass,
    minDate: new Date(),
    showWeeks: true
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

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

  $scope.setDate = function(year, month, day) {
    $scope.dt = new Date(year, month, day);
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
editController.$inject = ["$scope", "$http", "sonarApi"];



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
    return sonarUrl + '/api/resources?metrics=ncloc,coverage';
  }

  function createApiUrlMetrics(sonarUrl, projectname) {
    return sonarUrl + '/api/resources?resource=' + projectname + '&metrics=open_issues,ncloc,public_documented_api_density,duplicated_lines_density,sqale_index';
  }

  function createApiQualityGate(sonarUrl, projectname) {
    return sonarUrl + '/api/qualitygates/project_status?projectKey=' + projectname;
  }

  function getQualityGateStatus(sonarUrl, projectname) {
    var apiUrl = createApiQualityGate(sonarUrl, projectname);
    return $http({
      method: 'GET',
      url: apiUrl,
      headers: {
        'Accept': 'application/json'
      }
    }).then(function(response) {
      var status = respsone[0].projectStatus;
      var result;
      if (status = "NONE") {
        result = "grey";
      }
      if (status = "WARN") {
        result = "orange";
      }
      if (status = "OK") {
        result = "green";
      }
      if (status = "ERROR") {
        result = "red";
      }

      return result;
    });
  }

  function getProjectTime(projectBeginn, projectEnd) {
    var beginn = new Date(projectBeginn);
    var end = new Date(projectEnd);
    var today = new Date();

    var maxDays = workingDaysBetweenDates(beginn, end);
    var daysLeft = workingDaysBetweenDates(today, end)
    console.log(end);
    console.log(today);
    console.log(beginn);
    var result = {
      'maxDays': maxDays,
      'daysLeft': daysLeft
    };
    return result;
  }

  function workingDaysBetweenDates(startDate, endDate) {

    // Validate input
    if (endDate < startDate)
      return 0;

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
      days = days - 2;

    // Remove start day if span starts on Sunday but ends before Saturday
    if (startDay == 0 && endDay != 6)
      days = days - 1

    // Remove end day if span ends on Saturday but starts after Sunday
    if (endDay == 6 && startDay != 0)
      days = days - 1

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
        var projectLeft = response[0].data[0].msr;
        var projectRight = response[1].data[0].msr;
        var projectMetrics = {
          'projectLeft': projectLeft,
          'projectRight': projectRight
        };
        return projectMetrics;
      });

    return responsesArray;
  }


  function getChartData(sonarUrl, projectname, fromDateTime, toDateTime, metrics, timespanRadio) {

    var apiUrl = "";
    var metricsString = createMetricsString(metrics);

    if (timespanRadio) {
      var today = new Date();
      if (timespanRadio.week) {
        fromDateTime = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      if (timespanRadio.month) {
        fromDateTime = new Date(today.getFullYear(), today.getMonth() - 1, today.getDay());
      }
      if (timespanRadio.year) {
        fromDateTime = new Date(today.getFullYear() - 1, today.getMonth(), today.getDay());
      }
      toDateTime = today;
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
      var response = response.data[0];
      var cols = response.cols;
      var cells = response.cells;
      var dates = [];
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
    })

  }

  function generateArray(projects) {
    var linesOfCode = 0;
    var linesOfCodeSum = 0;
    var coverage = 0;
    var avarageCoverage = 0;
    for (var i = 0; i < projects.length; i++) {
      if (projects[i].msr[0]) {
        linesOfCode = projects[i].msr[0].val;
        linesOfCodeSum += linesOfCode;
      }
      if (projects[i].msr[1]) {
        coverage = projects[i].msr[1].val;
        avarageCoverage += coverage;
      }
    }
    avarageCoverage = avarageCoverage / projects.length;
    var stats = {
      'linesOfCode': linesOfCodeSum,
      'coverage': avarageCoverage
    }
    return stats;
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
      var sonarProjects = response.data;
      console.log(sonarProjects);
      return sonarProjects;
    })
  }

  function parseStuff(sonarUrl) {
    var apiUrl = createApiUrlProjects(sonarUrl);

    return $http({
      method: 'GET',
      url: apiUrl,
      headers: {
        'Accept': 'application/json'
      }
    }).then(function(response) {
      var projects = response.data;
      var sonarProjects = generateArray(projects);
      return sonarProjects;
    })

  }


  return {
    getProjects: getProjects,
    parseStuff: parseStuff,
    getChartData: getChartData,
    getMetrics: getMetrics,
    getProjectTime: getProjectTime
  };

}
sonarApi.$inject = ["$http", "$q"];
})(window);