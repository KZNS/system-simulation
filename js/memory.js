/**
 * @file 存储管理页面控制、模拟动画
 * @author KZNS
 */

// --------------------------------
// 页面初始化
// --------------------------------

// 页面格式模板
var eventInfoFormat;

/**
 * 获取html页面中的dom元素，
 * 根据dom设置页面格式模板，进程信息默认值
 */
function getPageElements() {
    console.log('do getPageElements()');

    eventInfoFormat = $('.eventInfo:first').clone();
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
        eventType: '',
        memorySize: 0,
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