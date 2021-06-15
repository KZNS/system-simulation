

function randomFile() {
	initBitMap();
	var name;
	var size;
	for (var i = 1; i <= 50; i++) {
		name = i + '.txt';
		size = Math.round(2 + Math.random() * 8);
		addFile(name, size);
	}
	render();
}
function deleteOddFile() {
	var name;
	for (var i = 1; i <= 50; i += 2) {
		name = i + '.txt';
		removeFile(name);
	}
	render();
}
function addABCFile() {
	var names = ['A', 'B', 'C', 'D', 'E'];
	var sizes = [7, 5, 2, 8, 3.5];
	var name;
	var size;
	for (var i = 0; i < names.length; i++) {
		name = names[i] + '.txt';
		size = sizes[i];
		addFile(name, size);
	}
	var ABCList = [];
	for (var i = fileList.length - 5; i < fileList.length; i++) {
		ABCList.push(fileList[i]);
	}
	for (var i = 0; i < ABCList.length; i++) {
		var text = '';
		var poss = ABCList[i].poss;
		text = poss[0];
		for (var j = 1; j < poss.length; j++) {
			text = text + ',' + poss[j];
		}
		console.log(text);
		$('#' + names[i] + 'txt .poss').text(text);
	}

	render();
}

var bitmap = [];
var fileList = [];
function initBitMap() {
	bitmap = [];
	for (var i = 0; i < 500; i++) {
		bitmap.push(0);
	}
}
function addFile(name, size) {
	var poss = [];
	for (var i = 0; i < 500; i++) {
		if (bitmap[i] == 0) {
			bitmap[i] = 1;
			poss.push(i);
			if (poss.length * 2 >= size) {
				break;
			}
		}
	}
	fileList.push({ name: name, poss: poss });
}
function removeFile(name) {
	var poss = [];
	for (var i = 0; i < fileList.length; i++) {
		if (fileList[i].name == name) {
			poss = fileList[i].poss;
			fileList.splice(i, 1);
			break;
		}
	}
	for (var i = 0; i < poss.length; i++) {
		bitmap[poss[i]] = 0;
	}
}


var padding = { top: 10, right: 10, bottom: 10, left: 10 };
var one = 20;
var onep = 16;

function initRender() {
	var canvas = document.getElementById('bitmap');
	var ctx = canvas.getContext('2d');

	var x, y;
	for (var i = 0; i <= 20; i++) {
		x = padding.left;
		y = i * one + padding.top;
		ctx.beginPath();        // 开始路径绘制
		ctx.moveTo(x, y);    // 设置路径起点
		ctx.lineTo(x + one * 25, y);    // 绘制一条
		ctx.lineWidth = 0.5;    // 设置线宽
		ctx.strokeStyle = "gray"; // 设置线条颜色
		ctx.stroke();          // 进行线的着色，这时整条线才变得可见
	}
	for (var j = 0; j <= 25; j++) {
		x = j * one + padding.left;
		y = padding.top;
		ctx.beginPath();        // 开始路径绘制
		ctx.moveTo(x, y);    // 设置路径起点
		ctx.lineTo(x, y + one * 20);    // 绘制一条
		ctx.lineWidth = 0.5;    // 设置线宽
		ctx.strokeStyle = "gray"; // 设置线条颜色为红色
		ctx.stroke();          // 进行线的着色，这时整条线才变得可见
	}

}
function render() {
	initRender();
	var canvas = document.getElementById('bitmap');
	var ctx = canvas.getContext('2d');

	var x, y;
	for (var i = 0; i < 20; i++) {
		for (var j = 0; j < 25; j++) {
			x = j * one + padding.left;
			y = i * one + padding.top;

			x += Math.round((one - onep) / 2);
			y += Math.round((one - onep) / 2);
			ctx.beginPath(); // 开始路径绘制
			ctx.moveTo(x, y); // 设置路径起点
			ctx.lineTo(x + onep, y); // 绘制一条
			ctx.lineTo(x + onep, y + onep); // 绘制一条
			ctx.lineTo(x, y + onep); // 绘制一条
			ctx.closePath();
			if (bitmap[i * 25 + j] == 1) {
				ctx.fillStyle = "green";
			}
			else {
				ctx.fillStyle = "white";
			}
			ctx.fill();
		}
	}
}

initRender();