'use strict';

var sonarADFWidget = angular.module('adf.widget.sonar', ['adf.provider'])
  .config(function(dashboardProvider) {
    dashboardProvider
      .widget('sonar', {
        title: 'sonar',
        description: 'widget to display sonar statistics',
        templateUrl: '{widgetsPath}/sonar/src/view.html',
        resolve: {
          data: function(sonarApi, config) {
            if (config.apiUrl) {
              return sonarApi.parseStuff(config.apiUrl);
            }
            return 'Please Setup the Widget';
          }
        },
        controller: 'sonarStatsCtrl',
        controllerAs: 'vm',
        edit: {
          templateUrl: '{widgetsPath}/sonar/src/edit.html'
        }
      });
  });
