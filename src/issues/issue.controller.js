'use strict';

sonarADFWidget.
        controller('sonarIssueCtrl', sonarIssueCtrl);

function sonarIssueCtrl(data, config) {
    var vm = this;

    if (data.length != 0) {

        angular.forEach(data, function (issue) {

            // Preparing displaying of issue components
            if (issue.subProject)
                issue.subProject = issue.subProject.slice(issue.component.search(":") + 1).replace(":", " ");
            if (issue.project)
                issue.project = issue.project.slice(issue.component.search(":") + 1).replace(":", " "); //eig wird noch "parent" abgeschnitten, aber keine Ahnung warum!
            if (issue.component)
                issue.component = issue.component.slice(issue.component.lastIndexOf(":") + 1);

            if (issue.type)
                issue.type = issue.type.replace("_", " ");

            for (var i = 0; i < issue.tags.length; i++) {
                if (i == 0)
                    issue.tag = issue.tags[i];
                else
                    issue.tag = issue.tag + ", " + issue.tags[i];
            }
        });

        // sorting the elements by project, subProject and component
        // has the structure: projects [project, subProject, component, projectIssues[]]
        vm.projects = new Array();
        vm.projects[0] = new Object();

        var counter = 0; //counting the projects
        var counter2 = 1; //counting the projectIssues per project
        for (var i = 0; i < data.length; i++) {

            if (data[i].status !== "CLOSED") {

                if (!vm.projects[counter].project) { //first initialisation of an object
                    vm.projects[counter] = new Object();
                    vm.projects[counter].project = data[i].project;
                    vm.projects[counter].subProject = data[i].subProject;
                    vm.projects[counter].component = data[i].component;
                    vm.projects[counter].projectIssue = new Array();
                    vm.projects[counter].projectIssue[0] = data[i];
                } else { //if there is already an object in vm.projects
                    if (data[i].project === vm.projects[counter].project
                            && data[i].subProject === vm.projects[counter].subProject
                            && data[i].component === vm.projects[counter].component) {
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
            }
        }
    }

    vm.sorting = function (issue) {
        if (config.sorting == "sortBySeverity")
            return vm.sortBySeverity(issue);
        else
            return vm.sortByEffort(issue);
    };


    vm.sortBySeverity = function (issue) {
        var severity = 0; //4=blocker, 3=critical, 2=major, 1=minor, 0=info
        for (var i = 0; i < issue.projectIssue.length; i++) {
            if (issue.projectIssue[i].severity === "BLOCKER")
                severity = 4;
            else if (issue.projectIssue[i].severity === "CRITICAL" && severity < 3)
                severity = 3;
            else if (issue.projectIssue[i].severity === "MAJOR" && severity < 2)
                severity = 2;
            else if (issue.projectIssue[i].severity === "MINOR" && severity < 1)
                severity = 1;
        }
        return -severity;
    };

    vm.sortByEffort = function (issue) {
        var effort = 0;
        for (var i = 0; i < issue.projectIssue.length; i++) {
            if (issue.projectIssue[i].effort && effort < parseInt(issue.projectIssue[i].effort.slice(0, issue.projectIssue[i].effort.search("m"))))
                effort = parseInt(issue.projectIssue[i].effort.slice(0, issue.projectIssue[i].effort.search("m")));
        }
        return -effort;
    };
}
