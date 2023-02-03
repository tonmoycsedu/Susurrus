var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var x = "black",
    y = 2;

function show_canvas_buttons(){
    $("#save_drawing").show()
    $("#erase_drawing").show()

}
function hide_canvas_buttons(){
    $("#save_drawing").hide()
    $("#erase_drawing").hide()
    $("#time_label").hide()
    $("#time_value").hide()

}


function init_canvas() {
    $("#chart_div").append("<canvas id='can' width="+$('#chart_div').width()+" height='300'"+
                            " style='border:2px solid;margin-top:10px'></canvas>")

    $("#chart_div").append("<div id='colors' style='height:150px;'>Choose Color:</div>")
    var colors = ['black','green','red','orange','blue']
    var left = $('#chart_div').width()/2-50;
    colors.forEach(function(d){
        $("#colors").append('<div style="position:absolute;left:'+left+'px;width:15px;height:15px;background:'+d+';" id='+d+' onclick="color(this)"></div>')
        left += 30;
    })
    $("#colors").append("<p id='time_remaining' style='display:none;margin-top:50px;font-weight:bold;'>Time Remaining: 30</p>")
    // $("#center_div").append('<button id="save_drawing" class="btn btn-outline-primary">Save Drawing</button>'+
    //                         '<button id="erase_drawing" class="btn btn-outline-primary">Erase Drawing</button>')
    canvas = document.getElementById('can');
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;

    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e)
    }, false);
}

function color(obj) {
    switch (obj.id) {
        case "green":
            x = "green";
            break;
        case "blue":
            x = "blue";
            break;
        case "red":
            x = "red";
            break;
        case "yellow":
            x = "yellow";
            break;
        case "orange":
            x = "orange";
            break;
        case "black":
            x = "black";
            break;
        case "white":
            x = "white";
            break;
    }
    if (x == "white") y = 14;
    else y = 2;

}

function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = x;
    ctx.lineWidth = y;
    ctx.stroke();
    ctx.closePath();
}

function erase() {
    var m = confirm("Want to clear");
    if (m) {
        ctx.clearRect(0, 0, w, h);
    }
}
$("body").on("click","#erase_drawing",erase)

function save() {
    // document.getElementById("canvasimg").style.border = "2px solid";
    $(this).attr("href",canvas.toDataURL())
    $(this).attr("download","image"+currentChart+".png");
    imageSaved = true
    // $.ajax({
    //       url: '/save_base64',
    //       data: JSON.stringify({base64:dataURL}),
    //       type: 'POST',
    //       success: function(res){
    //             alert("saved image successfully!")
    //       },
    //       error: function(error){
    //           console.log("error !!!!");
    //       }
    //   });
}
$("body").on("click","#save_drawing",save)

function findxy(res, e) {
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - $("#chart_div").offset().left;
        currY = e.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = x;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - $("#chart_div").offset().left;
            currY = e.clientY - canvas.offsetTop;
            // console.log(currX,cu)
            draw();
        }
    }
}