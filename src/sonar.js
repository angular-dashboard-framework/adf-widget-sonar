'use strict';
//app initialisation with dependencies
var sonarADFWidget = angular.module('adf.widget.sonar', ['adf.provider', 'chart.js', 'ui.bootstrap', 'ui.bootstrap.datepicker'])
.constant("sonarEndpoint", {
  "url": "https://nemo.sonarqube.org"
})
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
            if (config.apiUrl) {
              return sonarApi.getChartData(config.apiUrl, config.project, config.fromDateTime, config.toDateTime, config.metrics, config.timespan);
            }
            else if (sonarEndpoint.url && config.project && config.metrics){
              return sonarApi.getChartData(sonarEndpoint.url,config.project, config.fromDateTime, config.toDateTime, config.metrics, config.timespan);
            }
            return 'Please Setup the Widget';
          }
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
        controller: 'compare',
        controllerAs: 'vm',
        edit: {
          templateUrl: '{widgetsPath}/sonar/src/compare/edit.html'
        }
      })

  });
