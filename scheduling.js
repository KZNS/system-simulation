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
