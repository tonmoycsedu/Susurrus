var bar, scatter, line, single_source, highchart_bar, highchart_line;
var synth = window.speechSynthesis;
var all_study_data;

let streamDest = false;
var mediaRecorder;
let chunks = [];

$(document).ready(function() {
    get_data()
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
            populateMenu(all_study_data)
        },
        error: function(error){
            console.log("error !!!!");
        }
    });
}

function populateMenu(study_data){
    study_data.forEach(ele => {
        if((ele.index != 100 ) && (ele.index != -1)){
            let html = '<div class="item">'+ele.type+', '+ele.condition+', '+ele.data+ '<input _id="'+ele._id+'" type="number" value='+ele.index+'></input>';
            html += '<input _id="'+ele._id+'" type="text" value="';

            if('title' in ele)
                html += ele.title;

            html += '"></div>'
            $("#order").append(html)
        }
            
    });
    install_events()
}

function install_events(){
    $("input[type='number']").on("change", function(){
        let _id = $(this).attr("_id")
        let val = parseInt($(this).val())
        let obj = all_study_data.find(d => d._id == _id)
        obj.index = parseInt(val)
        console.log(_id, val)
        $.ajax({
            url: '/update_study_data',
            data: JSON.stringify({_id: _id, attr:'index', index: val}),
            type: 'POST',
            success: function(res){
                alert("updated!")
            },
            error: function(error){
                console.log("error !!!!");
            }
        });
        
    });

    $("input[type='text']").on("change", function(){
        let _id = $(this).attr("_id")
        let val = $(this).val()
        
        $.ajax({
            url: '/update_study_data',
            data: JSON.stringify({_id: _id, attr:'title', index: val}),
            type: 'POST',
            success: function(res){
                alert("updated!")
            },
            error: function(error){
                console.log("error !!!!");
            }
        });
        
    });
}


