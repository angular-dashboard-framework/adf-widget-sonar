'use strict';

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
