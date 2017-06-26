'use strict';
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
  .config(function(dashboardProvider) {
    dashboardProvider
      .widget('sonar-all-projects-statistics', {
        title: 'Sonar Statistics of all Projects ',
        description: 'Displays all SonarQube statistics',
        templateUrl: '{widgetsPath}/sonar/src/allProjects/view.html',
        resolve: {
          data: function(sonarApi, config, sonarEndpoint) {
            if (config.apiUrl) {
              return sonarApi.getAllProjectsStatistics(config.apiUrl);
            }
            else if (sonarEndpoint.url){
              return sonarApi.getAllProjectsStatistics(sonarEndpoint.url);
            }
            return 'Please Setup the Widget';
          }
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
          data: function(sonarApi, config, sonarEndpoint) {
            var apiUrl;
            if (config.apiUrl) {
              apiUrl = config.apiUrl;
            } else {
              apiUrl = sonarEndpoint.url;
            }
            if (apiUrl && config.project && config.metrics){
              return sonarApi.getChartData(apiUrl, config.project, config.metrics, config.timespan);
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
      .widget('sonar-compare', {
        title: 'Sonar Project Compare',
        description: 'Displays a table to compare two projects',
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
      .widget('project-progress', {
        title: 'Project Progress',
        description: 'Visualizes the progress of a project',
        templateUrl: '{widgetsPath}/sonar/src/project-progress/view.html',
        resolve: {
          data: function(sonarApi, config) {
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
      .widget('sonar-my-issues', {
        title: 'Sonar: My Issues',
        description: 'Displays all issues of yourself',
        templateUrl: '{widgetsPath}/sonar/src/issues/view.html',
        resolve: {
          data: function(sonarApi, config, sonarEndpoint) {
            if (config.apiUrl) {
              return sonarApi.getAllMyIssues(config.apiUrl);
            }
            else if (sonarEndpoint.url){
              return sonarApi.getAllMyIssues(sonarEndpoint.url);
            }
            return 'Please Setup the Widget';
          }
        },
        category: 'SonarQube',
        controller: 'sonarIssueCtrl',
        controllerAs: 'vm',
        edit: {
             templateUrl: '{widgetsPath}/sonar/src/issues/edit.html'
        }
      })
      .widget('sonar-projectquality', {
        title: 'Sonar: Projectquality of a Project',
        description: 'Displays Status of the Quality Gate, Code Coverage and Blocker Issues',
        templateUrl: '{widgetsPath}/sonar/src/projectquality/view.html',
        resolve: {
          data: function(sonarApi, config, sonarEndpoint) {
            if (config.apiUrl && config.project) {
              return sonarApi.getProjectquality(config.apiUrl, config.project);
            }
            else if (sonarEndpoint.url && config.project){
              return sonarApi.getProjectquality(sonarEndpoint.url, config.project);
            }
            return 'Please Setup the Widget';
          }
        },
        category: 'SonarQube',
        controller: 'qualityCtrl',
        controllerAs: 'vm',
        edit: {
             templateUrl: '{widgetsPath}/sonar/src/projectquality/edit.html'
        }
      });

  });
