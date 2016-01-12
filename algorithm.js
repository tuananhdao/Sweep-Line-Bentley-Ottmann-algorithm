function Segment(_point1, _point2){
	if (_point1.y < _point2.y || (_point1.y == _point2.y && _point1.x < _point2.x))
	{
		this.upperPoint = _point1;
		this.lowerPoint = _point2;
	}
	else
	{
		this.upperPoint = _point2;
		this.lowerPoint = _point1;
	}
}
Segment.prototype.IsOnTheLeftOf = function(_segment, _l) {
	l = _l + 0.00000000000001;
	var thisLIntersectionX = (l-this.upperPoint.y)*(this.lowerPoint.x - this.upperPoint.x)/(this.lowerPoint.y - this.upperPoint.y) + this.upperPoint.x;
	var segmentLIntersectionX = (l-_segment.upperPoint.y)*(_segment.lowerPoint.x - _segment.upperPoint.x)/(_segment.lowerPoint.y - _segment.upperPoint.y) + _segment.upperPoint.x;
	if (thisLIntersectionX < segmentLIntersectionX)
		return true;
	if (thisLIntersectionX > segmentLIntersectionX)
		return false;
	if (thisLIntersectionX == segmentLIntersectionX)
	{
		return (this.upperPoint.x - this.lowerPoint.x)/Math.abs(this.upperPoint.x - this.lowerPoint.x) * ((this.lowerPoint.y - this.upperPoint.y)*(this.lowerPoint.x-this.upperPoint.x) + (this.upperPoint.x - this.lowerPoint.x)*(0 - this.upperPoint.y)) * ((this.lowerPoint.y - this.upperPoint.y)*(_segment.lowerPoint.x-this.upperPoint.x) + (this.upperPoint.x - this.lowerPoint.x)*(_segment.lowerPoint.y - this.upperPoint.y)) <= 0;
	}
}
Segment.prototype.Equals = function(_segment) {
	return (this.upperPoint.Equals(_segment.upperPoint) && this.lowerPoint.Equals(_segment.lowerPoint));
}
function EventPoint(_x, _y) {
	this.x = _x;
	this.y = _y;
	this.correspondingSegments = [];
}

EventPoint.prototype.Equals = function(_eventPoint) {
	return (Math.abs(this.x - _eventPoint.x) < 0.00000000000001) && (Math.abs(this.y - _eventPoint.y) < 0.00000000000001);
}

EventPoint.prototype.After = function(_eventPoint) {
	return this.y > _eventPoint.y || (this.y == _eventPoint.y && this.x > _eventPoint.x);
}

EventPoint.prototype.AddCorrespondingSegment = function(segment) {
	if (!this.correspondingSegments.hasOwnProperty(segment))
		this.correspondingSegments.push(segment);
}

function EventQueue() {
	this.eventQueue = [];
}

EventQueue.prototype.GetNextEventPoint = function() {
	if (this.eventQueue.length == 0)
		return null;
	return this.eventQueue.shift(); // remove and return first element
}

EventQueue.prototype.InsertEventPoint = function(eventPoint) {
	var i = 0;
	for (; i < this.eventQueue.length; i++)
	{
		if(this.eventQueue[i].Equals(eventPoint))
			return this.eventQueue[i];
		if (this.eventQueue[i].After(eventPoint))
			break;
	}
	
	this.eventQueue.splice(i, 0, eventPoint);
	return this.eventQueue[i];
}

function StatusTreeNode(_segment) {
	this.segment = _segment;
	this.leftNode = null;
	this.rightNode = null;
	this.height = 1;
}

StatusTreeNode.prototype.balanceFactor = function() {
	var rightSubtreeHeight = 0;
	if (this.rightNode instanceof StatusTreeNode)
		rightSubtreeHeight = this.rightNode.height;
	
	var leftSubtreeHeight = 0;
	if (this.leftNode instanceof StatusTreeNode)
		leftSubtreeHeight = this.leftNode.height;
	
	return rightSubtreeHeight - leftSubtreeHeight;
}

StatusTreeNode.prototype.fixHeight = function() {
	var rightSubtreeHeight = 0;
	if (this.rightNode instanceof StatusTreeNode)
		rightSubtreeHeight = this.rightNode.height;
	
	var leftSubtreeHeight = 0;
	if (this.leftNode instanceof StatusTreeNode)
		leftSubtreeHeight = this.leftNode.height;
	
	this.height = (leftSubtreeHeight > rightSubtreeHeight ? leftSubtreeHeight : rightSubtreeHeight) + 1;
}

StatusTreeNode.prototype.rotateRight = function() {
	var q = this.leftNode;
	
	this.leftNode = q.rightNode;
	q.rightNode = this;
	this.fixHeight();
	q.fixHeight();
	
	return q;
}

StatusTreeNode.prototype.rotateLeft = function() {
	var p = this.rightNode;
	
	this.rightNode = p.leftNode;
	p.leftNode = this;
	this.fixHeight();
	p.fixHeight();

	return p;
}

StatusTreeNode.prototype.balance = function() {
	this.fixHeight();
	if (this.balanceFactor() == 2)
	{
		if (this.rightNode.balanceFactor() < 0)
			this.rightNode = this.rightNode.rotateRight();
		return this.rotateLeft();
	}
	if (this.balanceFactor() == -2)
	{
		if (this.leftNode.balanceFactor() > 0)
			this.leftNode = this.leftNode.rotateLeft();
		return this.rotateRight();
	}
	return this; // no balance needed
}

function StatusTree() {
	this.rootNode = null;
	this.tempNode = null; // for algorithm
}

StatusTree.prototype.Insert = function(segment, l) {
	console.log("Insert: l = " + l);
	console.log(segment.upperPoint.x, segment.upperPoint.y, segment.lowerPoint.x, segment.lowerPoint.y);
	this.rootNode = this.InsertRecursion(this.rootNode, segment, l);
}

StatusTree.prototype.InsertRecursion = function(node, segment, l) {
	if (node == null)
	{
		return new StatusTreeNode(segment);
	}
	
	if (node.height == 1) // then node.leftNode == null node.rightNode == null too!
	{
		if (segment.IsOnTheLeftOf(node.segment, l))
		{
			node.leftNode = new StatusTreeNode(segment);
			node.rightNode = new StatusTreeNode(node.segment);
			node.segment = segment;
			this.tempNode = node;
		}
		else
		{
			node.leftNode = new StatusTreeNode(node.segment);
			node.rightNode = new StatusTreeNode(segment);
		}
		if (this.tempNode != null)
		{
			this.tempNode.segment = segment;
		}
		this.tempNode = null;
		return node.balance();
	}
	
	if (segment.IsOnTheLeftOf(node.segment, l))
	{
		this.tempNode = node;
		node.leftNode = this.InsertRecursion(node.leftNode, segment, l);
	}
	else
		node.rightNode = this.InsertRecursion(node.rightNode, segment, l);
	
	return node.balance();
}

StatusTree.prototype.Delete = function(segment, l) {
	console.log("Delete: l = " + l);
	console.log(segment.upperPoint.x, segment.upperPoint.y, segment.lowerPoint.x, segment.lowerPoint.y);
	this.rootNode = this.DeleteRecursion(this.rootNode, segment, l);
}

StatusTree.prototype.DeleteRecursion = function(node, segment, l) {
	console.log(node.segment);
	if (segment.Equals(node.segment) && node.height == 1)
	{
		return null;
	}
	if (segment.IsOnTheLeftOf(node.segment, l))
	{
		this.tempNode = node;
		node.leftNode = this.DeleteRecursion(node.leftNode, segment, l);
	}
	else
		node.rightNode = this.DeleteRecursion(node.rightNode, segment, l);
	
	if (node.leftNode == null && node.rightNode != null)
	{
		node = node.rightNode;
		if (this.tempNode != null) this.tempNode.segment = this.FindMaxNode(node).segment;
		this.tempNode = null;
	}
	else if (node.leftNode != null && node.rightNode == null)
	{
		node = node.leftNode;
		if (this.tempNode != null) this.tempNode.segment = this.FindMaxNode(node).segment;
		this.tempNode = null;
	}
	
	return node.balance();
}

StatusTree.prototype.FindMinNode = function (statusTreeNode) {
	if (statusTreeNode.height == 1)
		return statusTreeNode;
	return this.FindMinNode(statusTreeNode.leftNode);
}

StatusTree.prototype.FindMaxNode = function (statusTreeNode) {
	if (statusTreeNode.height == 1)
		return statusTreeNode;
	return this.FindMaxNode(statusTreeNode.rightNode);
}

StatusTree.prototype.GetLeftNode = function (segment, l) {
	if (this.rootNode == null) return null;
	
	var _node = this.rootNode;
	while (true)
	{
		if (_node.height == 1)
			break;
		
		if (segment.IsOnTheLeftOf(_node.segment, l))
			_node = _node.leftNode;
		else
		{
			this.tempNode = _node;
			_node = _node.rightNode;
		}
	}
	
	if (this.tempNode != null)
	{
		var splitNode = this.tempNode;
		this.tempNode = null;
		return this.FindMaxNode(splitNode.leftNode).segment;
	}
	else
		return null;
}

StatusTree.prototype.GetRightNode = function (segment, l) {
	if (this.rootNode == null) return null;
	
	var _node = this.rootNode;
	while (true)
	{
		if (_node.height == 1)
			break;
		
		if (segment.IsOnTheLeftOf(_node.segment, l))
		{
			this.tempNode = _node;
			_node = _node.leftNode;
		}
		else
			_node = _node.rightNode;
	}
	
	if (this.tempNode != null)
	{
		var splitNode = this.tempNode;
		this.tempNode = null;
		return this.FindMinNode(splitNode.rightNode).segment;
	}
	else
		return null;
}

StatusTree.prototype.Count = function () {
	this.count = 0;
	if (this.rootNode != null)
		this.CountRecursion(this.rootNode);
	return this.count;
}
StatusTree.prototype.CountRecursion = function (node) {
	if (node.height == 1)
	{
		this.count++;
		return;
	}
	this.CountRecursion(node.leftNode);
	this.CountRecursion(node.rightNode);
}

function FindIntersections(segmentArray)
{
	this.eventQueue = new EventQueue();
	this.statusTree = new StatusTree();
	this.intersections = [];
	this.temp1 = null; // for the algorithm
	this.temp2 = null; // for the algorithm
	this.previousL = null;
	
	// initialize for the algorithm
	for (i = 0; i < segmentArray.length; i++)
	{
		var _segment = segmentArray[i];
		
		var _upperPoint = this.eventQueue.InsertEventPoint(_segment.upperPoint);
		var _lowerPoint = this.eventQueue.InsertEventPoint(_segment.lowerPoint);
		
		_upperPoint.AddCorrespondingSegment(_segment);
	}
}

FindIntersections.prototype.Solve = function() {
	while (this.eventQueue.eventQueue.length > 0)
	{
		this.HandleEventPoint(this.eventQueue.GetNextEventPoint());
	}
}

FindIntersections.prototype.HandleEventPoint = function(eventPoint) {
	var U_p = eventPoint.correspondingSegments;
	this.temp1 = []; this.temp2 = [];
	if (this.statusTree.rootNode != null)
		this.GetAllSegmentsThrough(this.statusTree.rootNode, eventPoint);
	
	var C_p = this.temp1;
	var L_p = this.temp2;
	console.log("==========================");
	console.log("Handling Event Point: " + eventPoint.x + ', ' + eventPoint.y);
	console.log("U(p) = ");
	console.log(U_p);
	console.log("C(p) = ");
	console.log(C_p);
	console.log("L(p) = ");
	console.log(L_p);
	this.temp1 = null; this.temp2 = null;
	
	if (U_p.length + C_p.length + L_p.length > 1)
	{
		var newIntersection = new EventPoint(eventPoint.x, eventPoint.y);
		for (i = 0; i < U_p.length; i++) newIntersection.AddCorrespondingSegment(U_p[i]);
		for (i = 0; i < C_p.length; i++) newIntersection.AddCorrespondingSegment(C_p[i]);
		for (i = 0; i < L_p.length; i++) newIntersection.AddCorrespondingSegment(L_p[i]);
		this.intersections.push(newIntersection);
	}
	
	var _s = null;
	var __s = null;
	var s_l = null;
	var s_r = null;
	
	if (U_p.length + C_p.length == 0)
	{
		s_l = this.statusTree.GetLeftNode(L_p[0], eventPoint.y);
		s_r = this.statusTree.GetRightNode(L_p[L_p.length - 1], eventPoint.y);
		console.log("s_l =");
		console.log(s_l);
		console.log("s_r =");
		console.log(s_r);
	}
	console.log("Insert & Delete segments in status tree. Number of segments: " + this.statusTree.Count());
	for (i = 0; i < L_p.length; i++) this.statusTree.Delete(L_p[i], this.previousL);
	//console.log(this.statusTree.rootNode);
	for (i = 0; i < C_p.length; i++) this.statusTree.Delete(C_p[i], this.previousL);
	//console.log(this.statusTree.rootNode);
	for (i = 0; i < U_p.length; i++) this.statusTree.Insert(U_p[i], eventPoint.y);
	//console.log(this.statusTree.rootNode);
	for (i = 0; i < C_p.length; i++) this.statusTree.Insert(C_p[i], eventPoint.y);
	//console.log(this.statusTree.rootNode);
	
	if (U_p.length + C_p.length == 0)
	{
		if (s_l != null && s_r != null)
			this.FindNewEvent(s_l, s_r, eventPoint);
	}
	else
	{
		for (i = 0; i < U_p.length; i++)
		{
			if (_s == null || U_p[i].IsOnTheLeftOf(_s, eventPoint.y))
				_s = U_p[i];
			if (__s == null || __s.IsOnTheLeftOf(U_p[i], eventPoint.y))
				__s = U_p[i];
		}
		for (i = 0; i < C_p.length; i++)
		{
			if (_s == null || C_p[i].IsOnTheLeftOf(_s, eventPoint.y))
				_s = C_p[i];
			if (__s == null || __s.IsOnTheLeftOf(C_p[i], eventPoint.y))
				__s = C_p[i];
		}
		s_l = this.statusTree.GetLeftNode(_s, eventPoint.y);
		s_r = this.statusTree.GetRightNode(__s, eventPoint.y);
		console.log("s' =");
		console.log(_s.upperPoint.x, _s.upperPoint.y, _s.lowerPoint.x, _s.lowerPoint.y);
		console.log("s'' = ");
		console.log(__s.upperPoint.x, __s.upperPoint.y, __s.lowerPoint.x, __s.lowerPoint.y);
		console.log("s_l =");
		console.log(s_l);
		console.log("s_r =");
		console.log(s_r);
		
		if (s_l != null)
			this.FindNewEvent(s_l, _s, eventPoint);
		if (s_r != null)
			this.FindNewEvent(__s, s_r, eventPoint);
	}
	
	if (this.eventQueue.eventQueue.length > 0 && this.eventQueue.eventQueue[0].y > eventPoint.y) this.previousL = eventPoint.y;
}

FindIntersections.prototype.GetAllSegmentsThrough = function(statusTreeNode, eventPoint) {
	// fill C to this.temp1, fill L to this.temp2
	if (statusTreeNode.height == 1)
	{
		if (eventPoint.Equals(statusTreeNode.segment.lowerPoint))
		{
			this.temp2.push(statusTreeNode.segment);
			return;
		}
		
		if (eventPoint.y < statusTreeNode.segment.lowerPoint.y && eventPoint.y > statusTreeNode.segment.upperPoint.y)
		{
			if (Math.abs((eventPoint.x - statusTreeNode.segment.upperPoint.x)*(statusTreeNode.segment.lowerPoint.y - statusTreeNode.segment.upperPoint.y) - (eventPoint.y - statusTreeNode.segment.upperPoint.y)*(statusTreeNode.segment.lowerPoint.x - statusTreeNode.segment.upperPoint.x)) < 0.00000000000001)
			{
				this.temp1.push(statusTreeNode.segment);
				return;
			}
		}
		
		return;
	}
	
	this.GetAllSegmentsThrough(statusTreeNode.leftNode, eventPoint);
	this.GetAllSegmentsThrough(statusTreeNode.rightNode, eventPoint);
}

FindIntersections.prototype.FindNewEvent = function(segmentL, segmentR, point) {
	var intersectionPoint = getLineIntersection(segmentL.upperPoint.x, segmentL.upperPoint.y, segmentL.lowerPoint.x, segmentL.lowerPoint.y, segmentR.upperPoint.x, segmentR.upperPoint.y, segmentR.lowerPoint.x, segmentR.lowerPoint.y);
	if (intersectionPoint == null) return;
	
	intersectionPoint = new EventPoint(intersectionPoint[0], intersectionPoint[1]);
	
	if (intersectionPoint.y > point.y || (intersectionPoint.y == point.y && intersectionPoint.x > point.x)) {
		this.eventQueue.InsertEventPoint(intersectionPoint);
	}
}

function getLineIntersection(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y)
{
    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1_x - p0_x;     s1_y = p1_y - p0_y;
    s2_x = p3_x - p2_x;     s2_y = p3_y - p2_y;

    var s, t;
    s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
    {
        // Collision detected
        return [p0_x + (t * s1_x), p0_y + (t * s1_y)];
    }

    return null; // No collision
}