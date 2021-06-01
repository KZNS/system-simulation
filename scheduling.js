var NonNegInt = /^(0|[1-9]\d*)$/;

var processes = [];
var orderedProcesses = [];
var commited = false;
var hasWrongProcessInfo = false;

var arrivalTimeDefault;
var serviceTimeDefault;
var completionTimeDefault;
var turnaroundTimeDefault;
var turnaroundTimeWeightDefault;

var processInfoFormat;
var processProgressFormat;

var algorithm;

var processProgressMax;
var SimulationClock;
var simulating = false;

function getPageElements() {
    console.log("do getPageElements()");

    arrivalTimeDefault = $(".arrivalTime:first").val();
    serviceTimeDefault = $(".serviceTime:first").val();
    completionTimeDefault = $(".completionTime:first").text();
    turnaroundTimeDefault = $(".turnaroundTime:first").text();
    turnaroundTimeWeightDefault = $(".turnaroundTimeWeight:first").text();

    processInfoFormat = $(".processInfo:first").clone();

    processProgressFormat = $('.processProgress:first').clone();
}

function newProcess() {
    console.log("do newProcess()");
    var p = {
        id: 0,
        processId: "",
        progressId: "",
        arrivalTime: arrivalTimeDefault,
        serviceTime: serviceTimeDefault,
        completionTime: completionTimeDefault,
        turnaroundTime: turnaroundTimeDefault,
        turnaroundTimeWeight: turnaroundTimeWeightDefault,
        remainingTime: 0
    };
    return p;
}

function processInfoFormatFit(i) {
    processInfoFormat.find("th").text(i + 1);
    processInfoFormat.attr("id", processes[i].processId);
    processInfoFormat.find(".arrivalTime").attr("value", processes[i].arrivalTime);
    processInfoFormat.find(".serviceTime").attr("value", processes[i].serviceTime);
    processInfoFormat.find(".completionTime").text(processes[i].completionTime);
    processInfoFormat.find(".turnaroundTime").text(processes[i].turnaroundTime);
    processInfoFormat.find(".turnaroundTimeWeight").text(processes[i].turnaroundTimeWeight);
}
function processProgressFormatFit(i) {
    var p = processes[i];
    processProgressFormat.attr('id', 'progress' + i);
    processProgressFormat.find('th').text(i + 1);
    processProgressFormat.find('.progress').css('width', (p.serviceTime / processProgressMax * 80) + '%');
    processProgressFormat.find('.progress-bar').css('width', (p.remainingTime / p.serviceTime * 100) + '%');
    processProgressFormat.find('.progress-bar').text(p.remainingTime);
    processProgressFormat.find('.serviceTime').text(p.serviceTime);
}

function updateTable() {
    console.log("do updateTable()");

    var processInfosTbody = $("#processInfos").find("tbody");
    processInfosTbody.empty();

    for (i = 0; i < processes.length; i++) {
        processes[i].processId = "process" + i;
        processInfoFormatFit(i);
        processInfosTbody.append(processInfoFormat.prop('outerHTML'));
    }
    hasWrongProcessInfo = false;
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
    commited = false;
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
    if (NonNegInt.test(value) || (!commited && value == "")) {
        console.log("ok " + value);
        $(data).removeClass("is-invalid");
    }
    else {
        console.log("wrong " + value);
        hasWrongProcessInfo = true;
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

function initModal(data) {
    console.log("do initModal()");
    var target = $(data).attr("data-bs-target");
    $(target).find(".alert").removeClass("show");
}
function inputProcessInfos(data) {
    console.log("do inputProcessInfos()");
    var infos = $("#inputProcessInfos").val();
    processes = [];
    console.log(infos);
    datas = CSVToArray(infos);
    for (var i = 0; i < datas.length; i++) {
        if (datas[i].length != 2) {
            console.log(datas[i].length);
            $(data).siblings(".alert").addClass("show");
            return;
        }
        processes.push(newProcess());
        processes[i].arrivalTime = datas[i][0];
        processes[i].serviceTime = datas[i][1];
    }
    if (processes.length == 0) {
        processes.push(newProcess());
    }
    // 关闭
    $("#inputProcessInfos-Modal").modal("hide");
    updateTable();
}
function saveProcessInfos() {
    console.log("do saveProcessInfos()");
    var infos = processes[0].arrivalTime + ',' + processes[0].serviceTime;
    for (var i = 1; i < processes.length; i++) {
        infos = infos + '\n' + processes[i].arrivalTime + ',' + processes[i].serviceTime;
    }

    navigator.clipboard.writeText(infos)
}

function changeAlgorithm() {
    console.log("do changeAlgorithm()");
    uncalculate();
    updateTable();
}

function commitProcessInfos() {
    commited = true;
    updateTable();
    if (hasWrongProcessInfo) {
        console.log("hasWrongProcessInfo");
        return;
    }
    commited = false;
    algorithm = $("select").val();
    console.log(algorithm);

    getOrderedProcesses();

    calculate();
    updateTable();

    initSimulation();
    renderSimulation();
}
function getOrderedProcesses() {
    console.log('do getOrderedProcesses()');
    console.log(processes);
    orderedProcesses = [];
    for (var i = 0; i < processes.length; i++) {
        processes[i].arrivalTime = parseInt(processes[i].arrivalTime);
        processes[i].serviceTime = parseInt(processes[i].serviceTime);
        orderedProcesses.push({
            id: i,
            process: processes[i],
            arrivalTime: processes[i].arrivalTime,
            serviceTime: processes[i].serviceTime
        });
    }
    orderedProcesses.sort(
        function (a, b) {
            if (a.arrivalTime == b.arrivalTime) {
                return a.id - b.id;
            }
            else {
                return a.arrivalTime - b.arrivalTime;
            }
        }
    )
    console.log(orderedProcesses);

}
function calculate() {
    console.log("do calculate()");
    if (algorithm == 'FCFS') {
        calculateFCFS(orderedProcesses);
    }
    else if (algorithm == 'RR') {
        calculateRR(orderedProcesses);
    }
    else if (algorithm == 'SJF') {
        calculateSJF(orderedProcesses);
    }
    else if (algorithm == 'HRN') {
        calculateHRN(orderedProcesses);
    }
    calculateRest();
}
function uncalculate() {
    console.log("do uncalculate()");
    for (var i = 0; i < processes.length; i++) {
        processes[i].completionTime = completionTimeDefault;
        processes[i].turnaroundTime = turnaroundTimeDefault;
        processes[i].turnaroundTimeWeight = turnaroundTimeWeightDefault;
    }
}

function calculateRest() {
    for (var i = 0; i < processes.length; i++) {
        var process = processes[i];
        process.turnaroundTime = process.completionTime - process.arrivalTime;
        process.turnaroundTimeWeight = (process.turnaroundTime / process.serviceTime).toFixed(2);
    }
}
function calculateFCFS(ls) {
    console.log("calculating FCFS");
    var clock = 0;
    for (var i = 0; i < ls.length; i++) {
        clock = Math.max(clock, ls[i].arrivalTime);
        processes[ls[i].id].completionTime = clock + ls[i].serviceTime;
        clock += ls[i].serviceTime;
    }
}
function calculateRR(ls) {
    console.log("calculating RR");
    var clock = 0;
    var RRls = [];
    for (var i = 0; i < ls.length; i++) {
        if (RRls.length != 0) {
            var minRemainningTime = RRls[0].remainingTime;
            for (var j = 1; j < RRls.length; j++) {
                minRemainningTime = Math.min(minRemainningTime, RRls[j].remainingTime);
            }
            var step;
            step = Math.min(minRemainningTime - 1, Math.floor((ls[i].arrivalTime - clock) / RRls.length))
            for (var j = 0; j < RRls.length; j++) {
                RRls[j].remainingTime -= step;
            }
            clock += step * RRls.length;
            while (RRls.length != 0 && clock < ls[i].arrivalTime) {
                var process = RRls.shift();
                process.remainingTime--;
                clock++;
                if (process.remainingTime > 0) {
                    RRls.push(process);
                }
                else {
                    processes[process.process.id].completionTime = clock;
                }
            }
        }
        else {
            clock = Math.max(clock, ls[i].arrivalTime);
        }

        RRls.push({ process: ls[i], remainingTime: ls[i].serviceTime });
    }
    while (RRls.length != 0) {
        var minRemainningTime = RRls[0].remainingTime;
        for (var j = 1; j < RRls.length; j++) {
            minRemainningTime = Math.min(minRemainningTime, RRls[j].remainingTime);
        }
        clock += minRemainningTime * RRls.length;
        for (var i = 0; i < RRls.length; i++) {
            RRls[i].remainingTime -= minRemainningTime;
            if (RRls[i].remainingTime <= 0) {
                processes[RRls[i].process.id].completionTime = clock - (RRls.length - i - 1);
                RRls.splice(i, 1);
                i--;
            }
        }
    }
}
function calculateSJF(ls) {
    console.log("calculating SJF");
    var clock = 0;
    var SJFls = [];
    var i = 0;
    while (i < ls.length || SJFls.length > 0) {
        if (SJFls.length == 0) {
            clock = Math.max(clock, ls[i].arrivalTime);
        }
        while (i < ls.length && clock >= ls[i].arrivalTime) {
            SJFls.push(ls[i]);
            i++;
        }
        var minone = 0;
        for (var j = 1; j < SJFls.length; j++) {
            if (SJFls[j].serviceTime < SJFls[minone].serviceTime) {
                minone = j;
            }
        }
        clock += SJFls[minone].serviceTime;
        processes[SJFls[minone].id].completionTime = clock;
        SJFls.splice(minone, 1);
    }
}
function HRNWeight(clock, arrivalTime, serviceTime) {
    return (clock - arrivalTime + serviceTime) / serviceTime;
}
function calculateHRN(ls) {
    console.log("calculating HRN");
    var clock = 0;
    var HRNls = [];
    var i = 0;
    while (i < ls.length || HRNls.length > 0) {
        if (HRNls.length == 0) {
            clock = Math.max(clock, ls[i].arrivalTime);
        }
        while (i < ls.length && clock >= ls[i].arrivalTime) {
            HRNls.push({
                process: ls[i],
                weight: 0
            });
            i++;
        }
        var minone = 0;
        HRNls[0].weight = HRNWeight(clock, HRNls[0].process.arrivalTime, HRNls[0].process.serviceTime);
        for (var j = 1; j < HRNls.length; j++) {
            HRNls[j].weight = HRNWeight(clock, HRNls[j].process.arrivalTime, HRNls[j].process.serviceTime);
            if (HRNls[j].weight > HRNls[minone].weight) {
                minone = j;
            }
        }
        clock += HRNls[minone].process.serviceTime;
        processes[HRNls[minone].process.id].completionTime = clock;
        HRNls.splice(minone, 1);
    }
}

// ref: http://stackoverflow.com/a/1293163/2343
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
    );

    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;

    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            strMatchedDelimiter !== strDelimiter
        ) {

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);

        }

        var strMatchedValue;

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"),
                "\""
            );

        } else {

            // We found a non-quoted value.
            strMatchedValue = arrMatches[3];

        }

        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }

    // Return the parsed data.
    return (arrData);
}


var simulationLs = [];

function newSimulationItem(p) {
    return { process: p, weight: 0 };
}

function initSimulation() {
    console.log('do initSimulation()')
    processProgressMax = 0;
    for (var i = 0; i < processes.length; i++) {
        processes[i].remainingTime = processes[i].serviceTime;
        processProgressMax = Math.max(processProgressMax, processes[i].serviceTime);
    }
    SimulationClock = 0;
    simulationLs = [];
    simulating = true;
}
function renderSimulation() {
    console.log('do renderSimulation()');
    console.log(processes);
    var processorSimulationTbody = $('#processorSimulation').find('tbody');
    processorSimulationTbody.empty();

    for (var i = 0; i < processes.length; i++) {
        processProgressFormatFit(i);
        processorSimulationTbody.append(processProgressFormat.prop('outerHTML'));
    }

}
function updateSimulation() {
    console.log("do updateSimulation()");
}

function nextStep() {
    console.log('do nextStep()');
    if (!simulating) {
        return;
    }
    nextClock();
    updateSimulation();
}

function nextClock() {
    console.log('do nextClock()');
    if (algorithm == 'FCFS') {
        nextClockFCFS();
    }
    else if (algorithm == 'RR') {
        nextClockRR();
    }
    else if (algorithm == 'SJF') {
        nextClockSJF();
    }
    else if (algorithm == 'HRN') {
        nextClockHRN();
    }
    SimulationClock++;
}
function nextClockFCFS() {
    console.log('do nextClockFCFS()');
    while (orderedProcesses.length > 0) {
        var p = orderedProcesses[0].process;
        if (SimulationClock >= p.arrivalTime) {
            simulationLs.push(newSimulationItem(p));
            orderedProcesses.shift();
        }
        else {
            break;
        }
    }
    console.log(simulationLs);
    while (simulationLs.length > 0) {
        var p = simulationLs[0].process;
        console.log(p);
        if (p.remainingTime > 0) {
            p.remainingTime--;
            break;
        }
        else {
            simulationLs.shift();
        }
    }
}