'use strict';

sonarADFWidget.
factory('sonarApi', sonarApi);

//function factory sonar
function sonarApi($http) {

  function createApiUrl(sonarUrl) {
    return sonarUrl + '/api/resources?metrics=ncloc,coverage&limit=10';
  }

  function generateArray(projects) {
    var sonarProjects = [];
    var linesOfCode = 0;
    var coverage = 0;
    for (var i = 0; i < projects.length; i++) {
      if (projects[i].msr[0]) {
        linesOfCode = projects[i].msr[0].val;
      }
      if (projects[i].msr[1]) {
        coverage = projects[i].msr[1].val;
      }
      sonarProjects.push({
        'id': projects[i].id,
        'name': projects[i].lname,
        'linesOfCode': linesOfCode,
        'coverage': coverage
      });
    }
    return sonarProjects;
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
