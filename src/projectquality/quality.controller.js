'use strict';

sonarADFWidget.controller('qualityCtrl', qualityCtrl);

function qualityCtrl(data) {
    var vm = this;
    vm.name = data.name;

    angular.forEach(data.msr, function (metric) {
        if (metric.key === "coverage") //going through all entries with if/elseif since there could miss some entries. So there is no special order
            vm.coverage = metric.frmt_val;
        else if (metric.key === "blocker_violations")
            vm.blocker = metric.frmt_val;
        else if (metric.key === "quality_gate_details") {
            vm.qualityGateStatus = metric.data.split('"')[3]; //structure of quality_gate_details: "level":"OK",...
        }
    });
}
