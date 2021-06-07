/**
 * @file 存储管理页面控制、模拟动画
 * @author KZNS
 */

// --------------------------------
// 页面初始化
// --------------------------------

// 页面格式模板
var eventInfoFormat;

// 事件信息默认值
var eventInfoDefault;

/**
 * 获取html页面中的dom元素，
 * 根据dom设置页面格式模板，进程信息默认值
 */
function getPageElements() {
    console.log('do getPageElements()');

    eventInfoFormat = $('.eventInfo:first').clone();
    eventInfoDefault = $('.eventInfo:first .delID option').text();
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
/**
 * 添加一行表格在最后
 */
function newEventInfo() {
    console.log("do newEventInfo()");

    events.push(newEvent());
    var evn = events[events.length - 1];
    evn.setID(events.length);
    eventInfoFormat.find('th').text(evn.id);
    eventInfoFormat.attr('id', evn.eventID);
    $('#eventInfos tbody').append(eventInfoFormat.prop('outerHTML'));
}
/**
 * 删除表格当前行
 * @param {DOM} data 当前DOM元素
 */
function delEventInfoThis(data) {
    console.log("do delEventInfoThis()");

    var eventID = $(data).parents("tr").attr("id");
    console.log("del " + eventID);
    $('#eventInfos #' + eventID).remove();
    var id = parseInt(eventID.replace(/[^0-9]/ig, ""));
    events.splice(id - 1, 1);

    updateTable();
}
function newEventInfoAfterThis(data) {
    console.log("do newEventInfoAfterThis()");

    var eventID = $(data).parents("tr").attr("id");
    console.log("new after " + eventID);

    var tmp = eventID;
    var id = parseInt(tmp.replace(/[^0-9]/ig, ""));
    events.splice(id, 0, newEvent());
    var evn = events[id];
    evn.setID(id + 1);
    eventInfoFormat.find('th').text(evn.id);
    eventInfoFormat.attr('id', evn.eventID);
    console.log(eventID);
    $('#eventInfos #' + eventID).after(eventInfoFormat.prop('outerHTML'));

    updateTable();
}
/**
 * 删除表格最后一行
 */
function delEventInfoLast() {
    console.log("do delEventInfoLast()");

    events.pop();
    $('#eventInfos tbody tr:last').remove();
    if (events.length == 0) {
        newEventInfo();
    }
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
 * 刷新表格
 */
function updateTable() {
    console.log('do updateTable()');

    var eventInfosTbody = $("#eventInfos").find("tbody");

    for (var i = 0; i < events.length; i++) {
        var evn = events[i];
        var eventInfoTr = eventInfosTbody.find('#' + evn.eventID);
        if (evn.id !== i + 1) {
            evn.setID(i + 1);
            eventInfoTr.attr('id', evn.eventID);
            eventInfoTr.find('th').text(evn.id);
        }
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
        changeEventType(evn);
    }
    else if ($(data).hasClass('memorySize')) {
        evn.memorySize = parseInt(value);
    }
    else if ($(data).hasClass('delID')) {
        evn.delID = parseInt(value);
        changeDelID();
    }
    else {
        console.log('wrong in bindingEvent()');
        return;
    }

    console.log(evn);
}

function changeEventType(evn) {
    console.log('do changeEventType()');
    var eventInfoTr = $('#eventInfos tbody #' + evn.eventID);
    evn.memorySize = '';
    evn.delID = 0;
    if (evn.eventType == 'allocate') {
        eventInfoTr.find('.memorySize').prop('disabled', false);
        eventInfoTr.find('.delID').prop('disabled', true);

    }
    else if (evn.eventType == 'recycle') {
        eventInfoTr.find('.memorySize').prop('disabled', true);
        eventInfoTr.find('.delID').prop('disabled', false);
    }
    else {
        console.log('changeEventType(): wrong eventType');
    }
    eventInfoTr.find('.memorySize').removeClass('is-invalid');
    eventInfoTr.find('.memorySize').val('');
    eventInfoTr.find('.delID').val(0);
    changeDelID();
}
function changeDelID() {
    console.log('do changeDelID()');
    var idList = [];
    for (var i = 0; i < events.length; i++) {
        var evn = events[i];
        if (evn.eventType == 'allocate') {
            idList.push(evn.id);
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