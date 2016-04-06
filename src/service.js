'use strict';

sonarADFWidget.
factory('sonarApi', sonarApi);

//function factory sonar
function sonarApi($http) {

  function createApiUrl(sonarUrl) {
    return sonarUrl + '/api/resources?metrics=ncloc,coverage';
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
    return metricsString.slice(0, -1);
  }



  function getChartData(sonarUrl, projectname, fromDateTime, toDateTime, metrics, timespanRadio) {

    var apiUrl = "";
    var metricsString = createMetricsString(metrics);

    if (timespanRadio) {
      var today = new Date();
      console.log(timespanRadio);
      if (timespanRadio.week) {
        fromDateTime = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      if (timespanRadio.month) {
        fromDateTime = new Date(today.getFullYear(),today.getMonth()-1,today.getDay());
      }
      if (timespanRadio.year) {
        fromDateTime = new Date(today.getFullYear()-1,today.getMonth(),today.getDay());
      }
      toDateTime = today;

    }
    if ((fromDateTime && toDateTime)) {
      apiUrl = sonarUrl + '/api/timemachine?resource=' + projectname + '&metrics=' + metricsString + '&fromDateTime=' + fromDateTime + '&toDateTime=' + toDateTime;
    }else{
      apiUrl = sonarUrl + '/api/timemachine?resource=' + projectname + '&metrics=' + metricsString;
    }
    console.log(apiUrl);

    return $http({
      method: 'GET',
      url: apiUrl,
      headers: {
        'Accept': 'application/json'
      }
    }).then(function(response) {
      var cells = response.data[0].cells;
      var linesOfCode = [];
      var technicalDebt = [];
      var coverage = [];
      var dates = [];
      var amountTest = [];
      for (var i = 0; i < cells.length; i++) {
        if (metrics.linesOfCode) {
          linesOfCode.push(cells[i].v[0]);
        }
        if (metrics.technicalDebt) {
          technicalDebt.push((cells[i].v[1] / 60 / 24).toFixed(2));
        }
        if (metrics.amountTest) {
          amountTest.push(cells[i].v[2]);
        }
        if (metrics.coverage) {
          coverage.push(cells[i].v[3]);
        }
        var date = cells[i].d.split("T");
        dates.push(date[0]);
      }

      var metricsArray = {
        'linesOfCode': linesOfCode,
        'technicalDebt': technicalDebt,
        'coverage': coverage,
        'amountTest': amountTest,
        'dates': dates
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
function getProjects(sonarUrl){
  var apiUrl = createApiUrl(sonarUrl);

  return $http({
    method: 'GET',
    url: apiUrl,
    headers: {
      'Accept': 'application/json'
    }
  }).then(function(response) {
    var projects = response.data;

    return sonarProjects;
  })
}

  function parseStuff(sonarUrl) {
    var apiUrl = createApiUrl(sonarUrl);

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
    parseStuff: parseStuff,
    getChartData: getChartData
  };

}
