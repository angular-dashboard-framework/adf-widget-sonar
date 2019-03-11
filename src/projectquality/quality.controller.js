'use strict';

sonarADFWidget.controller('qualityCtrl', qualityCtrl);

function qualityCtrl(data) {
    var vm = this;
    vm.project = data.project.split(':')[1];;
    vm.url = data.url;


    angular.forEach(data.quality_index, function (metric) {
        if (metric.metric === "coverage") //going through all entries with if/elseif since there could miss some entries. So there is no special order
            vm.coverage = metric.value;
        else if (metric.metric === "blocker_violations")
            vm.blocker = metric.value;
        else if (metric.metric === "alert_status") {
            vm.qualityGateStatus = metric.value;
        }
        else if (metric.metric === "sqale_index") {
          vm.technicalDept = metric.value;
        }
        else if (metric.metric === "vulnerabilities") {
          vm.vulnerabilities = metric.value;
        }
    });
}
