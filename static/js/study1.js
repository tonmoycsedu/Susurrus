
///////////         Controls              ///////////
$( document ).ready(function() {
  get_data()
  initializeRecord()
  // $("#player").width($("#center_div").width())
  // $("#player").height("100")

})

function timerInterval(time){
  if(time <= 0) return;
  else if(curr_audio){
    $("#time_remaining").html("Time Remaining: "+time)
    time -= 1
    setTimeout(()=>{timerInterval(time)},1000)

  }
}

function selectChart(index){
  console.log(index)
  $("#chart_div").empty()
  $("#chart_div1").empty()
  $("#time_remaining").hide()
  imageSaved = false
  var converted_data;
  switch(index){
    case -1:
      $("#chart_title").hide()
      $('#previous').hide();
      $('#next').hide();
      $("#playButton").hide()
      $("#pauseButton").hide()
      hide_canvas_buttons()
      hide_interval()

      init_user()
      break;
    case 0:
      $("#chart_title").show()
      $('#previous').show();
      $('#next').show();
      $("#playButton").show()
      $("#pauseButton").show()
      hide_canvas_buttons()
      imageSaved = true

      converted_data = ml_data.map(function(d){return { date: d.date, value0:d.value0}})
      plot_line_chart(converted_data,"Example 1: line chart","date",false)
      break;
    case 1:
      hide_canvas_buttons()
      imageSaved = true
      // $('#previous').prop('disabled', false);
      // converted_data = ml_data.map(function(d){return { date: d.date, value:d.value}})
      plot_line_chart(ml_data,"Example 2: line chart","date",false)
      break;

    case 2:
      show_canvas_buttons()
      // show_time()
      $("#chart_title").html("Test 1: Stock Price (2010-2018)")

      init_canvas()
      init_questions(index)
      $("#time_remaining").show()
      break;
      // $('#next').prop('disabled', false);
    case 3:
      show_canvas_buttons()
      // show_time()
      $("#chart_title").html("Test 2: Stock Price Comparison (2010-2018)")
      init_canvas()
      init_questions(index)

      $("#time_remaining").show()
      break;
      // $('#next').prop('disabled', false);

    case 4:
      // show_canvas_buttons()
      imageSaved = true
      // show_time()
      $("#chart_title").html("Test 3")
      // init_canvas()
      break;
      // $('#next').prop('disabled', true);
      // $('#next').prop('disabled', true);

    case 5:
      hide_canvas_buttons()
      imageSaved = true
      hide_time()
      plot_bar_chart([bar_data[1]])
      break;

    case 6:
      show_canvas_buttons()
      hide_interval()
      $("#chart_title").html("Test 4: Bar chart")
      init_canvas()
      init_questions(index)
      break;

    case 7:
      hide_canvas_buttons()
      imageSaved = true
      show_interval()
      plot_bar_chart([bar_data[0],bar_data[1]])
      break;

    case 8:
      show_canvas_buttons()
      show_interval()
      $("#chart_title").html("Test 5: Grouped bar chart")
      init_canvas()
      init_questions(index)
      break;

    case 9:
      hide_canvas_buttons()
      imageSaved = true
      hide_interval()
      scatter_plot("scatter_data1.csv")
      break;

    case 10:
      show_canvas_buttons()
      $("#chart_title").html("Test 6: Identify groups")
      init_canvas()
      init_questions(index)
      scatter_plot("scatter_data.csv",false)
      break;

    case 11:
      show_canvas_buttons()
      $("#chart_title").html("Test 7: Identify groups")
      init_canvas()
      init_questions(index)
      scatter_plot("line_data1.csv",false)
      break;

    default:
      // alert("No chart available")
      hide_canvas_buttons()
      $('#previous').hide();
      $('#next').hide();
      $("#playButton").hide()
      $("#pauseButton").hide()
      $("#chart_title").html("Thank you for participating.")
      break;
  }

}
$("#playButton").on("click",function(){
  console.log(currentChart)
  stop_current_sound()

  // $("#time_remaining").hide()
  // $("#time_remaining").html(30)
  switch(currentChart){
    case 0:
      play_line_sound(ml_data.map(function(d){return { date: d.date, value0:d.value0}}))
      //
      break;
    case 1:

      play_line_sound(ml_data)
      break;
    case 2:
      play_line_sound1(line_audios[0])
      $("#time_remaining").show()
      timerInterval(30);
      break;
    case 3:
      play_line_sound2()
      $("#time_remaining").show()
      timerInterval(30);
      // myInterval1 = setInterval(timerInterval, 900);
      // bar_chart()
      break;
    case 5:
      converted_data = bar_data[0]['values'].map(function(d){ return {'x':0,'value0':d}})
      console.log(converted_data)
      play_line_sound(converted_data,true,6000)
      break;
    case 6:
      converted_data = bar_data[1]['values'].map(function(d){ return {'x':0,'value0':d}})
      console.log(converted_data)
      play_line_sound(converted_data,true,6000)
      break;
    case 7:
      converted_data = bar_data[0]['values'].map(function(d,i){
                              return {'x':0,'value0':d,'value1':bar_data[1]['values'][i] }
                        })
      // converted_data2 = bar_data[1]['values'].map(function(d,i){ return {'x':0,'value'+i:d}})
      console.log(converted_data)
      play_line_sound(converted_data,true,interval)
      break;
    case 8:
      converted_data = bar_data[0]['values'].map(function(d,i){
                              return {'x':0,'value0':d,'value1':bar_data[1]['values'][i],'value2':bar_data[2]['values'][i] }
                        })
      // converted_data2 = bar_data[1]['values'].map(function(d,i){ return {'x':0,'value'+i:d}})
      console.log(converted_data)
      play_line_sound(converted_data,true,interval)
      break;
    case 9:
      scatter_sound(scatter_data,3)
      break;

    case 10:
      scatter_sound(scatter_data,1,0.8)
      break;

    case 11:
      scatter_sound(scatter_data,2)
      break;

    default:
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
  mediaRecorder.start()
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
    mediaRecorder.stop()
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
