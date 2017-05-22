'use strict';

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
  
  function createApiUrlAllMyIssues(sonarUrl) {
    return sonarUrl + '/api/issues/search?assignees=pczora';//___me__'; //--> nur zum Testen, eigentlich ist es __me__!
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
  
  function getAllMyIssues(sonarUrl){
    var apiUrl = createApiUrlAllMyIssues(sonarUrl);

    return $http({
      method: 'GET',
      url: apiUrl,
      headers: {
        'Accept': 'application/json'
      }
    }).then(function(response) {
      return response.data.issues;
    });
  }

  return {
    getProjects: getProjects,
    getAllProjectsStatistics: getAllProjectsStatistics,
    getChartData: getChartData,
    getMetrics: getMetrics,
    getProjectTime: getProjectTime,
    getAllMyIssues: getAllMyIssues
  };

}
