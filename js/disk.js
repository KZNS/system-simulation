/**
 * @file 磁盘移臂调度 页面控制、模拟动画
 * @author KZNS
 */

// --------------------------------
// 输入数据
// --------------------------------
// SSTF 访问序列
var SSTFdata = [];
// SCAN 访问序列
var SCANdata = [];
// 原始数据
var data = [];
// 时钟
var timeClock;

// 非负数格式
var nonNegativeInt = /^0|([1-9]\d*)$/;

/**
 * 生成随机数据
 */
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

/**
 * 清空数据
 */
function clearData() {
    console.log('do clearData()');
    $('#data').prop('value', '');
}
/**
 * 提交数据
 */
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
            else {
                data[i][j] = parseInt(data[i][j]);
            }
        }
    }
    rightData();
    calculate();
    showData();
    render();
}
/**
 * 设置数据状态 错误数据
 */
function wrongData() {
    $('#data').addClass('is-invalid');
}
/**
 * 设置数据状态 正确数据
 */
function rightData() {
    $('#data').removeClass('is-invalid');
}

// --------------------------------
// 算法模拟
// --------------------------------

/**
 * 计算数据
 */
function calculate() {
    console.log('do calculate()');

    data.sort(function (a, b) {
        return a[0] > b[0];
    });
    console.log(data);

    calculateSSTF();
    calculateSCAN();
}
/**
 * 实用SSTF算法计算
 */
function calculateSSTF() {
    console.log('do calculateSSTF()');

    timeClock = 0;
    SSTFdata = [[0, 0]];
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
            pos = workingList[index];
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
/**
 * 实用SCAN算法计算
 */
function calculateSCAN() {
    console.log('do calculateSCAN()');

    timeClock = 0;
    SCANdata = [[0, 0]];
    var workingList = [[], []];
    var pos = 0;
    var direction = 0;
    var tmp, od = 1;
    var i = 0;
    while (true) {
        while (i < data.length && timeClock >= data[i][0]) {
            if (data[i][1] < pos) {
                workingList[1].push(data[i][1]);
            }
            else if (data[i][1] > pos) {
                workingList[0].push(data[i][1]);
            }
            else {
                workingList[direction].push(data[i][1]);
            }
            i++
        }
        if (workingList[direction].length == 0) {
            if (workingList[od].length == 0) {
                if (i < data.length) {
                    timeClock = data[i][0];
                }
                else {
                    break;
                }
            }
            else {
                tmp = direction;
                direction = od;
                od = tmp;
                workingList[direction].sort(function (a, b) { if (direction == 0) return a > b; else return a < b });
                pos = workingList[direction][0];
                SCANdata.push([timeClock, workingList[direction].shift()]);
                timeClock++;
            }
        }
        else {
            workingList[direction].sort(function (a, b) { if (direction == 0) return a > b; else return a < b });
            pos = workingList[direction][0];
            SCANdata.push([timeClock, workingList[direction].shift()]);
            timeClock++;
        }
    }
}
/**
 * 显示算法计算结果
 */
function showData() {
    var sstf = $('#SSTF');
    var scan = $('#SCAN');

    var text = '';
    var sm = 0;
    text = SSTFdata[1][1];
    sm = Math.abs(SSTFdata[1][1] - SSTFdata[0][1]);
    for (var i = 2; i < SSTFdata.length; i++) {
        text += ',' + SSTFdata[i][1];
        sm += Math.abs(SSTFdata[i][1] - SSTFdata[i - 1][1]);
    }
    sstf.find('.response').text(text);
    sstf.find('.total').text(sm);

    text = SCANdata[1][1];
    sm = Math.abs(SCANdata[1][1] - SCANdata[0][1]);
    for (var i = 2; i < SCANdata.length; i++) {
        text += ',' + SCANdata[i][1];
        sm += Math.abs(SCANdata[i][1] - SCANdata[i - 1][1]);
    }
    scan.find('.response').text(text);
    scan.find('.total').text(sm);
}

// --------------------------------
// 可视化显示
// --------------------------------

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

/**
 * 渲染折线图
 */
function render() {
    svg.selectAll('g').remove();

    console.log(SSTFdata);
    console.log(SCANdata);

    var min = 0;
    var max = d3.max(data, function (d) { return d[1] });
    var timeMax = timeClock;
    console.log(max);
    console.log(timeMax);

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
        .x(function (d) { return xScale(d[1]) })
        .y(function (d) { return yScale(d[0]) });

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

    // SSTF 放入数据 
    // 放入折线
    svg.append('g')
        .append('path')
        .attr('class', 'line-path')
        .attr('transform', 'translate(' + (padding.left) + ',' + (padding.top) + ')')
        .attr('d', linePath(SSTFdata))
        .attr('fill', 'none')
        .attr('stroke-width', 3)
        .attr('stroke', 'green');
    // 放入数据点
    svg.append('g')
        .selectAll('circle')
        .data(SSTFdata)
        .enter()
        .append('circle')
        .attr('r', 5)
        .attr('transform', function (d) {
            return 'translate(' + (xScale(d[1]) + padding.left) + ',' + (yScale(d[0]) + padding.top) + ')'
        })
        .attr('fill', 'green');

    // SCAN 放入数据 
    // 放入折线
    svg.append('g')
        .append('path')
        .attr('class', 'line-path')
        .attr('transform', 'translate(' + (padding.left) + ',' + (padding.top) + ')')
        .attr('d', linePath(SCANdata))
        .attr('fill', 'none')
        .attr('stroke-width', 3)
        .attr('stroke', 'blue');
    // 放入数据点
    svg.append('g')
        .selectAll('circle')
        .data(SCANdata)
        .enter()
        .append('circle')
        .attr('r', 5)
        .attr('transform', function (d) {
            return 'translate(' + (xScale(d[1]) + padding.left) + ',' + (yScale(d[0]) + padding.top) + ')'
        })
        .attr('fill', 'blue');
}