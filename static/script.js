const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let isDrawing = false;
let x = 0;
let y = 0;
var offsetX;
var offsetY;

const ongoingTouches = [];

function handleStart(evt) {
    evt.preventDefault();
    const touches = evt.changedTouches;
    offsetX = canvas.getBoundingClientRect().left;
    offsetY = canvas.getBoundingClientRect().top;
    for (let i = 0; i < touches.length; i++) {
        ongoingTouches.push(copyTouch(touches[i]));
    }
}

function handleMove(evt) {
    evt.preventDefault();
    const touches = evt.changedTouches;
    for (let i = 0; i < touches.length; i++) {
        const color = document.getElementById('selColor').value;
        const idx = ongoingTouchIndexById(touches[i].identifier);
        if (idx >= 0) {
            drawLine(
                context,
                ongoingTouches[idx].clientX - offsetX,
                ongoingTouches[idx].clientY - offsetY,
                touches[i].clientX - offsetX,
                touches[i].clientY - offsetY
            );

            ongoingTouches.splice(idx, 1, copyTouch(touches[i]));
        }
    }
}

function handleEnd(evt) {
    evt.preventDefault();

    const touches = evt.changedTouches;
    for (let i = 0; i < touches.length; i++) {
        const color = document.getElementById('selColor').value;
        let idx = ongoingTouchIndexById(touches[i].identifier);
        if (idx >= 0) {
            context.lineWidth = document.getElementById('lineSize').value;
            context.fillStyle = color;
            ongoingTouches.splice(idx, 1);
        }
    }
}

function handleCancel(evt) {
    evt.preventDefault();

    const touches = evt.changedTouches;
    for (let i = 0; i < touches.length; i++) {
        let idx = ongoingTouchIndexById(touches[i].identifier);
        ongoingTouches.splice(idx, 1);
    }
}

function copyTouch({ identifier, clientX, clientY }) {
    return { identifier, clientX, clientY };
}

function ongoingTouchIndexById(idToFind) {
    for (let i = 0; i < ongoingTouches.length; i++) {
        const id = ongoingTouches[i].identifier;
        if (id === idToFind) {
            return i;
        }
    }
    return -1;
}

function drawLine(context, x1, y1, x2, y2) {
    const event = {
        "originX": x1,
        "originY": y1,
        "destX": x2,
        "destY": y2,
        "lineColor": document.getElementById('lineColor').value,
        "lineSize": document.getElementById('lineSize').value
    };
    ws.send(JSON.stringify(event));
}

function renderLine(event) {
    context.beginPath();
    context.strokeStyle = event.lineColor;
    context.lineWidth = event.lineSize;
    context.lineJoin = "round";
    context.moveTo(event.originX, event.originY);
    context.lineTo(event.destX, event.destY);
    context.closePath();
    context.stroke();
}

function clearArea() {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

const wsProto = location.protocol === "https:" ? "wss:" : "ws:";
const ws = new WebSocket(`${wsProto}//${location.host}/global`);

ws.onmessage = (event) => {
    const evtData = JSON.parse(event.data);
    console.log("Received:", evtData);

    if (evtData.type === "initial") {
        for (const elem of evtData.contents) {
            renderLine(elem);
        }
    } else if (evtData.type === "message") {
        renderLine(evtData.contents);
    }
}
ws.onopen = () => console.log("Connected");
ws.onerror = (event) => console.error("WebSocket error:", event);
ws.onclose = () => console.log("Disconnected");

canvas.addEventListener('touchstart', handleStart);
canvas.addEventListener('touchend', handleEnd);
canvas.addEventListener('touchcancel', handleCancel);
canvas.addEventListener('touchmove', handleMove);
canvas.addEventListener('mousedown', (e) => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        drawLine(context, x, y, e.offsetX, e.offsetY);
        x = e.offsetX;
        y = e.offsetY;
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (isDrawing) {
        drawLine(context, x, y, e.offsetX, e.offsetY);
        x = 0;
        y = 0;
        isDrawing = false;
    }
});

