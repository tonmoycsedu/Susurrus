var bar, scatter, line, single_source, highchart_bar, highchart_line;
var synth = window.speechSynthesis;
var all_study_data;

let streamDest = false;
var mediaRecorder;
let chunks = [];
var task = 0;
var task_order = {
    1: [0, 1,2,3,4,5,6, 51, 18,19,17,20, 52, 21,22,23,25, 53, 26,27,28,29, 50, 7,8,9,10, 52, 11,12,13,14,15,16, 75],
    2: [0, 7,8,9,10, 52, 11,12,13,14,15,16, 50, 1,2,3,4,5,6, 51, 18,19,17,20, 52, 21,22,23,25, 53, 26,27,28,29, 75],
    3: [0, 1,2,3,4,5,6, 51, 21,22,23,25, 53, 18,19,17,20, 52, 26,27,28,29, 50, 11,12,13,14,15,16, 53, 7,8,9,10, 75],
    4: [0, 11,12,13,14,15,16, 53, 7,8,9,10, 50, 1,2,3,4,5,6, 51, 21,22,23,25, 53, 18,19,17,20, 52, 26,27,28,29, 75],
}

var title1 = "Welcome to Data Sonification Study. In this study, we will represent Spreadsheet data,"+
 " such as students’ scores, stock prices, point clouds, with sounds."+
 " First, we will introduce different natural sounds (e.g., birds and insects) that will be used in the study."+
 " Please press SHIFT + RIGHT ARROW to continue.";

var title2 = "Welcome to Data Sonification Study. In this study, we will represent Spreadsheet data,"+
 " such as students’ scores, stock prices, point clouds, with sounds."+
 " First, we will introduce different musical notes that will be used in the study."+
 " Please press SHIFT + RIGHT ARROW to continue.";

var title3= " Please press SPACE to play or pause a sound."+
    " Please press UP and DOWN ARROW to increase or decrease sound speed."  +
    " To listen to the next sound, please press SHIFT+RIGHT ARROW."+
    "  You can also listen to the previous sound by pressing SHIFT+LEFT ARROW." 

var title4= " You can press keys between 1 and 9 to listen to a single audio source. Press ESC to reset the selection.";

var title5= "Please press UP and DOWN ARROW to increase or decrease sound speed."

var title6= "Thank you for completing the first part of the study. Please press SHIFT + RIGHT ARROW to continue.";

$(document).ready(function() {
    // if(order % 2)
    //     $("#desc").append(title1)
    // else 
    //     $("#desc").append(title2)
    get_data()
    install_control()
    // initializeRecord();
    // toggleMenu()
});


function get_data(){
    $.ajax({
        url: '/get_all_study_data',
        success: function(res){
            // console.log(res)
            all_study_data = res.res.sort((a, b) => (a.index > b.index) ? 1 : -1)
            console.log(all_study_data)
            // populateMenu(all_study_data)
            // controller(task)
        },
        error: function(error){
            console.log("error !!!!");
        }
    });
}

function populateMenu(study_data){
    study_data.forEach(ele => {
        if(ele.index != 100)
            $("#select_task").append("<option value='"+ele.index+"'> Audio"+ele.index+"</option>")
    });
}

function controller(ind){
    $("#desc").show()
    $("#chart_viz").empty()
    var obj = all_study_data.find(d => d.index == ind)
    if (typeof obj !== 'undefined'){
        $("body").off("keyup");
        $("#task").html(obj.title)
        // utterTask(obj.title)
        
        if(obj.condition == 3) {
            highchart_line = false;
            highchart_bar = false;
            if (obj.type == "bar") {
                bar = new Bar("chart_config", "config_list", "chart_viz", obj.data);
            }
            else if (obj.type == "line") {
                line = new Line("chart_config", "config_list", "chart_viz", obj.data);
            }
            else if(obj.type == "scatter"){
                scatter = new Scatter("chart_config", "config_list", "chart_viz", obj.file_name);
            }
            else if(obj.type == "training"){
                console.log("training")
                line = new Line("chart_config", "config_list", "chart_viz", obj.data, 20);
            }
        }
        else if(obj.condition == 2){
            if (obj.type == "bar") {
                highchart_bar = new highchartBar("chart_config", "config_list", "chart_viz", obj.data);
                // highchart_line = false;
            }
            else if (obj.type == "line") {
                highchart_line = new highchartLine("chart_config", "config_list", "chart_viz", obj.data);
                // highchart_line = false;
            }

        }
        else if (obj.type == "audio") {
            console.log("entry audio")
            single_source = new Single_Source(obj.src, 0.4, obj.playBeep)

        }

    }
    
    // install_control()
}

function utterTask(title){
    let text = title
    // let text = ""
    var utterThis = new SpeechSynthesisUtterance(text);
    utterThis.rate = 0.8;
    utterThis.volume = 0.5;
    synth.speak(utterThis);
}

function set_title(title){
    if((task == 1 ) || (task_order[order][task] == 1))
        $("#desc").html(title3)

    if(task_order[order][task] >= 17)
        $("#desc").html(title4)

    else if((task_order[order][task] >= 7) && (task_order[order][task] < 17))
        $("#desc").html(title3)
    
    if(task_order[order][task] == 50){
        $("#desc").html(title6)
        $("#task").html("")
        utterTask(title6)
    }
    else if(task_order[order][task] == 51){
        var txt = "End of playing natural sounds that will be used in this study. Please press SHIFT + RIGHT ARROW to continue."
        $("#desc").html(txt)
        $("#task").html("")
        utterTask(txt)
    }
    else if(task_order[order][task] == 52){
        var txt = "End of comparing students' scores. Please press SHIFT + RIGHT ARROW to continue."
        $("#desc").html(txt)
        $("#task").html("")
        utterTask(txt)
    }
    else if(task_order[order][task] == 53){
        var txt = "End of comparing stock prices. Please press SHIFT + RIGHT ARROW to continue."
        $("#desc").html(txt)
        $("#task").html("")
        utterTask(txt)
    }
    else if(task_order[order][task] == 54){
        var txt = "End of comparing students' scores. Please press SHIFT + RIGHT ARROW to continue."
        $("#desc").html(txt)
        $("#task").html("")
        utterTask(txt)
    }
    else if(task_order[order][task] == 75){
        $("#desc").html("Thank you for participating in the study.")
        $("#task").html("")
        utterTask("Thank you for participating in the study.")
    }

}

function clear_all(){
    
    var id = window.setTimeout(function() {}, 0);
    while (id--) {
        window.clearTimeout(id); // will do nothing if no timeout with id is present
    }
    player.stop_all();

    try{
        if(highchart_bar) highchart_bar.chart.cancelSonify();

        if(highchart_line) highchart_line.chart.cancelSonify();

    } catch(error){
        console.log(error)
    }
    
}

function install_control(){
   $("a").on("click", function(){
       var _ind = parseInt($(this).attr("chart_id"))
       console.log(_ind)
       clear_all()
       controller(_ind)
   })
}

$("#select_task").on("change", function(){
    let val = $(this).val()

    if(val > 0){
        let obj = all_study_data.find(d => d.index == val)
        console.log(obj)
        controller(val)
    }
})


$("#chart_type").on("change", function () {
    let chart = $(this).val()
    // console.log(chart)
    if (chart == "bar") {
        bar = new Bar("chart_config", "config_list", "chart_viz");
    }
    else if (chart == "scatter") {
        scatter = new Scatter("chart_config", "config_list", "chart_viz");
    }
    else {
        line = new Line("chart_config", "config_list", "chart_viz");
    }
})

function initializeRecord(){

    streamDest = Howler.ctx.createMediaStreamDestination()
    Howler.masterGain.connect(streamDest) // connect masterGain to destination
    mediaRecorder = new MediaRecorder(streamDest.stream, {mimeType: 'video/webm\;codecs=vp9'})
    mediaRecorder.onstart = () => { console.log('Started recording Howl output...') }
    mediaRecorder.ondataavailable = (e) => { chunks.push(e.data) }
    mediaRecorder.onstop = () => {
      console.log("Done recording. Now let's try playback...")
      var blobUrl = URL.createObjectURL(new Blob(chunks,{type : 'video/webm\;codecs=vp9'}));
      console.log(blobUrl)
      $("#download_me").attr("href",blobUrl)
    }
  
  }

function hideMenu() {
    document.getElementById("contextMenu")
            .style.display = "none"
}

function rightClick(e) {
    e.preventDefault();

    if ( $("#contextMenu").css("display") == "block" )
        hideMenu();

    else{

        var menu = document.getElementById("contextMenu")

        menu.style.display = 'block';
        menu.style.left = e.pageX + "px";
        menu.style.top = e.pageY + "px";

        $("#menu").focus()
    }   
}

function toggleMenu(){
    // document.onclick = hideMenu;
    document.oncontextmenu = rightClick;

}
