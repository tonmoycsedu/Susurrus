var currentChart = -1
var playbackRate = 1
var currentAudio = undefined
var currentVideo = undefined
///////////         Controls              ///////////
$( document ).ready(function() {
  selectChart(currentChart)
  // get_data()
  // initializeRecord()
  // $("#player").width($("#center_div").width())
  // $("#player").height("100")

})
function init_user(){
  $("#headline").append("<h2>Welcome</h2>")
  $("#headline").append("<input id='user_name' type='text' style='margin-top:150px;margin-bottom:50px'"+
                          " class='form-control' placeholder='Please state your name'>")

  $("#headline").append('<button id="save_name" class="btn btn-outline-primary">Continue</button>')

}
$("body").on("click","#save_name",function(){
  var user_name = $("#user_name").val()
  if(!user_name){
    alert("please provide your name")
    return
  }

  $.ajax({
      url: '/save_user',
      data: JSON.stringify({user_name:user_name}),
      type: 'POST',
      success: function(res){
            // alert("!")
          currentChart += 1
          selectChart(currentChart)
      },
      error: function(error){
          console.log("error !!!!");
      }
  });

})
function selectChart(index){
  console.log(index)
  playbackRate = 1
  // $("#chart_div").empty()
  $("#chart_div1").empty()
  $("#time_remaining").hide()
  $("#headline").empty()
  imageSaved = true
  var converted_data;
  switch(index){
    case -1:
      $("#chart_title").hide()
      $('#previous').hide();
      $('#next').hide();
      $("#playButton").hide()
      $("#pauseButton").hide()
      $("#rateIncrease").hide()
      $("#rateDecrease").hide()
      $("#custom-seekbar").hide()
      $("#submit").hide()
      // hide_canvas_buttons()
      // hide_interval()

      init_user()
      break;

    case 0:
      $("#chart_title").show()
      $('#previous').show();
      $('#next').show();
      $("#playButton").show()
      $("#pauseButton").show()
      $("#chart_title").html("Example 1: Line chart")
      $("video").hide()
      $("#single").show()
      $("#rateIncrease").show()
      $("#rateDecrease").show()
      $("#custom-seekbar").show()
      break;

    case 1:
      $("#chart_title").html("Test 1: Line chart")
      init_questions(index+10,false,"#chart_div1")
      $("video").hide()
      break;

    case 2:
      $("#chart_title").html("Example 2: Multi line chart")
      $("video").hide()
      $("#multi").show()
      break;

    case 3:
      $("#chart_title").html("Test 2: Multi line chart")
      $("video").hide()
      init_questions(index+10,false,"#chart_div1")
      break;

    case 4:
      $("#chart_title").html("Example 3: Bar chart")
      $("video").hide()
      $("#bar").show()
      break;

    case 5:
      $("#chart_title").html("Test 3: Bar chart")
      $("video").hide()
      init_questions(index+10,false,"#chart_div1")
      break;

    case 6:
        $("#chart_title").html("Example 4: scatter plot")
        $("video").hide()
        $("#scatter").show()
        // init_questions(index)
        break;

    case 7:
        $("#playButton").show()
        $("#pauseButton").show()
        $("#chart_title").html("Test 4: scatter plot")
        $("video").hide()

        // $("#scatter").show()
        init_questions(index+10,false,"#chart_div1")
        break;

    case 8:
        $('#next').show();
        $("#playButton").hide()
        $("#pauseButton").hide()
        $("#rateIncrease").hide()
        $("#rateDecrease").hide()
        $("#custom-seekbar").hide()
        $("#chart_title").html("Please provide your feedback")
        init_questions(index,true,"#chart_div1")
        break;

    default:
      // alert("No chart available")
      // hide_canvas_buttons()
      // $('#previous').hide();
      $('#next').hide();
      $("#playButton").hide()
      $("#pauseButton").hide()
      $("#rateIncrease").hide()
      $("#rateDecrease").hide()
      $("#custom-seekbar").hide()
      $("#chart_title").html("Thank you for participating.")
      $("video").hide()

      break;
  }

}

$("#pauseButton").on("click",function(){
  stop_current_sound()
})

$("#rateIncrease").on("click",function(){
  if (playbackRate < 2.5) {
    playbackRate += 0.5
  }
  if (currentVideo != undefined) {
    currentVideo.playbackRate = playbackRate;
  }
  currentAudio.rate(playbackRate)
})

$("#rateDecrease").on("click",function(){
  if (playbackRate > 1) {
    playbackRate -= 0.5
  }
  if (currentVideo != undefined) {
    currentVideo.playbackRate = playbackRate;
  }
  currentAudio.rate(playbackRate)
})

$("#custom-seekbar").on("click", function(e){
  console.log("111")
    var offset = $(this).offset();
    var left = (e.pageX - offset.left);
    var totalWidth = $("#custom-seekbar").width();
    var percentage = ( left / totalWidth );
    var vidTime = currentAudio.duration() * percentage;
    currentAudio.seek(vidTime)
    if (currentVideo != undefined) {
      currentVideo.currentTime = vidTime;
    }
});

function updateWidth() {
  if (currentAudio != undefined) {
      var percentage = (currentAudio.seek() / currentAudio.duration() ) * 100;
      console.log(percentage)
      $("#custom-seekbar span").css("width", percentage+"%");
      if (percentage >= 98.5) {
        beep.play()
        setTimeout(function() {
          beep.stop()
          currentAudio.stop()
          currentAudio.play()
          if (currentVideo != undefined) {
            currentVideo.play()
          }
        }, 3* beep.duration() * 1000)
    }
  }
}

setInterval(() => {
  updateWidth()
}, 200);

$("#playButton").on("click",function(){
  
  stop_current_sound()
  switch(currentChart){
    case 0:
      currentAudio = single_line
      currentAudio.play()
      currentVideo = document.getElementById('single')
      currentVideo.play()
      break;

    case 1:

      currentAudio = single_line_v2
      currentAudio.play()
      currentVideo = undefined
      break;

    case 2:
        currentAudio = multi_line
        currentAudio.play()
        currentVideo = document.getElementById('multi')
        currentVideo.play()
        break;

    case 3:
      currentAudio = multi_line_v2
      currentAudio.play()
      currentVideo = undefined
      break;

    case 4:
      currentAudio = bar_chart
      currentAudio.play()
      currentVideo = document.getElementById('bar')
      currentVideo.play()
      break;

    case 5:
      currentAudio = bar_chart_v2
      currentAudio.play()
      currentVideo = undefined
      break;

    case 6:
        currentAudio = scatter
        currentAudio.play()
        currentVideo = document.getElementById('scatter')
        currentVideo.play()
        break;

    case 7:
      currentAudio = scatter_v2
      currentAudio.play()
      currentVideo = undefined
      break;

    default:
      currentVideo = undefined
      currentAudio = undefined
      alert("No chart available")
      break
  }

})

function stop_current_sound(){

  single_line.stop()
  multi_line.stop()
  bar_chart.stop()
  scatter.stop()
  single_line_v2.stop()
  multi_line_v2.stop()
  bar_chart_v2.stop()
  scatter_v2.stop()
  beep.stop()
  $('video').each(function() {
      $(this).get(0).pause();
      $(this).get(0).currentTime = 0
  });


}

///////        All Sounds - start with line charts     /////////

function play_line_sound(line_charts,bar=false,interval=3000){
  var time = 1;
  var posT = 0, posTimer;
  var totalLines = d3.keys(line_charts[0]).length - 1;
  var markers = [], paths = [];
  // mediaRecorder.start()
  for(i=0;i<totalLines;i++){
    line_audios[i].volume(line_charts[0]['value'+i])
    if(totalLines == 1)
      line_audios[i].pos(0.5,0,0.5)
    else
      line_audios[i].pos(spatialPos[i][0],spatialPos[i][1],0.5)

    // mediaRecorder.start()
    if(bar) beep.play("half")

    var firstAudio;
    // if(i == 2){
    //   console.log("bird")
    //   firstAudio = line_audios[i].play("first")

    // }
    // else
    firstAudio = line_audios[i].play()
    line_audios[0].on("end",firstEnd,firstAudio)
    markers.push("#marker_"+i)
    paths.push("#path_"+i)

  }

  myInterval = setInterval(myTimer, interval);

  function myTimer() {
    if(time < line_charts.length){
      if(bar) beep.play("half")
      for(i=0;i<totalLines;i++){
        line_audios[i].volume(line_charts[time]['value'+i])
      }
      if(!bar)
        transition(markers,paths,time-1)
      if(currentChart == 1)
        if(Math.abs(line_charts[time].value0-line_charts[time].value1) < 0.05){
          console.log("intersection")
          posTimer = setInterval(changePos, 50);
        }
      time += 1

    }
    else firstEnd()

  }
  //on sound end clear the timer
  function firstEnd() {
    console.log("fired!!")
    stop_current_sound()
    // mediaRecorder.stop()
    // mediaRecorder.stop()
    curr_audio = false
    clearInterval(myInterval);
    $("#chart_div").show()
    // clearInterval(myInterval1);
  };

  function changePos(){
    console.log("change pos",posT)
    if((1-posT) < -1){
      console.log("clear")
      clearInterval(posTimer)

    }
    else{
      line_audios[0].pos(-1+posT,0,0.5)
      line_audios[1].pos(1-posT,0,0.5)
      posT += 0.05

    }

  }
}

function play_line_sound1(sn,sprite=""){
  // console.log("clicked line chart button",line_audios[0].duration())
  curr_audio = "line"
  var time = 1;
  update_time(clipTime)
  // cricket.volume(line_volumes[0][0])
  // var mainAudio = line_audios[0].play("full")
  // mediaRecorder.start()
  var mainAudio = sn.play()
  sn.volume(line_volumes[0][0])
  sn.on("end",mainEnd,mainAudio)
  // transition(["#marker"],["#singleLine"],0,1000)
  myInterval = setInterval(myTimer, spriteTime*1000);

  function myTimer() {
    // transition(["#marker"],["#singleLine"],0,1000,divisions)
    sn.volume(line_volumes[0][time])
    update_time(clipTime-time)
    time += 1
    if(time*spriteTime > clipTime){
      console.log("stopped!")
      // mediaRecorder.stop()
      curr_audio = false
      sn.stop()
      clearInterval(myInterval);
      $("#chart_div").show()
      // clearInterval(myInterval1);

    }
  }
  //on sound end clear the timer
  function mainEnd() {
    console.log("fired!!")
    curr_audio = false
    sn.stop()
    clearInterval(myInterval);
    $("#chart_div").show()
    // clearInterval(myInterval1);
  };
}

function doSetTimeout(i,val) {
  if(i == cat_data.length) return;
  console.log(val)
  // setTimeout(function() {
    rain.play()
    if(val == 1) val= 0.5
    rain.volume(val+0.05)
    // rain.seek(50000)
  // }, 1000);
}



function play_line_sound2(){
  console.log("clicked line chart button",line_audios[1].duration())
  curr_audio = "line_multi"
  update_time(clipTime)
  var time = 1;

  line_audios[0].volume(line_volumes[0][0])
  line_audios[0].pos(-1,0,-0.5)
  // mediaRecorder.start()
  var firstAudio = line_audios[0].play()
  line_audios[0].on("end",firstEnd,firstAudio)

  line_audios[1].volume(line_volumes[1][0])
  line_audios[1].pos(1,0,-0.5)
  var secondAudio = line_audios[1].play()
  // line_audios[1].on("end",firstEnd,secondAudio)

  myInterval = setInterval(myTimer, spriteTime*1000);


  function myTimer() {
    line_audios[0].volume(line_volumes[0][time])
    line_audios[1].volume(line_volumes[1][time])
    update_time(clipTime-time)
    time += 1
    if(time*spriteTime > clipTime){
      console.log("stopped!")
      // mediaRecorder.stop()
      curr_audio = false
      stop_current_sound()
      clearInterval(myInterval);
      $("#chart_div").show()
      // clearInterval(myInterval1);

    }
  }
  //on sound end clear the timer
  function firstEnd() {
    console.log("fired!!")
    curr_audio = false
    clearInterval(myInterval);
    $("#chart_div").show()
    // clearInterval(myInterval1);
  };
}
$("#next").on("click",function(){
  if(!imageSaved){
    alert("Want to move to the next test?")
    imageSaved = true
    return;
  }
  else{
    currentChart += 1
    stop_current_sound()
    selectChart(currentChart)
  }

})
$("#previous").on("click",function(){
  currentChart -= 1
  stop_current_sound()
  selectChart(currentChart)
})
