const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// draw a test rectangle
ctx.fillStyle = "green";
ctx.fillRect(100, 100, 200, 150);

// draw test text
ctx.fillStyle = "black";
ctx.font = "20px Arial";
ctx.fillText("Test", 100, 80);
