// shim layer with setTimeout fallback
// from http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var positionText;
var ratio = 70;

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
	  x: evt.clientX - rect.left,
	  y: evt.clientY - rect.top
	};
}
function printMousePos(mousePos) {
	var position = mousePos.x + ',' + mousePos.y;
	$('#positionDiv').css('top', mousePos.y - 20);
	$('#positionDiv').css('left', mousePos.x + 20);
	$('#positionDiv').text(Math.round(mousePos.x/ratio * 100) / 100 + ',' + Math.round(mousePos.y/ratio * 100)/100);
}
// Start when the mouse enters the canvas
canvas.addEventListener('mouseover', function(e){
	$('#canvasParent').append("<div id='positionDiv'></div>");
});

canvas.addEventListener('mousemove', function(evt) {
	var mousePos = getMousePos(canvas, evt);
	printMousePos(mousePos);
}, false);

// when the mouse exits the canvas
canvas.addEventListener('mouseout', function(e){
	$('#positionDiv').remove();
});

function DrawMesh()
{
	context.lineWidth = 0.5;
	context.strokeStyle = "#ccc";
	var i;
	for (i=0; i < 500; i += ratio) {
		context.beginPath();
		context.moveTo(0,i);
		context.lineTo(1000,i);
		context.stroke();
	}
	for (i=0; i < 1000; i += ratio) {
		context.beginPath();
		context.moveTo(i,0);
		context.lineTo(i,500);
		context.stroke();
	}
	context.lineWidth = 1;
}

function DrawSegments(segmentArray) {
	for (i = 0; i < segmentArray.length; i++)
	{
		var _segment = segmentArray[i];
		context.strokeStyle = "#000000";
		context.beginPath();
		context.moveTo(_segment.upperPoint.x * ratio,_segment.upperPoint.y * ratio);
		context.lineTo(_segment.lowerPoint.x * ratio,_segment.lowerPoint.y * ratio);
		context.stroke();
		DrawPoint(_segment.upperPoint, "#000000");
		DrawPoint(_segment.lowerPoint, "#000000");
	}
}

function DrawPoints(eventPointArray, color) {
	for (i = 0; i < eventPointArray.length; i++)
	{
		var _eventPoint = eventPointArray[i];
		DrawPoint(_eventPoint, color);
	}
}

function DrawPoint(_eventPoint, color) {
	//context.fillRect(_eventPoint.x * ratio,_eventPoint.y * ratio,5,5, 255, 0, 0);
	context.fillStyle = color;
    context.beginPath();
    context.arc(_eventPoint.x * ratio,_eventPoint.y * ratio, 3, 0, 2 * Math.PI);
    context.fill();
	context.fillText(Math.round(_eventPoint.x * 100)/100 + ', ' + Math.round(_eventPoint.y * 100)/100, _eventPoint.x * ratio + 10,_eventPoint.y * ratio);
}