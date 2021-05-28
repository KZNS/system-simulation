var NonNegInt = /^(|0|[1-9]\d*)$/;

var processes = [];

var arrivalTimeDefault;
var serviceTimeDefault;
var completionTimeDefault;
var turnaroundTimeDefault;
var turnaroundTimeRightsDefault;

var processInfoFormat;

function getPageElements() {
    console.log("do getPageElements()");

    arrivalTimeDefault = $(".arrivalTime:first").val();
    serviceTimeDefault = $(".serviceTime:first").val();
    completionTimeDefault = $(".completionTime:first").text();
    turnaroundTimeDefault = $(".turnaroundTime:first").text();
    turnaroundTimeRightsDefault = $(".turnaroundTimeRights:first").text();

    processInfoFormat = $(".processInfo:first").clone();
}

function newProcess() {
    console.log("do newProcess()");
    var p = {
        processId: "",
        arrivalTime: arrivalTimeDefault,
        serviceTime: serviceTimeDefault,
        completionTime: completionTimeDefault,
        turnaroundTime: turnaroundTimeDefault,
        turnaroundTimeRights: turnaroundTimeRightsDefault
    };
    return p;
}

function formatFitProcess(i) {
    processInfoFormat.find("th").text(i + 1);
    processInfoFormat.attr("id", processes[i].processId);
    processInfoFormat.find(".arrivalTime").attr("value", processes[i].arrivalTime);
    processInfoFormat.find(".serviceTime").attr("value", processes[i].serviceTime);
    processInfoFormat.find(".completionTime").text(processes[i].completionTime);
    processInfoFormat.find(".turnaroundTime").text(processes[i].turnaroundTime);
    processInfoFormat.find(".turnaroundTimeRights").text(processes[i].turnaroundTimeRights);
}

function updateTable() {
    console.log("do updateTable()");

    var processInfosTbody = $("#processInfos").find("tbody");
    processInfosTbody.empty();

    for (i = 0; i < processes.length; i++) {
        processes[i].processId = "process" + i;
        formatFitProcess(i);
        processInfosTbody.append(processInfoFormat.prop('outerHTML'));
    }

    processInfosTbody.find("input").trigger("oninput");
}

function newProcessInfo() {
    console.log("do newProcessInfo()");

    processes.push(newProcess());
    updateTable();
}
function delProcessInfoThis(data) {
    console.log("do delProcessInfoThis()");

    var processId = $(data).parents("tr").attr("id");
    console.log("del " + processId);
    for (var i = 0; i < processes.length; i++) {
        if (processes[i].processId == processId) {
            processes.splice(i, 1);
            break;
        }
    }
    if (processes.length == 0) {
        processes.push(newProcess());
    }
    updateTable();
}
function delProcessInfoLast() {
    console.log("do delProcessInfoLast()");

    processes.pop();
    if (processes.length == 0) {
        processes.push(newProcess());
    }
    updateTable();
}
function delProcessInfoAll() {
    console.log("do delProcessInfoAll()");

    processes = [];
    processes.push(newProcess());
    updateTable();
}

function initPage() {
    console.log("do initPage()");

    getPageElements();
    processes.push(newProcess());
    updateTable();
}

function checkNonNegInt(data) {
    var value = $(data).val();
    if (NonNegInt.test(value)) {
        console.log("ok " + value);
        $(data).removeClass("is-invalid");
    }
    else {
        console.log("wrong " + value);
        if (!$(data).hasClass("is-invalid")) {
            $(data).addClass("is-invalid");
        }
    }
}

function bindingProcess(data) {
    console.log("do bindingProcess()");
    var value = $(data).val();
    var attr = "";
    var processId = $(data).parents("tr").attr("id");
    var index = processId.replace(/[^0-9]/ig, "");

    if ($(data).hasClass("arrivalTime")) {
        attr = "arrivalTime";
    }
    else if ($(data).hasClass("serviceTime")) {
        attr = "serviceTime";
    }
    else {
        console.log("wrong in bindingProcess()");
        return;
    }

    processes[index][attr] = value;
    console.log(processes[index]);
}