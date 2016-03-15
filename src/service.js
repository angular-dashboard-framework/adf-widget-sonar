'use strict';

sonarADFWidget.
factory('sonarApi', sonarApi);

//function factory sonar
function sonarApi($http) {

  function createApiUrl(sonarUrl) {
    return sonarUrl + '/api/resources?metrics=ncloc,coverage&limit=10';
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
    parseStuff: parseStuff
  };

}
