var bar, scatter, line;
var synth = window.speechSynthesis;

let streamDest = false;
var mediaRecorder;
let chunks = [];

$( document ).ready(function() {
    create_chart_type_dropdown ();
    create_mixer()
    initializeRecord();
});

function create_chart_type_dropdown () {
    CONFIG['chart_type'].forEach(function(c){
        $("#"+CONFIG['chart_type_select_id']).append(
            '<option value="'+c+'">'+c+'</option>'
        )
    })
}

function create_mixer (){
    CONFIG['sounds'].forEach(function(sound){
        let html_string = 
            '<div class="item">'+
                '<div class="ui blue horizontal label">' +
                    sound +
                    // '<i class="delete icon"></i>' +
                '</div>'+
                '<button id="playpause+'+sound+'" class="ui mini icon button playpause"><i class="play icon"></i></button>'+
                '<input id="volume+'+sound+'" type="range" class="slider" name="vol" min="0" max="100" value="10">'+
                '<input type="checkbox">'+
            '</div>'

        $("#audio_mixer").append(html_string)

    }) 
    install_events()
}

function install_events(){
    $(".playpause").on("click", function() {
        let div_id = $(this).attr("id")
        let song_name = div_id.split("+")[1]
        player.play_pause_sound(song_name);

        let curElement = $(this).children("i");

        if(curElement.hasClass("play"))
            curElement.removeClass("play").addClass("stop");
        else
            curElement.removeClass("stop").addClass("play");
    })
    $(".slider").on("change", function() {
        let slider_id = $(this).attr("id")
        let song_name = slider_id.split("+")[1]
        let volume = $(this).val();
        console.log(song_name, volume)
        player.set_volume(song_name, volume);
    })
}

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