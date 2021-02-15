var ceilingY0 = 200;
var floorY0 = 360;
var ceilingX0 = 420;
var floorX0 = 550;
var ceilingR0 = 320;
var floorR0 = 360;


var diverge = 10;
var rayNum = 20;
var dotDist = 8;

var frameArr = [];
var recordMode = 0;

var exportArr = [];
var exportCounter = 0;

function preload() {
  bg = loadImage('ref1.jpg', loadImgSuccess);
}

function loadImgSuccess() {
  console.log('BG loaded successfully!');
}

function setup() {
  createCanvas(1000, 1000);

  bg.loadPixels();

  ceilingYSlider = createSlider(0, height / 2, ceilingY0, 10);
  ceilingYSlider.position(10, height - 25);

  floorYSlider = createSlider(0, height / 2, floorY0, 10);
  floorYSlider.position(width / 2 + 10, height - 25);

  ceilingXSlider = createSlider(0, width, ceilingX0, 10);
  ceilingXSlider.position(10, height - 25 * 2);

  floorXSlider = createSlider(0, width, floorX0, 10);
  floorXSlider.position(width / 2 + 10, height - 25 * 2);

  ceilingRSlider = createSlider(0, width / 2, ceilingR0, 10);
  ceilingRSlider.position(10, height - 25 * 3);

  floorRSlider = createSlider(0, width / 2, floorR0, 10);
  floorRSlider.position(width / 2 + 10, height - 25 * 3);

  clearFramesButton = createButton("Clear Frames");
  clearFramesButton.position(10, height - 25 * 5);
  clearFramesButton.mousePressed(clearFramesNow);

  downloadFramesButton = createButton("Download Frames");
  downloadFramesButton.position(10 + 150, height - 25 * 5);
  downloadFramesButton.mousePressed(downloadFramesNow);

  exportNameInput = createInput('frameExport_ray_');
  exportNameInput.position(10 + 150 * 2, height - 25 * 5);

  recordButton = createButton("Record");
  recordButton.position(10, height - 25 * 6);
  recordButton.mousePressed(recordNow);

  textAlign(LEFT, TOP);
  textSize(20);
}

function downloadFramesNow() {
  //print(frameArr);
  exportArr = [];
  var prevInk;
  var prevWet;
  var prevLayer = 0;

  for (var i = 0; i < frameArr.length; i++) {
    var framesString = 'B   ' + brushSize.toFixed(5) + ' \n';

    for (var j = 0; j < frameArr[i].length; j++) {
      var pitch = random(0, -6);
      for (var k = 0; k < frameArr[i][j].length; k++) {
        var layer = frameArr[i][j][k].layer;
        var x = ((frameArr[i][j][k].x / width - 0.5) * 10).toFixed(5);
        var y = (((frameArr[i][j][k].y) / height - 0.5) * 10).toFixed(5);
        var depth = (max(frameArr[i][j][k].weight, 0.1) * expresiiDotWeight(brushSize)).toFixed(5);
        var wet = expresiiWetVal(int(max(min(frameArr[i][j][k].wet - 2, 12), 1)));
        var ink = int(min((1 - pow(frameArr[i][j][k].ink - 1, 4)) - 0.1, 0.9) * 10) / 10;
        var roll = -45 * min(frameArr[i][j][k].noise + 0.1, 1);


        if (ink !== prevInk) {
          framesString = framesString + "a   0.00000   " + (-ink).toFixed(5) + ' \n';
        }

        if (wet !== prevWet) {
          framesString = framesString + "w   " + (wet).toFixed(5) + ' \n';
        }

        if (layer !== prevLayer) {
          if (layer == 2) {
            framesString = framesString + 'L   1.00000   2.00000 \n';
          }
          framesString = framesString + 'L   0.00000   1.00000 \n';
        }

        if (k == 0) {
          framesString =
            framesString + 's  ' +
            x + '   ' +
            '0.10000   ' +
            y + '   ' +
            pitch.toFixed(5) + '   ' +
            roll.toFixed(5) + '   ' +
            '0.00000    0.00000 \n';
        }

        framesString =
          framesString + 's  ' +
          x + '   ' +
          -depth + '   ' +
          y + '   ' +
          pitch.toFixed(5) + '   ' +
          roll.toFixed(5) + '   ' +
          '0.00000    0.50000 \n';

        if (k == frameArr[i][j].length - 1) {
          framesString =
            framesString + 's  ' +
            x + '   ' +
            '0.10000   ' +
            y + '   ' +
            pitch.toFixed(5) + '   ' +
            roll.toFixed(5) + '   ' +
            '0.00000    0.00000 \n';
        }

        prevWet = wet;
        prevInk = ink;
        prevLayer = layer;

      }
    }
    exportArr.push(framesString);
  }
}

function clearFramesNow() {
  frameArr = [];
}

function recordNow() {
  if (recordMode) {
    recordMode = 0;
  } else {
    recordMode = 1;
  }
}

var time = 0;
var inkDecay = 0;
var inkVari = 10;
var wetDecay = 11;
var wetVari = 11;
var brushSize = 4;

function draw() {
  background(220);
  frameRate(24);
  angleMode(DEGREES);

  if (max(bg.width, bg.height) == bg.width) {
    image(bg, 0,
      height / 2 - bg.height / bg.width * width / 2, width, bg.height / bg.width * width);
  } else {
    image(bg, width / 2 - bg.width / bg.height * height / 2,
      0, bg.width / bg.height * height, height);
  }

  ceilingY = ceilingYSlider.value();
  floorY = height - floorYSlider.value();
  ceilingX = ceilingXSlider.value();
  floorX = floorXSlider.value();
  ceilingR = ceilingRSlider.value();
  floorR = floorRSlider.value();

  var lineArr = [];

  for (var i = 0; i < rayNum; i++) {
    var rNoise = noise(i * 1000 + time * 0.01) * 3 - 1.5;
    var wNoise = noise(i * 1000 + time * 0.02);
    var rayDist = dist(ceilingX + rNoise * ceilingR, ceilingY, floorX + rNoise * floorR, floorY);
    var dotNum = int(rayDist / dotDist);
    var dotArr = [];
    var layer = int(i / rayNum * 3);

    for (var j = 0; j < dotNum; j++) {
      var dotRatio = j / (dotNum - 1);
      var expoDotRatio = (1 - pow(dotRatio, int(wNoise * 4) * 2)); ///2 + (1-dotRatio)/2;
      var x = (1 - dotRatio) * (ceilingX + rNoise * ceilingR) + dotRatio * (floorX + rNoise * floorR);
      var y = ceilingY - layer * 30 + dotRatio * (floorY - ceilingY);
      var w = (1 - pow(wNoise - 1, 2)) * expoDotRatio;

      var wetVal = int(22 - (1 - wNoise) * wetVari - dotRatio * wetDecay);
      var inkVal = int(wNoise * inkVari + dotRatio * inkDecay) / 10;



      dotArr.push({
        x: x,
        y: y,
        weight: w,
        wet: wetVal,
        ink: inkVal,
        layer: layer,
        noise: wNoise
      })

      //fill(255, 255, 255, 15);
      //ellipse(x, y, wetVal * 5 * expoDotRatio, wetVal * 5 * expoDotRatio);

      var grey = inkVal * 255;
      fill(grey, grey, grey, 50);

      ellipse(x, y, 100 * w, (wetVal / 10) * w * 25);

    }

    lineArr.push(dotArr);
  }

  time++

  if (recordMode) {

    if (frameCount % 2 == 0) {
      frameArr.push(lineArr);
    }

    push();
    noFill();
    stroke(255, 0, 0);
    strokeWeight(10);
    rect(0, 0, width, height);
    pop();
  }

  if (exportArr.length > 0 && frameCount % 2 == 0) {
    saveStrings([exportArr[0]], exportNameInput.value() + exportCounter, 'xst');
    exportCounter++;
    exportArr.shift();
  }


  noFill();
  stroke(255);
  quad(ceilingX - ceilingR, ceilingY,
    ceilingX + ceilingR, ceilingY,
    floorX + floorR, floorY,
    floorX - floorR, floorY);

  fill(0);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(18);
  text('ceilingY: ' + ceilingY, 10 + 150, height - 25);
  text('floorY: ' + floorY, width / 2 + 10 + 150, height - 25);
  text('ceilingX: ' + ceilingX, 10 + 150, height - 25 * 2);
  text('floorX: ' + floorX, width / 2 + 10 + 150, height - 25 * 2);
  text('ceilingR: ' + ceilingR, 10 + 150, height - 25 * 3);
  text('floorR: ' + floorR, width / 2 + 10 + 150, height - 25 * 3);
  text('Recorded Frames: ' + frameArr.length, 10 + 100, height - 25 * 6);

  fill(255);
  textAlign(CENTER, CENTER);
  text('(' + ceilingX + ', ' + ceilingY + ')', ceilingX, ceilingY - 15);
  text('(' + floorX + ', ' + floorY + ')', floorX, floorY + 15);

}

function expresiiDotWeight(brushSize) {
  var val = 0;
  if (brushSize == 9) {
    val = 1.3;
  } else if (brushSize == 8) {
    val = 0.9;
  } else if (brushSize == 7) {
    val = 0.5;
  } else if (brushSize == 6) {
    val = 0.4;
  } else if (brushSize == 5) {
    val = 0.3;
  } else if (brushSize == 4) {
    val = 0.2;
  } else if (brushSize == 3) {
    val = 0.1;
  } else if (brushSize == 2) {
    val = 0.08;
  } else if (brushSize == 1) {
    val = 0.06;
  }
  return val;
}

function expresiiWetVal(wetIdx) {
  var val = 0;
  if (wetIdx == 12 || wetIdx == 13) {
    val = 1;
  } else if (wetIdx == 11) {
    val = 0.65;
  } else if (wetIdx == 10) {
    val = 0.4;
  } else if (wetIdx == 9) {
    val = 0.19;
  } else if (wetIdx == 8) {
    val = 0.15;
  } else if (wetIdx == 7) {
    val = 0.10;
  } else if (wetIdx == 6) {
    val = 0.09;
  } else if (wetIdx == 5) {
    val = 0.08;
  } else if (wetIdx == 4) {
    val = 0.07;
  } else if (wetIdx == 3) {
    val = 0.06;
  } else if (wetIdx == 2) {
    val = 0.05;
  } else if (wetIdx == 1) {
    val = 0.04;
  }
  return val;
}
