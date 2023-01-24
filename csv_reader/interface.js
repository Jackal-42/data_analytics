let graphs = [];
// let graph = document.createElement('div');
// let canvas = document.createElement('canvas');
// canvas.style.backgroundColor = 'lightgray';
// graph.appendChild(canvas);
let template = document.getElementById('window');
let usedIDs = 0;

const observer = new ResizeObserver(entries => {
    entries.forEach(entry => {
        let canvas = entry.target.getElementsByTagName('canvas')[0];
        canvas.width = entry.contentRect.width;
        canvas.height = entry.contentRect.height - entry.target.children[0].clientHeight;
        for(let i = 0; i < graphs.length; i++) {
            if(graphs[i][1] == canvas){

                renderGraph(graphs[i]);
            }
        }
    })
})

function graphProperties(){
    this.duration = 30;
    this.scale = 1;
    this.color = "rgba(0, 71, 171, 1)";
    this.lineThickness = 2;
    this.backgroundColor = "rgb(255, 255, 255)";
    this.axisProportions = 0.15;
    this.relativeTime = true;
    this.stepX = 10;
    this.stepY = 4;
    this.minorX = 1;
    this.minorY = 1;
}

function createGraph(type) {
    let elem = document.createElement('div')
    elem.style = `position: absolute; border-radius: 6px; overflow: hidden;
        box-shadow: 6px 6px 8px rgb(42, 42, 42, 0.25); resize: both;
        min-width: 200px; min-height: 160px;`
    elem.classList.add('window');
    elem.append(template.content.cloneNode(true));
    elem.id = "window_" + usedIDs;
    let topbar = elem.children[0];
    topbar.id = "window_" + usedIDs + "_header"

    topbar.addEventListener("contextmenu", function(e){
        e.preventDefault();
        contextMenu("cm_graph");
    })

    topbar.innerHTML = type;
    document.body.appendChild(elem);
    elem.style.top = "100px";
    elem.style.left = "100px";
    observer.observe(elem);
    dragElement(elem);
    graphs.push([type, elem.getElementsByTagName('canvas')[0], new graphProperties()]);
    usedIDs++;
}



function dragElement(elmnt)
{
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "_header")) {
      // if present, the header is where you move the DIV from:
      document.getElementById(elmnt.id + "_header").onmousedown = dragMouseDown;
    } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      elmnt.onmousedown = dragMouseDown;
    }
  
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
      // set the element's new position:
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }
  
    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
}

$(document).bind("click", function(event) {
    if(event.target.className == "context"){return;}
    document.getElementById("contextMenu").style.display = "none";
});

let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", function(e){
    mouseX = e.clientX;
    mouseY = e.clientY;
});

let cm = document.getElementById("contextMenu");
function contextMenu(template){
    cm.style.display = "block";
    cm.style.left = mouseX + "px";
    cm.style.top = mouseY + "px";
    cm.innerHTML = "";
    cm.appendChild(document.getElementById(template).content.cloneNode(true));
}