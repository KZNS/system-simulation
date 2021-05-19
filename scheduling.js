var processors = [];

var completionTimeDefault;
var turnaroundTimeDefault;
var turnaroundTimeRightsDefault;

var processorInfoFormat;

function getPageElements() {
    console.log("do getPageElements()");

    completionTimeDefault = $(".completionTime:first").text();
    turnaroundTimeDefault = $(".turnaroundTime:first").text();
    turnaroundTimeRightsDefault = $(".turnaroundTimeRights:first").text();

    processorInfoFormat = $(".processorInfo:first").clone();
}

function newProcessor() {
    console.log("do newProcessor()");
    var p = {
        arrivalTime: null,
        serviceTime: null,
        completionTime: completionTimeDefault,
        turnaroundTime: turnaroundTimeDefault,
        turnaroundTimeRights: turnaroundTimeRightsDefault
    };
    return p;
}

function formatFitProcessor(i) {
    processorInfoFormat.find("th").text(i + 1);
    processorInfoFormat.find(".arrivalTime").attr("value", processors[i].arrivalTime);
    processorInfoFormat.find(".serviceTime").attr("value", processors[i].serviceTime);
    processorInfoFormat.find(".completionTime").text(processors[i].completionTime);
    processorInfoFormat.find(".turnaroundTime").text(processors[i].turnaroundTime);
    processorInfoFormat.find(".turnaroundTimeRights").text(processors[i].turnaroundTimeRights);
}

function updateTable() {
    console.log("do updateTable()");
    var processorInfosTbody = $("#processorsInfos").find("tbody");
    processorInfosTbody.empty();

    for (i = 0; i < processors.length; i++) {
        formatFitProcessor(i);
        processorInfosTbody.append(processorInfoFormat.prop('outerHTML'));
    }
}

function newProcessorInfo() {
    console.log("do newProcessorInfo()");

    processors.push(newProcessor());
    updateTable();
}
function delProcessorInfoLast() {
    console.log("do delProcessorInfoLast()");

    processors.pop();
    if (processors.length == 0) {
        processors.push(newProcessor());
    }
    updateTable();
}
function delProcessorInfoAll() {
    console.log("do delProcessorInfoAll()");

    processors = [];
    processors.push(newProcessor());
    updateTable();
}

function initPage() {
    console.log("do initPage()");

    getPageElements();
    processors.push(newProcessor());
    updateTable();
}