'use strict';

sonarADFWidget.
        controller('sonarIssueCtrl', sonarIssueCtrl);

function sonarIssueCtrl(data) {
    var vm = this;


    angular.forEach(data, function (issue) {
        issue.subProject = issue.subProject.slice(issue.component.search(":") + 1).replace(":", " ");
        issue.project = issue.project.slice(issue.component.search(":") + 1).replace(":", " "); //eig wird noch "parent" abgeschnitten, aber keine Ahnung warum!
        issue.component = issue.component.slice(issue.component.lastIndexOf(":") + 1);

        issue.status = issue.status.toLowerCase();
        issue.severity = issue.severity.toLowerCase();
        issue.type = issue.type.toLowerCase().replace("_", " ");
        
        for(var i=0; i<issue.tags.length; i++){
            if(i==0)
                issue.tag= issue.tags[i];
           else {
                issue.tag = issue.tag + ", ";
            issue.tag = issue.tag + issue.tags[i];
        }
        }
    });

    // sorting the elements by project, subProject and component
    // has the structure: projects [project, subProject, component, projectIssues]
    vm.projects = new Array();
    vm.projects[0] = new Object();
    vm.projects[0].project = data[0].project;
    vm.projects[0].subProject = data[0].subProject;
    vm.projects[0].component = data[0].component;
    vm.projects[0].projectIssue = new Array();
    vm.projects[0].projectIssue[0] = data[0];

    var counter = 0; //counting the projects
    var counter2 = 1; //counting the projectIssues per project
    for (var i = 1; i < data.length; i++) {
        if (data[i].project == vm.projects[counter].project
                && data[i].subProject == vm.projects[counter].subProject
                && data[i].component == vm.projects[counter].component) {
            vm.projects[counter].projectIssue[counter2] = data[i];
            counter2 = counter2 + 1;
        } else {
            counter = counter + 1;
            counter2 = 1;
            vm.projects[counter] = new Object();
            vm.projects[counter].project = data[i].project;
            vm.projects[counter].subProject = data[i].subProject;
            vm.projects[counter].component = data[i].component;
            vm.projects[counter].projectIssue = new Array;
            vm.projects[counter].projectIssue[0] = data[i];
        }

    }
    
    
    console.log(vm);
}
