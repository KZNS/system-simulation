/**
 * @file 磁盘移臂调度 页面控制、模拟动画
 * @author KZNS
 */

var SSTFdata = [];
var SCANdata = [];
var data = [];
var timeClock;

var nonNegativeInt = /^0|([1-9]\d*)$/;

function randomData() {
    console.log('do randomData()');

    var dataLen = 30 + Math.ceil(Math.random() * 70);

    var text = '';
    text = Math.ceil(Math.random() * 100) + ',' + Math.ceil(Math.random() * 200);
    for (var i = 1; i < dataLen; i++) {
        text += '\n' + Math.ceil(Math.random() * 100) + ',' + Math.ceil(Math.random() * 200);
    }

    $('#data').prop('value', text);
}

function clearData() {
    console.log('do clearData()');
    $('#data').prop('value', '');
}

function commitData() {
    console.log('do commitData()');

    var text = $('#data').prop('value');
    data = CSVToArray(text);
    for (var i = 0; i < data.length; i++) {
        if (data[i].length != 2) {
            wrongData();
            return;
        }
        for (var j = 0; j < 2; j++) {
            if (!nonNegativeInt.test(data[i][j])) {
                wrongData();
                return;
            }
        }
    }
    rightData();
    calculate();
    render();
}
function wrongData() {
    $('#data').addClass('is-invalid');
}
function rightData() {
    $('#data').removeClass('is-invalid');
}

function calculate() {
    console.log('do calculate()');

    data.sort(function (a, b) {
        return a[0] > b[0];
    });
    console.log(data);

    calculateSSTF();
    calculateSCAN();
}
function calculateSSTF() {
    console.log('do calculateSSTF()');

    timeClock = 0;
    SSTFdata = [];
    var workingList = [];
    var pos = 0;
    var i = 0;
    while (true) {
        while (i < data.length && timeClock >= data[i][0]) {
            workingList.push(data[i][1]);
            i++
        }
        if (workingList.length != 0) {
            var index = 0;
            for (var j = 1; j < workingList.length; j++) {
                if (Math.abs(workingList[j] - pos) < Math.abs(workingList[index] - pos)) {
                    index = j;
                }
            }
            SSTFdata.push([timeClock, workingList[index]]);
            workingList.splice(index, 1);
            timeClock++;
        }
        else {
            if (i < data.length) {
                timeClock = data[i][0];
            }
            else {
                break;
            }
        }
    }
}
function calculateSCAN() {
    console.log('do calculateSCAN()');
}


// 图表的宽度和高度
var width = 1000;
var height = 600;
// 预留给轴线的距离
var padding = { top: 50, right: 50, bottom: 50, left: 50 };

// 选取id=svg的元素，在其中添加一个svg
var svg = d3.select('#svg')
    .append('svg')
    .attr('width', width + 'px')
    .attr('height', height + 'px');

function render() {
    svg.selectAll('g').remove();

    var min = d3.min(data);
    var max = d3.max(data);
    var timeMax = data.length;

    // scaleLinear 设置一个线性比例尺
    // domain 数据范围
    // range 页面范围
    var xScale = d3.scaleLinear()
        .domain([min, max])
        .range([0, width - padding.left - padding.right]);
    var yScale = d3.scaleLinear()
        .domain([0, timeMax])
        .range([0, height - padding.top - padding.bottom]);

    // d3.line() 新建一个线生成器
    // line.x([x]) 设置或获取x-坐标访问器
    // line.y([y]) 设置或获取y-坐标访问器
    var linePath = d3.line()
        .x(function (d) { return xScale(d[0]) })
        .y(function (d) { return yScale(d[1]) });

    // d3.axisBottom(scale) 创建一个新的轴生成器
    // d3.axisBottom(scale).scale([scale]) 设置或者取得比例尺
    var xAxis = d3.axisTop()
        .scale(xScale);
    var yAxis = d3.axisLeft()
        .scale(yScale);

    // 放入轴线
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + (padding.left) + ',' + padding.bottom + ')')
        .call(xAxis);
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + padding.left + ',' + (padding.top) + ')')
        .call(yAxis);

    // 放入数据
    svg.append('g')
        .append('path')
        .attr('class', 'line-path')
        .attr('transform', 'translate(' + (padding.left) + ',' + (padding.top) + ')')
        .attr('d', linePath(SSTFdata))
        .attr('fill', 'none')
        .attr('stroke-width', 3)
        .attr('stroke', 'green');

    svg.append('g')
        .selectAll('circle')
        .data(SSTFdata)
        .enter()
        .append('circle')
        .attr('r', 5)
        .attr('transform', function (d) {
            return 'translate(' + (xScale(d[0]) + padding.left) + ',' + (yScale(d[1]) + padding.top) + ')'
        })
        .attr('fill', 'green');

    svg.append('g')
        .append('path')
        .attr('class', 'line-path')
        .attr('transform', 'translate(' + (padding.left) + ',' + (padding.top) + ')')
        .attr('d', linePath(SCANdata))
        .attr('fill', 'none')
        .attr('stroke-width', 3)
        .attr('stroke', 'blue');

    svg.append('g')
        .selectAll('circle')
        .data(SCANdata)
        .enter()
        .append('circle')
        .attr('r', 5)
        .attr('transform', function (d) {
            return 'translate(' + (xScale(d[0]) + padding.left) + ',' + (yScale(d[1]) + padding.top) + ')'
        })
        .attr('fill', 'blue');
}