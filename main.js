var rows = 1;
var columns = 1;
var squareSide; //Size of square
var maxSquareSide;
var image;
var cL, cT;
var ro = new ResizeObserver(entries => {
  cL = entries[0].target.x;
  cT = entries[0].target.y;
  console.log(cL);
  console.log(gridContainer.offsetLeft);
  squareSide = calcSquare(image.width/rows, image.height/columns);
  drawGrid();
});

var downloads = [];

//All Div Containers
var imagePartsContainer;
var downloadContainer;
var gridContainer;
var cropContent;
var rowCount;
var columnCount;
var countersContainer;
var uploadForm;

function initialize() {
    ro.observe(cri);
    cropContent = document.getElementById('cropContent');
    cri = document.getElementById('cri');
    crp = document.getElementById('crp');
    imagePartsContainer = document.getElementById('imagePartsContainer')
    downloadContainer = document.getElementById('downloadContent');
    gridContainer = document.getElementById('gridContainer');
    rowCount = document.getElementById('rowCount');
    columnCount = document.getElementById('columnCount');
    countersContainer = document.getElementById('countersContainer');
    uploadForm = document.getElementById('uploadForm');
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      uploadForm.addEventListener(eventName, preventDefaults, false)
    })
    uploadForm.addEventListener('drop', handleDrop, false);
}

function handleDrop(e) {
  let dt = e.dataTransfer
  let files = dt.files

  cri.src = '';
  createImage(URL.createObjectURL(files[0]));
  countersContainer.style.display = 'unset';
}

function preventDefaults (e) {
  e.preventDefault()
  e.stopPropagation()
}

function rowsChanged() {
  rows = rowCount.value;
  squareSide = calcSquare(image.width/rows, image.height/columns)
  drawGrid();
}

function columnsChanged() {
  columns = columnCount.value;
  squareSide = calcSquare(image.width/rows, image.height/columns)
  drawGrid();
}

function loadFile(event) {
    cri.src = '';
    URL.createObjectURL(event.target.files[0]);
    createImage(URL.createObjectURL(event.target.files[0]));
    countersContainer.style.display = 'unset';
}

function getScaleCropFactor() {
  var scaleWidth = 1, scaleHeight = 1;
  if(cropContent.getBoundingClientRect().width < image.width) {
    scaleWidth = cri.offsetWidth / image.width //cropContent.getBoundingClientRect().width / image.width;
  }
  if(cropContent.getBoundingClientRect().height < image.height) {
    scaleHeight = cri.offsetHeight / image.height//cropContent.getBoundingClientRect().height / image.height;
  }
  return scaleWidth > scaleHeight ? scaleHeight : scaleWidth;
}

function createImage(url) {
    image = new Image();
    image.src = url;
    image.onload = initializeCroppableImage
}

function initializeCroppableImage() {
    squareSide = calcSquare(this.width/rows, this.height/columns);
    maxSquareSide = calcSquare(this.width/rows, this.height/columns);
    drawImageBackground(this);
    //drawGrid();
    dragElement(gridContainer, cropContent);
}

function drawImageBackground(img) {
    cri.src = img.src;
    cri.onload = drawGrid();
}

function drawGrid() {
    gridContainer.textContent = '';
    //const wh = calcSquare(img.width/rows, img.height/columns);
    gridContainer.style = "cursor: move; position: fixed; display: grid; grid-template-columns: repeat(" + rows + "," + squareSide * getScaleCropFactor() + "px)";
    gridContainer.style.left = cL + 'px';
    gridContainer.style.top = cT + 'px';
    gridContainer.addEventListener('mousewheel', mouseWheel);
    crp.appendChild(gridContainer);
    for(c = 0; c < columns; c++) {
        for(r = 0; r < rows; r++) {
          var gridSquare = document.createElement('div');
          gridSquare.setAttribute("id", "R" + r + "C" + c);
          gridContainer.appendChild(gridSquare);
          gridSquare.style = 'box-sizing: border-box; border: 1px solid black;' + ' width: ' + squareSide * getScaleCropFactor() + 'px ; height: ' + squareSide * getScaleCropFactor() + 'px;';
        }
    }
    return gridContainer;
}

function mouseWheel(e) {
  squareSide = squareSide + e.deltaY * 0.1;
  if (maxSquareSide > squareSide) {
    drawGrid();
  }
  
  /*
  for(c = 0; c < columns; c++) {
    for(r = 0; r < rows; r++) {
      var square = document.getElementById('R' + r + 'C' + c);
      if (maxSquareSide > squareSide) {
        square.style.width = squareSide * getScaleCropFactor() + 'px';
        square.style.height = squareSide * getScaleCropFactor() + 'px';
      }
    }
  }
  if (maxSquareSide > squareSide) {
    const ol = gridContainer.offsetLeft;
    const ot = gridContainer.offsetTop;
    gridContainer.style = "cursor: move; position: absolute; display: grid; grid-template-columns: repeat(" + rows + "," + squareSide + "px)";
    gridContainer.style.left = ol + 'px';
    gridContainer.style.top = ot + 'px';
  }*/
}

function calcSquare(width, height) {
    return width < height ? width : height;
}

function drawImageParts(img) {
    downloads = [];
    //const wh = calcSquare(img.naturalWidth/rows, img.naturalHeight/columns);
    const div2 = document.getElementById('cri').getBoundingClientRect();
    //var imagePartsContainer = document.getElementById('imagePartsContainer');
    imagePartsContainer.textContent = '';
    imagePartsContainer.style.gridTemplateRows = 'repeat(' + columns + ',' + 100/columns + '%)';
    imagePartsContainer.style.gridTemplateColumns = 'repeat(' + rows + ',' + 100/rows + '%)';
    for(c = 0; c < columns; c++) {
      for(r = 0; r < rows; r++) {
        var imagePart = document.createElement('canvas');
        imagePart.width = squareSide;
        imagePart.height = squareSide;
        const rect = document.getElementById('R' + r + 'C' + c).getBoundingClientRect();
        imagePart.getContext('2d').drawImage(img, (rect.x - div2.x) / getScaleCropFactor(), (rect.y - div2.y) / getScaleCropFactor() , squareSide, squareSide, 0, 0, squareSide, squareSide);
        //imagePartsContainer.appendChild(imagePart);
        var i = document.createElement('img');
        i.src = imagePart.toDataURL();
        if(rows > columns) {
          i.style.width = '100%' //maxSquareSide * getScaleCropFactor();
        } else {
          i.style.height = '100%' //maxSquareSide * getScaleCropFactor();
        }
        //i.style.maxHeight = '100%' //maxSquareSide * getScaleCropFactor();
        imagePartsContainer.appendChild(i);
        downloads.push(imagePart.toDataURL());
      }
  }
  //document.getElementById('downloadContent').appendChild(imagePartsContainer);
  downloadContainer.appendChild(imagePartsContainer);
  }

  function download() {
    downloads.forEach(v => {
      var a = document.createElement('a');
      a.href = v;
      a.download = 'tst.png'
      a.click();
    })
  }

//Make Div Draggable
function dragElement(elmnt, parentElmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }
  
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      const boundHeight = cri.offsetHeight + cri.offsetTop - elmnt.offsetHeight //parentElmnt.offsetHeight + parentElmnt.offsetTop - elmnt.offsetHeight;
      
      const boundWidth = cri.offsetWidth + cri.offsetLeft - elmnt.offsetWidth//parentElmnt.offsetWidth + parentElmnt.offsetLeft - elmnt.offsetWidth;
      // set the element's new position:)
      if ((elmnt.offsetTop - pos2) < boundHeight && (elmnt.offsetTop - pos2) > cri.offsetTop) {
        elmnt.style.top = (elmnt.offsetTop - pos2) + 'px';
      }
      if ((elmnt.offsetLeft - pos1) < boundWidth && (elmnt.offsetLeft - pos1) > cri.offsetLeft) {
        elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px';
      }
      drawImageParts(image);
      //elmnt.style.top = (elmnt.offsetTop - pos2) >= boundHeight || (elmnt.offsetTop - pos2) <= parentDiv2.offsetTop ? elmnt.style.top : (elmnt.offsetTop - pos2)  + "px";
      //elmnt.style.left = (elmnt.offsetLeft - pos1) >= boundWidth || (elmnt.offsetHeight - pos1) <= parentDiv2.offsetHeight ? elmnt.style.top : (elmnt.offsetLeft - pos1)  + "px";
    }
  
    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }