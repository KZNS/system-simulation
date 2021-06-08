/**
 * @file 存储管理页面控制、模拟动画
 * @author KZNS
 */

// --------------------------------
// 页面初始化
// --------------------------------

// 页面格式模板
var eventInfoFormat;
var memoryInfoFormat;
var usedInfoFormat;
var unusedInfoFormat;

// 事件信息默认值
var eventInfoDefault;

// 事件列表DOM
var eventInfosTbody;

/**
 * 获取html页面中的dom元素，
 * 根据dom设置页面格式模板，进程信息默认值
 */
function getPageElements() {
    console.log('do getPageElements()');

    eventInfoFormat = $('.eventInfo:first').clone();
    eventInfoDefault = $('.eventInfo:first .delID option').text();

    eventInfosTbody = $('#eventInfos tbody');

    memoryTotalSize = parseInt($('#memoryTotalSize').prop('value'));
    memoryInfoFormat = $('#memory tbody tr:first').clone();
    usedInfoFormat = $('#used tbody tr:first').clone();
    unusedInfoFormat = $('#unused tbody tr:first').clone();
}
/**
 * 初始化页面
 */
function initPage() {
    console.log('do initPage()');

    getPageElements();
    events = [];
    events.push(newEvent());
    events[0].setID(1);
}

// --------------------------------
// 进程信息输入表格
// --------------------------------

// 事件信息列表
var events = [];

/**
 * 生产一个新的event元素并返回
 */
function newEvent() {
    console.log('do newEvent()');
    var e = {
        id: 0,
        eventID: '',
        eventType: 'allocate',
        memorySize: '',
        delID: 0,
        setID: function (i) {
            this.id = i;
            this.eventID = 'event' + this.id;
        }
    }
    return e;
}
function insertEvent(id) {
    if (id == null) {
        var evn = newEvent();
        events.push(evn);
        evn.setID(events.length);
        eventInfoFit(eventInfoFormat, evn);
        $('#eventInfos tbody').append(eventInfoFormat.prop('outerHTML'));
    }
    else if (id <= events.length) {
        var evn = newEvent();
        evn.setID(id);
        var eventInfosTbody = $('#eventInfos tbody');
        for (var i = events.length - 1; i >= id - 1; i--) {
            var eventInfoTr = eventInfosTbody.find('#' + events[i].eventID);
            events[i].setID(i + 2);
            if (events[i].eventType == 'recycle' && events[i].delID >= id) {
                events[i].delID++;
            }
            eventInfoFit(eventInfoTr, events[i]);
        }
        events.splice(id - 1, 0, evn);
        eventInfoFit(eventInfoFormat, evn);
        $('#eventInfos #event' + (id + 1)).before(eventInfoFormat.prop('outerHTML'));
        fitData();
    }
}
function deleteEvent(id) {
    if (id == null) {
        events.pop();
        $('#eventInfos tbody tr:last').remove();
    }
    else if (id <= events.length) {
        $('#eventInfos #' + events[id - 1].eventID).remove();
        events.splice(id - 1, 1);
        var eventInfosTbody = $('#eventInfos tbody');
        for (var i = 0; i < events.length; i++) {
            var evn = events[i];
            if (evn.id !== i + 1) {
                var eventInfoTr = eventInfosTbody.find('#' + evn.eventID);
                evn.setID(i + 1);
                if (evn.eventType == 'recycle') {
                    if (evn.delID == id) {
                        evn.delID = 0;
                    }
                    else if (evn.delID > id) {
                        evn.delID--;
                    }
                }
                eventInfoFit(eventInfoTr, evn);
            }
        }
        fitData();
    }
    if (events.length == 0) {
        newEventInfo();
    }
}
/**
 * 添加一行表格在最后
 */
function newEventInfo() {
    console.log("do newEventInfo()");
    insertEvent();
}
/**
 * 添加一行表格在当前行前
 */
function newEventInfoBeforeThis(data) {
    console.log("do newEventInfoBeforeThis()");

    var eventID = $(data).parents("tr").attr("id");
    var id = parseInt(eventID.replace(/[^0-9]/ig, ""));

    insertEvent(id);
}
/**
 * 删除表格当前行
 * @param {DOM} data 当前DOM元素
 */
function delEventInfoThis(data) {
    console.log("do delEventInfoThis()");

    var eventID = $(data).parents("tr").attr("id");
    var id = parseInt(eventID.replace(/[^0-9]/ig, ""));

    deleteEvent(id);
}
/**
 * 删除表格最后一行
 */
function delEventInfoLast() {
    console.log("do delEventInfoLast()");

    deleteEvent();
}
/**
 * 删除全部表格
 */
function delEventInfoAll() {
    console.log("do delEventInfoAll()");

    events = [];
    $('#eventInfos tbody').empty();
    newEventInfo();
}

// --------------------------------
// 事件信息表格显示
// --------------------------------
/**
 * 将进程信息填入DOM
 */
function eventInfoFit(eventInfoTr, evn) {
    console.log('do eventInfoFit()');
    eventInfoTr.find('th').text(evn.id);
    eventInfoTr.attr('id', evn.eventID);
}
/**
 * 刷新表格
 */
function updateTable() {
    console.log('do updateTable()');

    for (var i = 0; i < events.length; i++) {
        var evn = events[i];
        var eventInfoTr = eventInfosTbody.find('#' + evn.eventID);
        fitEventType(evn);
    }
    fitData();
}
function fitEventType(evn) {
    console.log('do fitEventType()');

    var eventInfoTr = eventInfosTbody.find('#' + evn.eventID);
    eventInfoTr.find('.eventType').val(evn.eventType);
    if (evn.eventType == 'allocate') {
        eventInfoTr.find('.memorySize').prop('disabled', false);
        eventInfoTr.find('.delID').prop('disabled', true);
    }
    else if (evn.eventType == 'recycle') {
        eventInfoTr.find('.memorySize').prop('disabled', true);
        eventInfoTr.find('.delID').prop('disabled', false);
    }
    else {
        console.log('wrong eventType');
    }
}
function fitData() {
    console.log('do fitData()');
    var idList = [];
    for (var i = 0; i < events.length; i++) {
        var evn = events[i];
        if (evn.eventType == 'allocate') {
            idList.push(evn.id);
            $('#' + evn.eventID + ' .memorySize').prop('value', evn.memorySize);
        }
        else if (evn.eventType == 'recycle') {
            setDelIDOption(evn, idList);
        }
    }
}
function setDelIDOption(evn, idList) {
    var delIDSelect = $('#' + evn.eventID + ' .delID');
    delIDSelect.empty();
    delIDSelect.append(
        '<option value="' + 0 + '">' + eventInfoDefault + '</option>'
    )
    var flag = false;
    for (var i = 0; i < idList.length; i++) {
        delIDSelect.append(
            '<option value="' + idList[i] + '">' + idList[i] + '</option>'
        );
        if (idList[i] === evn.delID) {
            idList.splice(i, 1);
            i--;
            flag = true;
        }
    }
    if (flag) {
        delIDSelect.val(evn.delID);
    }
    else {
        delIDSelect.val(0);
        evn.delID = 0;
    }
}

// --------------------------------
// 输入信息处理
// --------------------------------

// 正整数格式
var positiveInt = /^([1-9]\d*)$/;
/**
 * 检查当前输入是否合法
 * @param {DOM} data 当前DOM元素
 */
function checkMemorySize(data) {
    var value = $(data).val();
    if (value == '' || positiveInt.test(value)) {
        console.log('ok ' + value);
        $(data).removeClass('is-invalid');
    }
    else {
        console.log('wrong ' + value);
        hasWrongProcessInfo = true;
        if (!$(data).hasClass('is-invalid')) {
            $(data).addClass('is-invalid');
        }
    }
}
/**
 * 绑定页面元素和进程信息列表
 * @param {DOM} data 当前DOM元素
 */
function bindingEvent(data) {
    console.log('do bindingEvent()');
    var value = $(data).val();
    var eventID = $(data).parents("tr").attr("id");
    var id = parseInt(eventID.replace(/[^0-9]/ig, ""));
    var evn = events[id - 1];

    if ($(data).hasClass('eventType')) {
        evn.eventType = value;
        evn.memorySize = '';
        evn.delID = 0;
        fitEventType(evn);
        fitData();
    }
    else if ($(data).hasClass('memorySize')) {
        evn.memorySize = parseInt(value);
    }
    else if ($(data).hasClass('delID')) {
        evn.delID = parseInt(value);
        fitData();
    }
    else {
        console.log('wrong in bindingEvent()');
        return;
    }

    console.log(evn);
}

// --------------------------------
// 批量读入和保存进程信息
// --------------------------------
/**
 * 处理批量输入的进程信息数据
 * @param {DOM} data 当前DOM元素
 */
function inputEventInfos(data) {
    console.log("do inputEventInfos()");
    var infos = $("#inputEventInfos").val();
    var tmpEvents = [];
    console.log(infos);
    datas = CSVToArray(infos);
    for (var i = 0; i < datas.length; i++) {
        if (datas[i].length != 3) {
            console.log('wrong ' + datas[i].length);
            $(data).siblings(".alert").addClass("show");
            return;
        }
        var evn = newEvent();
        evn.setID(i + 1);
        evn.eventType = datas[i][0];
        if (evn.eventType == 'allocate') {
            evn.memorySize = parseInt(datas[i][1]);
            evn.delID = 0;
        }
        else if (evn.eventType == 'recycle') {
            evn.memorySize = '';
            evn.delID = parseInt(datas[i][2]);
        }
        else {
            console.log(datas[i][0]);
            $(data).siblings(".alert").addClass("show");
            return;
        }
        tmpEvents.push(evn);
    }
    events = tmpEvents;
    eventInfosTbody.empty();
    for (var i = 0; i < events.length; i++) {
        eventInfoFit(eventInfoFormat, events[i]);
        eventInfosTbody.append(eventInfoFormat.prop('outerHTML'));
    }
    if (events.length == 0) {
        newEventInfo();
    }
    updateTable();

    // 关闭模态框
    $("#inputEventInfos-Modal").modal("hide");
}
/**
 * 保存当前事件信息到剪贴板
 */
function saveEventInfos() {
    console.log("do saveEventInfos()");
    var infos = events[0].eventType + ',' + events[0].memorySize + ',' + events[0].delID;
    for (var i = 1; i < events.length; i++) {
        infos = infos + '\n' + events[i].eventType + ',' + events[i].memorySize + ',' + events[i].delID;
    }
    console.log(infos);

    navigator.clipboard.writeText(infos)
}

// --------------------------------
// 逐步模拟
// --------------------------------
var memoryTotalSize;
var eventClock = 0;
var memoryRemainingMaxSize;
var usedList = [];
var unusedList = [];

function checkData(evn) {
    if (evn.eventType == 'allocate') {
        var value = $('#' + evn.eventID + ' .memorySize').prop('value');
        if (value == '' || !positiveInt.test(value) || evn.memorySize > memoryRemainingMaxSize) {
            $('#' + evn.eventID + ' .memorySize').addClass('is-invalid');
            return false;
        }
    }
    return true;
}
function lockEvent(evn) {
    var eventInfosTr = $('#' + evn.eventID);
    eventInfosTr.find('.eventType').prop('disabled', true);
    eventInfosTr.find('.memorySize').prop('disabled', true)
    eventInfosTr.find('.delID').prop('disabled', true)
}
function ExecuteEvent(evn) {
    var memorySize = evn.memorySize;
    for (var i = 0; i < unusedList.length; i++) {
        if (memorySize <= unusedList[i].size) {
            useMemory(evn.id, evn.memorySize, i);
            break;
        }
    }
}
function useMemory(id, size, index) {
    var startAddress = unusedList[index].startAddress;
    if (size < unusedList[index].size) {
        unusedList[index].startAddress += size;
        unusedList[index].size -= size;
    }
    else {
        unusedList.splice(index, 1);
    }
    var i;
    for (i = 0; i < usedList.length; i++) {
        if (usedList[i].startAddress > startAddress) {
            break;
        }
    }
    usedList.splice(i, 0,
        { startAddress: startAddress, size: size, id: id }
    );
}
function nextStep() {
    console.log('do nextStep()');
    if (eventClock == 0) {
        var value = $('#memoryTotalSize').prop('value');
        if (value == '' || !positiveInt.test(value)) {
            $('#memoryTotalSize').addClass('is-invalid');
            return;
        }
        memoryTotalSize = parseInt(value);
        memoryRemainingMaxSize = memoryTotalSize;
        usedList = [];
        unusedList = [{ startAddress: 0, size: memoryTotalSize, id: '' }];
    }
    if (eventClock >= events.length) {
        return;
    }
    var evn = events[eventClock];
    if (!checkData(evn)) {
        return;
    }

    if (eventClock == 0) {
        $('#memoryTotalSize').prop('disabled', 'true');
    }
    lockEvent(evn);
    ExecuteEvent(evn);

    updateSimulation();
    eventClock++;
}
function updateSimulation() {
    console.log('do updateSimulation()');
    console.log(usedList);
    console.log(unusedList);
    var memoryTbody = $('#memory tbody');
    var usedTbody = $('#used tbody');
    var unusedTbody = $('#unused tbody');
    memoryTbody.empty();
    usedTbody.empty();
    unusedTbody.empty();
    var i = 0, j = 0;
    var item;
    while (i < usedList.length || j < unusedList.length) {
        if (j >= unusedList.length
            || (i < usedList.length && usedList[i].startAddress < unusedList[i].startAddress)) {
            item = usedList[i];
            i++
            usedInfoFormat.find('.startAddress').text(item.startAddress);
            usedInfoFormat.find('.size').text(item.size);
            usedInfoFormat.find('.id').text(item.id);
            usedTbody.append(usedInfoFormat.prop('outerHTML'));
        }
        else {
            item = unusedList[j];
            j++
            unusedInfoFormat.find('.startAddress').text(item.startAddress);
            unusedInfoFormat.find('.size').text(item.size);
            unusedTbody.append(unusedInfoFormat.prop('outerHTML'));
        }
        memoryInfoFormat.find('.startAddress').text(item.startAddress);
        memoryInfoFormat.find('.id').text(item.id);
        memoryInfoFormat.find('.size').text(item.size);
        memoryTbody.append(memoryInfoFormat.prop('outerHTML'));
    }
}