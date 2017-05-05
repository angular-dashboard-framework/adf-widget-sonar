'use strict';
//app initialisation with dependencies
var sonarADFWidget = angular.module('adf.widget.sonar', ['adf.provider', 'chart.js', 'ui.bootstrap', 'ui.bootstrap.datepicker','angular-svg-round-progressbar'])
.constant("sonarEndpoint", {
  "url": "https://sonarqube.com"
}).config(['ChartJsProvider', function (ChartJsProvider) {
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
  .config(function(dashboardProvider) {
    dashboardProvider
      .widget('sonar', {
        //setup adf widget
        title: 'All projects statistics',
        description: 'widget to display sonar statistics',
        templateUrl: '{widgetsPath}/sonar/src/view.html',
        resolve: {
          data: function(sonarApi, config, sonarEndpoint) {
            if (config.apiUrl) {
              return sonarApi.parseStuff(config.apiUrl);
            }
            else if (sonarEndpoint.url){
              return sonarApi.parseStuff(sonarEndpoint.url);
            }
            return 'Please Setup the Widget';
          }
        },
        category: 'SonarQube',
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
          data: function(sonarApi, config, sonarEndpoint) {
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
          }
        },
        category: 'SonarQube',
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
          data: function(sonarApi, config, sonarEndpoint) {

            if (config.apiUrl){
              return sonarApi.getMetrics(config.apiUrl, config.projectname1, config.projectname2);
            }
            else if (sonarEndpoint.url && config.projectname1 && config.projectname2){
              return sonarApi.getMetrics(sonarEndpoint.url, config.projectname1,config.projectname2);
            }
            return 'Please Setup the Widget';
          }
        },
        category: 'SonarQube',
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
          data: function(sonarApi, config, sonarEndpoint) {
            if (config.projectBeginn){
              return sonarApi.getProjectTime(config.projectBeginn, config.projectEnd);
            }
            return 'Please Setup the Widget';
          }
        },
        controller: 'progress',
        controllerAs: 'vm',
        edit: {
          templateUrl: '{widgetsPath}/sonar/src/project-progress/edit.html'
        }
      })

  });
