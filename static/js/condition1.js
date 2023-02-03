var currentChart = -1
var playbackRate = 1
var currentAudio = undefined
var currentVideo = undefined

///////////         Controls              ///////////
$( document ).ready(function() {
  selectChart(currentChart)
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
  playbackRate = 1
  $("#chart_div").empty()
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
      $("img").hide()

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
      $("img").hide()
      break;
    case 1:
      // hide_canvas_buttons()
      $("#chart_title").html("Example 2: Multi line chart")
      $("video").hide()
      $("#multi").show()
      $("img").hide()
      break;

    case 2:
      $("#chart_title").html("Test 1: Stock Price (2010-2018)")
      init_questions(index)
      $("video").hide()
      $("img").hide()
      break;

    case 3:
      $("#chart_title").html("Test 2: Stock Price Comparison (2010-2018)")
      $("video").hide()
      $("img").hide()
      init_questions(index)
      break;
      // $('#next').prop('disabled', false);

    // case 4:
    //   // show_canvas_buttons()
    //   // imageSaved = true
    //   // show_time()
    //   $("#playButton").hide()
    //   $("#pauseButton").hide()
    //   $("#chart_title").html("Please provide your feedback")
    //   init_questions(index,true)
    //   // init_canvas()
    //   break;
      // $('#next').prop('disabled', true);
      // $('#next').prop('disabled', true);

    case 4:
      $("#chart_title").html("Example 3: Bar chart")
      $("video").hide()
      $("#bar").show()
      $("img").hide()
      break;

    case 5:
      $("#chart_title").html("Test 3: Bar chart")
      $("video").hide()
      $("img").hide()
      init_questions(index)
      break;

    ///newly added
    case 6:
      $("#chart_title").html("Example 4: Bar chart")
      $("video").hide()
      $("img").show()
      $("barImg").show()
      
      // $("#bar").show()
      break;

    case 7:
      $("#chart_title").html("Test 4: Bar chart")
      $("video").hide()
      $("img").hide()
      init_questions(index)
      break;

    // case 7:
    //   // hide_canvas_buttons()
    //   // imageSaved = true
    //   // show_interval()
    //   // plot_bar_chart([bar_data[0],bar_data[1]])
    //   $("#playButton").hide()
    //   $("#pauseButton").hide()
    //   $("#chart_title").html("Please provide your feedback")
    //   init_questions(index,true)
    //   break;

    // case 8:
    //   // show_canvas_buttons()
    //   // show_interval()
    //   // $("#chart_title").html("Test 5: Grouped bar chart")
    //   // init_canvas()
    //   // init_questions(index)
    //   $("#chart_title").html("Press next")
    //   break;

    case 8:
      $("#chart_title").html("Example 5: scatter plot")
      $("video").hide()
      $("#scatter").show()
      $("img").hide()
      break;

    case 9:
      $("#playButton").show()
      $("#pauseButton").show()
      $("#chart_title").html("Test 5: scatter plot")
      $("video").hide()
      $("img").hide()
      init_questions(index)
      break;

    case 10:
      // show_canvas_buttons()
      $("#chart_title").html("Test 6: Identify groups")
      $("#playButton").show()
      $("#pauseButton").show()
      $("video").hide()
      $("img").hide()
      init_questions(index)
      break;

    case 11:
        $('#next').show();
        $("#playButton").hide()
        $("#pauseButton").hide()
        $("#rateIncrease").hide()
        $("#rateDecrease").hide()
        $("#custom-seekbar").hide()
        $("#chart_title").html("Please provide your feedback")
        $("img").hide()
        init_questions(index,true)
        break;

    default:
      // alert("No chart available")
      hide_canvas_buttons()
      // $('#previous').hide();
      $('#next').hide();
      $("#playButton").hide()
      $("#pauseButton").hide()
      $("#rateIncrease").hide()
      $("#rateDecrease").hide()
      $("#custom-seekbar").hide()
      $("img").hide()
      $("#chart_title").html("Thank you for participating.")
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

  // $("#time_remaining").hide()
  // $("#time_remaining").html(30)
  switch(currentChart){
    case 0:
      currentAudio = single_line
      currentAudio.play()
      currentVideo = document.getElementById('single')
      currentVideo.play()
      break;
    case 1:

      currentAudio = multi_line
      currentAudio.play()
      currentVideo = document.getElementById('multi')
      currentVideo.play()
      break;

    case 2:
      currentAudio = single_line_v2
      currentAudio.play()
      currentVideo = undefined
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

    ////newly added
    case 6:
      currentAudio = bar_chart_v3
      currentAudio.play()
      currentVideo = undefined
      break;
    case 7:
      currentAudio = bar_chart_v4
      currentAudio.play()
      currentVideo = undefined
      break;
    // case 7:
    //   converted_data = bar_data[0]['values'].map(function(d,i){
    //                           return {'x':0,'value0':d,'value1':bar_data[1]['values'][i] }
    //                     })
    //   // converted_data2 = bar_data[1]['values'].map(function(d,i){ return {'x':0,'value'+i:d}})
    //   console.log(converted_data)
    //   play_line_sound(converted_data,true,interval)
    //   break;
    // case 8:
      // converted_data = bar_data[0]['values'].map(function(d,i){
      //                         return {'x':0,'value0':d,'value1':bar_data[1]['values'][i],'value2':bar_data[2]['values'][i] }
      //                   })
      // // converted_data2 = bar_data[1]['values'].map(function(d,i){ return {'x':0,'value'+i:d}})
      // console.log(converted_data)
      // play_line_sound(converted_data,true,interval)
      // break;
    case 8:
      currentAudio = scatter
        currentAudio.play()
        currentVideo = document.getElementById('scatter')
        currentVideo.play()
        break;

    case 9:
      currentAudio = scatter_v2
      currentAudio.play()
      currentVideo = undefined
      break;

    case 10:
      currentAudio = scatter_v3
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
    if(bar) {
      beep.play("half")
      msg.text = "bar 1";
      window.speechSynthesis.speak(msg);
    }

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
      if(bar) {
        beep.play("half")
        msg.text = "bar " + (time + 1);
        window.speechSynthesis.speak(msg);
      }
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
      curr_audio = false
      sn.stop()
      // mediaRecorder.stop()
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
    // mediaRecorder.stop()
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
  // mediaRecorder.start()
  line_audios[0].volume(line_volumes[0][0])
  line_audios[0].pos(-1,0,-0.5)
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
      curr_audio = false
      stop_current_sound()
      // mediaRecorder.stop()
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
    // mediaRecorder.stop()
    $("#chart_div").show()
    // clearInterval(myInterval1);
  };
}

function stop_current_sound(){

  single_line.stop()
  multi_line.stop()
  bar_chart.stop()
  scatter.stop()
  single_line_v2.stop()
  multi_line_v2.stop()
  bar_chart_v2.stop()
  bar_chart_v3.stop()
  bar_chart_v4.stop()
  scatter_v2.stop()
  scatter_v3.stop()
  beep.stop()
  $('video').each(function() {
      $(this).get(0).pause();
      $(this).get(0).currentTime = 0
  });
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
