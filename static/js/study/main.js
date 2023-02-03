var bar, scatter, line, single_source, highchart_bar, highchart_line;
var synth = window.speechSynthesis;
var all_study_data;

let streamDest = false;
var mediaRecorder;
let chunks = [];
var task = 0;
var linear_task = [];
var linear_index = 0;
// var task_order = {
//     1: [0, 1,2,3,4,5,6, 51, 18,19,17,20, 52, 21,22,23,25, 53, 26,27,28,29, 50, 7,8,9, 52, 11,12,13,14, 75],
//     2: [0, 7,8,9, 52, 11,12,13,14, 50, 1,2,3,4,5,6, 51, 18,19,17,20, 52, 21,22,23,25, 53, 26,27,28,29, 75],
//     3: [0, 1,2,3,4,5,6, 51, 21,22,23,25, 53, 18,19,17,20, 52, 26,27,28,29, 50, 11,12,13,14, 53, 7,8,9, 75],
//     4: [0, 11,12,13,14, 53, 7,8,9, 50, 1,2,3,4,5,6, 51, 21,22,23,25, 53, 18,19,17,20, 52, 26,27,28,29, 75],
// };

var ctrlDown = false,
    ctrlKey = 76,
    cmdKey = 76;

var ques_num = 0;

var title1 = "In this study, we will represent Spreadsheet data,"+
 " such as students’ scores, stock prices, point clouds, with sounds."+
 " The sounds can be controlled using the buttons listed below."+
 " Please review the buttons and then click the Next button to continue."

var title6= "Thank you for completing the first part of the study. Please press RIGHT ARROW to continue.";

var saved_html, curr_html;

$(document).ready(function() {
    
    $("#task_desc").append(title1)
    get_data()
    install_control();
});

function get_data(){
    $.ajax({
        url: '/get_all_study_data',
        success: function(res){
            // console.log(res)
            all_study_data = res.res.sort((a, b) => (a.index > b.index) ? 1 : -1)
            console.log(all_study_data)
            populateMenu()
            // controller(task)
        },
        error: function(error){
            console.log("error !!!!");
        }
    });
}

function populateMenu(){
    console.log(task_order[order])
    task_order[order].forEach(function (group, k) {
        if (group.options.length > 1) {
            $("#control_list").append("<li tabindex='0'>"+group['menu_title']+"<ul id='"+group.name+"'></ul></li>")
            group.options.forEach((t, i) => {
                ele = all_study_data.find(d => d.index == t)
                if (typeof ele !== 'undefined'){
                    linear_task.push(t);
                    $("#"+group.name).append("<li><a id='link_"+ t+"' href='#'>"+
                        " Audio"+(i+1)+": "+ele.title+"</a></li>")
                }
            });
        }
        else{
            if (group.name == "group0"){
                linear_task.push(0);
                $("#control_list").append("<li><a id='link_0' href='#'>" + group['menu_title'] +"</a></li>");
            }
            else
                $("#control_list").append("<li tabindex='0'>" + group['menu_title'] + "</li>")
        }
    })
    console.log(linear_task)
    // 
}

function change_task() {
    clear_all()
    controller(task)
    // set_title()
    $("#main_div").show();
    // if(task == 0){
    //     $("#instruction").focus();
    // }
    // else   
    $("#task").focus();
}
$("#next").on("click", function () {
    console.log("Document catch Ctrl+right");
    // clear_all()
    if (linear_index < linear_task.length - 1){

        linear_index += 1
        update_prev_name()
        task = linear_task[linear_index];
        console.log(task)
        update_new_name()
        change_task()
    }
})

$("#prev").on("click", function () {
    console.log("Document catch Ctrl+left");
    clear_all()
    if (linear_index >= 1) {
        linear_index -= 1
        update_prev_name()
        task = linear_task[linear_index];
        console.log(task)
        update_new_name()
        change_task()
    }
})

function update_prev_name(){
    saved_html = $("#link_" + task).html().split("-")
    if(saved_html.length == 2)
        $("#link_" + task).html(saved_html[1])
    else if(saved_html.length == 1)
        $("#link_" + task).html(saved_html[0])
}
function update_new_name(){
    saved_html = $("#link_" + task).html()
    if (saved_html) $("#link_" + task).html("Current page-"+saved_html)
}

$("body").on("click", "a", function () {
    var id = $(this).attr("id")
    update_prev_name()
    task = parseInt(id.split("_")[1]);
    linear_index = linear_task.indexOf(task);
    update_new_name()
    change_task()
})

$("body").on("change", ".qa_opt", function(){
    var id = $(this).attr("id")
    $.ajax({
        url: '/save_answer',
        data: JSON.stringify({ ans_id: id }),
        type: 'POST',
        success: function (res) {
            console.log(res)
        },
        error: function (error) {
            console.log("error !!!!");
        }
    });
})

function populateSUS(condition){
    sus = ["I think that I would like to use this system frequently.",
            "I found the system unnecessarily complex.",
            "I thought the system was easy to use.",
            "I think that I would need the support of a technical person to be able to use this system.",
            "I found the various functions in this system were well integrated.",
            "I thought there was too much inconsistency in this system.",
            "I would imagine that most people would learn to use this system very quickly.",
            "I found the system very cumbersome to use.",
            "I felt very confident using the system.",
            "I needed to learn a lot of things before I could get going with this system."
        ]
    $("#QA").empty();
    sus.forEach(function(s, i) {
        $("#QA").append('<p class="large">'+ s + '</p>');
        ["Strongly disagree", "Somewhat disagree", "Neutral", "Somewhat agree", "Strongly agree" ].forEach(function(o, j){
            $("#QA").append('<input class="qa_opt" type="radio"' + ' id="sus-' + condition + '-' + i + '-' + j + '" name="group-' + i + '">' +
                '<label for="sus-' + condition + '-' + i + '-' + j + '" class="medium"> ' + o + '</label>')
        })
        $("#QA").append("</br>")
        
    })
}

function populateQA(QA){
    $("#QA").empty()
    
    if("questions" in QA ){
        $("#QA").append("<h1>Questions</h1>")
        QA['questions'].forEach(function(q, i){
            $("#QA").append('<p class="large">' + (i+1) + '. ' + q + '</p>')
            QA['answers'][i].forEach(function(a, j){
                $("#QA")
                    .append('<input class="qa_opt" type="radio"' + ' id="Cid-' + QA['index'] + '-' + i + '-' + j +'" name="group-'+i+'">' +
                    '<label for="Cid-' + QA['index'] + '-' + i + '-' + j +'" class="medium"> ' + a + '</label><br/>')
            })
            $("#QA").append("</br>")
        })
    }
}

function controller(ind){
    var obj = all_study_data.find(d => d.index == ind)
    populateQA({})
    $("#task").empty();
    $("#task_desc").empty();
    if (typeof obj !== 'undefined'){
        $("body").off("keyup");
        $("#task").append("You are in a task. Please read the prompt below.")
        showDesc(obj)
        populateQA(obj)
        // $("#task").attr("tabindex", -1)
        // $("#task").focus()
        
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
    else{
        $("#task").html("Welcome to Data Sonification Study. Please read below.")
        $("#task_desc").html(title1);
    }
}

function showDesc(obj){
    if ("title" in obj) {
        $("#task_desc").append(obj.title+'. ')

    }
    if("description" in obj){
        $("#task_desc").append( obj.description)

    }
}

function utterTask(title){
    // let text = title
    // // let text = ""
    // var utterThis = new SpeechSynthesisUtterance(text);
    // utterThis.rate = 0.8;
    // utterThis.volume = 0.5;
    // synth.speak(utterThis);
}

function clear_all(){

    $(".sound_button").off()
    
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
    ctrlDown = false;
    $(document).keydown(function(e) {
        if (e.keyCode == ctrlKey || e.keyCode == cmdKey) ctrlDown = true;
    }).keyup(function(e) {
        if (e.keyCode == ctrlKey || e.keyCode == cmdKey) ctrlDown = false;
    });

    // Document Ctrl + C/V 
    // $(document).keydown(function(e) {  
    //     if (e.keyCode == 77){
    //         console.log("menu")
    //         $("#link_"+task).focus()
    //     } 
    // });
    $("#menu_control").on("click", function(e) {
        $("#link_" + task).focus()
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
