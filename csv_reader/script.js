let graphDuration = 30;
let updateFrequency = 5;

let contents = "";
let contentString = "";
let recent = [];
let header = [];

// retrieve the CSV data at regular intervals [DEPRECATED]
function getData(){
    $.get("../ev_data/temp.csv", function(data) {
        contentString = data;
    });
}

function doGET(path, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            // The request is done; did it work?
            if (xhr.status == 200) {
                // ***Yes, use `xhr.responseText` here***
                callback(xhr.responseText);
            } else {
                // ***No, tell the callback the call failed***
                callback(null);
            }
        }
    };
    xhr.open("GET", path);
    xhr.send();
}

function handleFileData(fileData) {
    if (!fileData) {
        console.log("XML HTTP Request Failed");
        return;
    }
    // Use the file data
    contentString = fileData;
}

let cache = [];

// in seconds at updateFrequency rows per second
let cacheSize = 60;
let lastRow = "";

let graphSize = graphDuration * updateFrequency;

setInterval(update, 1000/updateFrequency);
//update();

function update(){
    //getData();
    doGET("../ev_data/temp.csv", handleFileData);
    let contents = contentString;
    graphSize = graphDuration * updateFrequency;

    // split away the first line of the CSV file for column names
    contents = contents.split("\n");
    header = contents[0].split(",");

    // remove header line so it doesn't affect the graph
    // and last line because it is always empty
    contents.shift();
    contents.pop();

    let newContents = [];
    for (let i = contents.length - 1; i > 0; i--){
        if(contents[i] != cache[cache.length - 1]){
            newContents.push(contents[i]);
        }else{
            break;
        }
    }

    for(let i = newContents.length - 1; i > 0; i--){
        cache.push(newContents[i]);
        if(cache.length > cacheSize * updateFrequency){
            cache.shift();
        }
    }

    lastRow = contents[contents.length - 1];

    // get only the last graphDuration seconds or less of the data
    if(cache.length > graphSize){
        recent = cache.slice(-graphSize);
    }else{
        recent = structuredClone(cache);
    }

    for(let i = 0, l = recent.length; i < l; i++){
        recent[i] = recent[i].split(",");
    }

    // need any graphs?
    for(let i = 0, l = graphs.length; i < l; i++){
        renderGraph(graphs[i]);
    }
}

function renderGraph(graph){
    for (let j = 0, jl = header.length; j < jl; j++){
        if(graph[0] != header[j]) {continue;}
        let canvas = graph[1];
        let properties = graph[2];
        let width = canvas.width;
        let height = canvas.height;
        let interval = width / graphSize;
        let progress = 0;
        let stepX = properties.stepX;
        let stepY = properties.stepY;

        let edgeGap = Math.min(width, height) * properties.axisProportions;
        let inverseProp = 1 - properties.axisProportions;

        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, width, height);

        //implement scale
        ctx.lineCap = "round";
        ctx.lineWidth = properties.lineThickness;
        ctx.strokeStyle="rgba(0, 0, 0, 1)";
        canvas.style.backgroundColor = properties.backgroundColor;

        //Axes

        //Y-Axis
        drawLine(ctx, edgeGap, 0, edgeGap, height - edgeGap);

        //X-Axis
        drawLine(ctx, edgeGap, height - edgeGap, width, height - edgeGap);
        

        // TODO: custom min and max, styles
        // Cut off first seconds or so of graph for clean scroll
        let filtered = [];
        for (let k = 0, kl = recent.length; k < kl; k++){
            filtered.push(parseFloat(recent[k][j]));
        }

        let min = Math.min.apply(Math, filtered);
        let max = Math.max.apply(Math, filtered);

        let range = max - min;
        let ratio = height / 2 / range;
        let adjustedMin = (min * ratio) - height / 4;

        let tMin = 0;
        let tMax = 0;
        if(properties.relativeTime){
            tMin = -properties.duration;
            tMax = 0;
        }else{
            tMin = parseInt(recent[0][0]);
            tMax = parseInt(recent[recent.length - 1][0]);
        }
        let axisRatio = (width)/(tMax - tMin);

        ctx.strokeStyle="rgba(0, 0, 0, 0.5)";
        ctx.font = "Monospace";

        for(let i = Math.round(tMin); i < tMax; i++){
            if(i % stepX == 0){
                ctx.save();
                let pos = edgeGap + (i - tMin)*axisRatio*Math.sqrt(inverseProp);
                drawLine(ctx, pos, 0, pos, height - edgeGap);
                ctx.translate(pos + 3, height - 2);
                ctx.rotate(-90 * Math.PI / 180);
                ctx.fillText(i, 0, 0);
                ctx.restore();
            }
        }

        axisRatio = (height / Math.sqrt(inverseProp))/(max - min);
        //console.log(min);
        for(let i = Math.floor(min-range/2); i < max + (range/2); i += 1){
            if(Math.floor(i) % stepY == 0){
                ctx.save();
                let pos = height-(((i - Math.floor(min-range/2))+range/2)*axisRatio/2-edgeGap)*Math.sqrt(inverseProp);
                drawLine(ctx, edgeGap, pos, width, pos);
                ctx.translate(0, pos);
                ctx.fillText(i, 0, 0);
                ctx.restore();
            }
        }

        ctx.strokeStyle = properties.color;
        ctx.beginPath();
        for (let k = 0, kl = recent.length; k < kl; k++){
            if(k == 0){
                ctx.moveTo(edgeGap + progress, height - edgeGap - (recent[k][j] * ratio) + adjustedMin);
            }else{
                ctx.lineTo(edgeGap + progress * inverseProp, (height - (recent[k][j] * ratio) + adjustedMin) * inverseProp - edgeGap);
                //ctx.stroke();
            }
            progress += interval;
        }
        ctx.stroke();
    }
}

function drawLine(ctx, x1, y1, x2, y2){
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function closestMultiple(n, x)
{  
    n = n + x/2;
    n = n - (n%x);
    return n;
}

function previousMultiple(n, x)
{  
    n = n - (n%x);
    return n;
}

function nextMultiple(n, x)
{  
    n = n - (n%x) + x;
    return n;
}
