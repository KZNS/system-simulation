/**
 * @file 处理器调度页面控制、模拟动画
 * @author KZNS
 */

// --------------------------------
// 页面初始化
// --------------------------------

// 页面格式模板
var processInfoFormat;
var processProgressFormat;
// 进程信息默认值
var arrivalTimeDefault;
var serviceTimeDefault;
var completionTimeDefault;
var turnaroundTimeDefault;
var turnaroundTimeWeightDefault;
/**
 * 获取html页面中的dom元素，
 * 根据dom设置页面格式模板，进程信息默认值
 */
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
/**
 * 初始化页面
 */
function initPage() {
    console.log("do initPage()");

    getPageElements();
    processes.push(newProcess());
    updateTable();
}

// --------------------------------
// 算法选择
// --------------------------------

// 选择的算法名称
var algorithm;
/**
 * 修改选择算法时触发
 * 取消提交进程信息
 */
function changeAlgorithm() {
    console.log("do changeAlgorithm()");
    uncommitProcessInfos();
    updateTable();
}

// --------------------------------
// 进程信息输入表格
// --------------------------------

// 进程信息列表
var processes = [];
/**
 * 生成一个新process元素并返回
 * @returns 一个新procss元素
 */
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
/**
 * 添加一行表格在最后
 */
function newProcessInfo() {
    console.log("do newProcessInfo()");

    processes.push(newProcess());
    uncommitProcessInfos();
    updateTable();
}
/**
 * 添加一行随机数据
 */
function newProcessInfoRandom() {
    console.log("do newProcessInfoRandom()");

    processes.push(newProcess());
    uncommitProcessInfos();
    processes[processes.length - 1].arrivalTime = Math.ceil(Math.random() * 60);
    processes[processes.length - 1].serviceTime = Math.ceil(Math.random() * 15);

    updateTable();
}
/**
 * 删除表格当前行
 * @param {DOM} data 当前DOM元素
 */
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
    uncommitProcessInfos();
    updateTable();
}
/**
 * 删除表格最后一行
 */
function delProcessInfoLast() {
    console.log("do delProcessInfoLast()");

    processes.pop();
    if (processes.length == 0) {
        processes.push(newProcess());
    }
    uncommitProcessInfos();
    updateTable();
}
/**
 * 删除全部表格
 */
function delProcessInfoAll() {
    console.log("do delProcessInfoAll()");

    processes = [];
    processes.push(newProcess());
    commited = false;
    uncommitProcessInfos();
    updateTable();
}

// --------------------------------
// 进程信息表格显示
// --------------------------------
/**
 * 将进程信息填入格式模板
 * @param {Number} i 进程信息的数组下标
 */
function processInfoFormatFit(i) {
    processInfoFormat.find("th").text(i + 1);
    processInfoFormat.attr("id", processes[i].processId);
    processInfoFormat.find(".arrivalTime").attr("value", processes[i].arrivalTime);
    processInfoFormat.find(".serviceTime").attr("value", processes[i].serviceTime);
    processInfoFormat.find(".completionTime").text(processes[i].completionTime);
    processInfoFormat.find(".turnaroundTime").text(processes[i].turnaroundTime);
    processInfoFormat.find(".turnaroundTimeWeight").text(processes[i].turnaroundTimeWeight);
}
/**
 * 刷新表格
 */
function updateTable() {
    console.log("do updateTable()");

    var processInfosTbody = $("#processInfos").find("tbody");
    processInfosTbody.empty();

    for (i = 0; i < processes.length; i++) {
        processes[i].id = i;
        processes[i].processId = "process" + i;
        processInfoFormatFit(i);
        processInfosTbody.append(processInfoFormat.prop('outerHTML'));
    }
    hasWrongProcessInfo = false;
    processInfosTbody.find("input").trigger("oninput");
}

// --------------------------------
// 输入信息处理
// --------------------------------

// 正整数格式
var positiveInt = /^([1-9]\d*)$/;
// 错误数据有无标记
var hasWrongProcessInfo = false;
/**
 * 检查当前输入是否合法
 * @param {DOM} data 当前DOM元素
 */
function checkData(data) {
    var value = $(data).val();
    if (positiveInt.test(value) || (!commited && value == "")) {
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
/**
 * 绑定页面元素和进程信息列表
 * @param {DOM} data 当前DOM元素
 */
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

// --------------------------------
// 批量读入和保存进程信息
// --------------------------------
/**
 * 处理批量输入的进程信息数据
 * @param {DOM} data 当前DOM元素
 */
function inputProcessInfos(data) {
    console.log("do inputProcessInfos()");
    uncommitProcessInfos();
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
    // 关闭模态框
    $("#inputProcessInfos-Modal").modal("hide");
    updateTable();
}
/**
 * 保存当前进程信息到剪贴板
 */
function saveProcessInfos() {
    console.log("do saveProcessInfos()");
    var infos = processes[0].arrivalTime + ',' + processes[0].serviceTime;
    for (var i = 1; i < processes.length; i++) {
        infos = infos + '\n' + processes[i].arrivalTime + ',' + processes[i].serviceTime;
    }

    navigator.clipboard.writeText(infos)
}
/**
 * 排序进程信息，按照到达时间
 */
function sortProcessInfos() {
    console.log("do sortProcessInfos()");
    processes.sort(
        function (a, b) {
            var aT, bT;
            if (positiveInt.test(a.arrivalTime)) {
                aT = parseInt(a.arrivalTime);
            }
            else {
                aT = 1000000;
            }
            if (positiveInt.test(b.arrivalTime)) {
                bT = parseInt(b.arrivalTime);
            }
            else {
                bT = 1000000;
            }
            if (aT == bT) {
                return a.id - b.id;
            }
            else {
                return aT - bT;
            }
        }
    )
    updateTable();
}

// --------------------------------
// 数据提交
// --------------------------------

// 是否正在提交
var commited = false;
/**
 * 提交数据
 * 检查数据完整性，计算调度结果，初始化模拟部分
 */
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

    calculate();
    updateTable();

    initSimulation();
}
function uncommitProcessInfos() {
    uncalculate();
    simulating = false;
    pausePlay();
}

// --------------------------------
// 计算调度信息
// --------------------------------

// 按照到达时间排序后的进程信息列表
var orderedProcesses = [];
/**
 * 获得按照到达时间排序的进程信息列表
 */
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
/**
 * 计算机进程调度信息
 */
function calculate() {
    console.log("do calculate()");
    getOrderedProcesses();
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
/**
 * 删除进程调度结果
 */
function uncalculate() {
    console.log("do uncalculate()");
    for (var i = 0; i < processes.length; i++) {
        processes[i].completionTime = completionTimeDefault;
        processes[i].turnaroundTime = turnaroundTimeDefault;
        processes[i].turnaroundTimeWeight = turnaroundTimeWeightDefault;
    }
}
/**
 * 计算HRN优先权
 * @param {Number} clock 当前时钟
 * @param {Number} arrivalTime 到达时间
 * @param {Number} serviceTime 服务时间
 * @returns HRN优先权
 */
function HRNWeight(clock, arrivalTime, serviceTime) {
    return (clock - arrivalTime + serviceTime) / serviceTime;
}
/**
 * 计算HRN优先权
 * @param {Number} clock 当前时钟
 * @param {Process} p 进程信息
 * @returns HRN优先权
 */
function HRNWeight(clock, p) {
    return (clock - p.arrivalTime + p.serviceTime) / p.serviceTime;
}
/**
 * 根据FCFS计算调度信息
 * @param {Array} ls 排序后进程信息列表
 */
function calculateFCFS(ls) {
    console.log("calculating FCFS");
    var clock = 0;
    for (var i = 0; i < ls.length; i++) {
        clock = Math.max(clock, ls[i].arrivalTime);
        processes[ls[i].id].completionTime = clock + ls[i].serviceTime;
        clock += ls[i].serviceTime;
    }
}
/**
 * 根据RR计算调度信息
 * @param {Array} ls 排序后进程信息列表
 */
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
/**
 * 根据SJF计算调度信息
 * @param {Array} ls 排序后进程信息列表
 */
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
/**
 * 根据SJF计算调度信息
 * @param {Array} ls 排序后进程信息列表
 */
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
/**
 * 计算剩余调度信息
 */
function calculateRest() {
    for (var i = 0; i < processes.length; i++) {
        var process = processes[i];
        process.turnaroundTime = process.completionTime - process.arrivalTime;
        process.turnaroundTimeWeight = (process.turnaroundTime / process.serviceTime).toFixed(2);
    }
}


// --------------------------------
// 模拟
// --------------------------------

// 模拟器处理队列
var simulationLs = [];
// 模拟器时钟
var SimulationClock;
// 模拟中标记
var simulating = false;

// 操作记录
var operationLogs = [];
// 正在处理指针
var processing = -1;
// 进程服务时间最大值
var processProgressMax;

// --------------------------------
// 模拟显示
// --------------------------------

/**
 * 根据进程信息创建模拟器元素并返回
 * @param {Process} p 进程信息
 * @returns 新模拟器元素
 */
function newSimulationItem(p) {
    return { process: p, weight: 0 };
}
/**
 * 将进程信息装入模拟器模板
 * @param {Number} i 进程信息列表下标
 */
function processProgressFormatFit(i) {
    var p = processes[i];
    processProgressFormat.attr('id', p.progressId);
    processProgressFormat.find('th').text(i + 1);
    processProgressFormat.find('.arrivalTime').text(p.arrivalTime);
    processProgressFormat.find('.progress').css('width', (p.serviceTime / processProgressMax * 80) + '%');
    processProgressFormat.find('.progress-bar').css('width', (p.remainingTime / p.serviceTime * 100) + '%');
    processProgressFormat.find('.progress-bar').text(p.remainingTime);
    processProgressFormat.find('.serviceTime').text(p.serviceTime);
}
/**
 * 初始化模拟器
 */
function initSimulation() {
    console.log('do initSimulation()');
    pausePlay();
    getOrderedProcesses();
    processProgressMax = 0;
    for (var i = 0; i < processes.length; i++) {
        processes[i].progressId = 'progress' + i;
        processes[i].remainingTime = processes[i].serviceTime;
        processProgressMax = Math.max(processProgressMax, processes[i].serviceTime);
    }
    SimulationClock = 0;
    simulationLs = [];
    simulating = true;
    operationLogs = [];
    processing = -1;
    renderSimulation();
}
/**
 * 渲染模拟器
 */
function renderSimulation() {
    console.log('do renderSimulation()');
    console.log(processes);
    var processorSimulationTbody = $('#processorSimulation').find('tbody');
    processorSimulationTbody.empty();

    for (var i = 0; i < processes.length; i++) {
        processProgressFormatFit(i);
        processorSimulationTbody.append(processProgressFormat.prop('outerHTML'));
    }
    $('#SimulationClock').val(SimulationClock);
}
/**
 * 更新模拟器
 */
function updateSimulation() {
    console.log("do updateSimulation()");
    for (var i = 0; i < processes.length; i++) {
        var p = processes[i];
        $('#' + p.progressId).find('.progress-bar').css('width', (p.remainingTime / p.serviceTime * 100) + '%');
        $('#' + p.progressId).find('.progress-bar').text(p.remainingTime);
    }
    $('#SimulationClock').val(SimulationClock);
}

// --------------------------------
// 逐步模拟
// --------------------------------
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
    checkArrivalTime();
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
function checkArrivalTime() {
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
}
function nextClockFCFS() {
    console.log('do nextClockFCFS()');
    console.log(simulationLs);
    if (simulationLs.length > 0) {
        var p = simulationLs[0].process;
        console.log(p);
        p.remainingTime--;
        operationLogs.push(simulationLs[0]);
        if (p.remainingTime <= 0) {
            simulationLs.shift();
        }
    }
    else {
        operationLogs.push(null);
    }
}
function nextClockRR() {
    console.log('do nextClockRR()');
    console.log(simulationLs);
    if (simulationLs.length > 0) {
        var item = simulationLs.shift();
        var p = item.process;
        p.remainingTime--;
        operationLogs.push(item);
        if (p.remainingTime > 0) {
            simulationLs.push(item);
        }
    }
    else {
        operationLogs.push(null);
    }
}
function nextClockSJF() {
    console.log('do nextClockSJF()');
    console.log(simulationLs);
    if (processing == -1 && simulationLs.length > 0) {
        processing = 0;
        for (var i = 1; i < simulationLs.length; i++) {
            if (simulationLs[i].process.serviceTime < simulationLs[processing].process.serviceTime) {
                processing = i;
            }
        }
    }
    if (processing != -1) {
        var p = simulationLs[processing].process;
        p.remainingTime--;
        operationLogs.push(simulationLs[processing]);
        if (p.remainingTime <= 0) {
            simulationLs.splice(processing, 1);
            processing = -1;
        }
    }
    else {
        operationLogs.push(null);
    }
}
function nextClockHRN() {
    console.log('do nextClockHRN()');
    console.log(simulationLs);
    if (processing == -1 && simulationLs.length > 0) {
        processing = 0;
        for (var i = 1; i < simulationLs.length; i++) {
            if (HRNWeight(SimulationClock, simulationLs[i].process) > HRNWeight(SimulationClock, simulationLs[processing].process)) {
                processing = i;
            }
        }
    }
    if (processing != -1) {
        var p = simulationLs[processing].process;
        p.remainingTime--;
        operationLogs.push(simulationLs[processing]);
        if (p.remainingTime <= 0) {
            simulationLs.splice(processing, 1);
            processing = -1;
        }
    }
    else {
        operationLogs.push(null);
    }
}
function prevStep() {
    console.log('do lastStep()');
    if (!simulating) {
        return;
    }
    prevClock();
    updateSimulation();
}
function prevClock() {
    console.log('do lastClock()');
    if (SimulationClock <= 0) {
        return;
    }
    SimulationClock--;
    if (algorithm == 'FCFS') {
        prevClockFCFS();
    }
    else if (algorithm == 'RR') {
        prevClockRR();
    }
    else if (algorithm == 'SJF') {
        prevClockSJF();
    }
    else if (algorithm == 'HRN') {
        prevClockHRN();
    }
    uncheckArrivalTime();
}
function uncheckArrivalTime() {
    while (simulationLs.length > 0) {
        var p = simulationLs[simulationLs.length - 1].process;
        if (SimulationClock <= p.arrivalTime) {
            orderedProcesses.unshift({
                id: p.id,
                process: p,
                arrivalTime: p.arrivalTime,
                serviceTime: p.serviceTime
            });
            simulationLs.pop();
        }
        else {
            break;
        }
    }
}
function prevClockFCFS() {
    console.log('do prevClockFCFS()');
    var item = operationLogs.pop();
    console.log(item);
    if (!(item === null)) {
        if (item.process.remainingTime <= 0) {
            simulationLs.unshift(item);
        }
        item.process.remainingTime++;
    }
    console.log(simulationLs);
}
function prevClockRR() {
    console.log('do prevClockRR()');
    var item = operationLogs.pop();
    if (!(item === null)) {
        simulationLs.unshift(item);
        if (!item.process.remainingTime >= 0) {
            simulationLs.pop();
        }
        item.process.remainingTime++;
    }
    console.log(simulationLs);
}
function prevClockSJF() {
    console.log('do prevClockSJF()');
    var item = operationLogs.pop();
    if (!(item === null)) {
        if (processing != -1) {
            item.process.remainingTime++;
            if (item.process.remainingTime == item.process.serviceTime) {
                processing = -1;
            }
        }
        else {
            item.process.remainingTime++;
            if (item.process.remainingTime == 1) {
                processing = 0;
                simulationLs.unshift(item);
            }
        }
    }
    console.log(simulationLs);
}
function prevClockHRN() {
    console.log('do prevClockHRN()');
    var item = operationLogs.pop();
    if (!(item === null)) {
        if (processing != -1) {
            item.process.remainingTime++;
            if (item.process.remainingTime == item.process.serviceTime) {
                processing = -1;
            }
        }
        else {
            item.process.remainingTime++;
            if (item.process.remainingTime == 1) {
                processing = 0;
                simulationLs.unshift(item);
            }
        }
    }
    console.log(simulationLs);
}
function runTo() {
    console.log("do runTo()");
    if (!simulating) {
        return;
    }
    pausePlay();
    var clock = $('#SimulationClock').val();
    if (!(positiveInt.test(clock) || clock == '0')) {
        return;
    }
    clock = parseInt(clock);
    while (SimulationClock < clock) {
        nextClock();
    }
    while (SimulationClock > clock) {
        prevClock();
    }
    updateSimulation();
}

// --------------------------------
// 自动播放
// --------------------------------
var intervals = [];
function autoPlay() {
    console.log('do autoPlay()');
    if (!simulating) {
        return;
    }
    intervals.push(setInterval(nextStep, 1000));
}
function pausePlay() {
    console.log('do pausePlay()');
    while (intervals.length > 0) {
        clearInterval(intervals.shift());
    }
}
function resetSimulation() {
    console.log('do resetSimulation()');
    pausePlay();
    initSimulation();
}