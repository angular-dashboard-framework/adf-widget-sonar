'use strict';

sonarADFWidget.
factory('sonarApi', sonarApi);

//function factory sonar
function sonarApi($http) {

  function createApiUrl(sonarUrl) {
    return sonarUrl + '/api/resources?metrics=ncloc,coverage';
  }
  function getChartData(sonarUrl){
    var apiUrl = sonarUrl+'/api/timemachine?resource=org.assertj:assertj-core&metrics=coveage,ncloc,sqale_index,coverage,tests';
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
      for (var i=0; i<cells.length;i++){
        linesOfCode.push(cells[i].v[0]);
        technicalDebt.push(cells[i].v[1]);
        coverage.push(cells[i].v[2]);
        amountTest.push(cells[i].v[3]);
        var date = cells[i].d.split("T");
        dates.push(date[0]);
      }
      var metrics = {'linesOfCode':linesOfCode,'technicalDebt':technicalDebt,'coverage':coverage,
      'amountTest':amountTest,'dates':dates
      }
      return metrics;
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
    avarageCoverage = avarageCoverage/projects.length;
    var stats ={'linesOfCode': linesOfCodeSum,
    'coverage': avarageCoverage}
    return stats;
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
