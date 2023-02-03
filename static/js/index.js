
var line_data, line_volumes=[], scatter_data,timer,bar_playing,
    cat_data = [{"x":"Student1","value":8,"posX":-1,"posY":0},
                {"x":"Student2","value":16,"posX":1,"posY":0},
                {"x":"Student3","value":30,"posX":0,"posY":0}];
                // ,{"x":"rain","value":20,"posX":0.5,"posY":-0.5}];
var ml_data = [{"date":0, "value0":0.1,"value1":0.9},
               {"date":1, "value0":0.153,"value1":0.95},
               {"date":2, "value0":0.224,"value1":0.65},
               {"date":3, "value0":0.310,"value1":0.70},
               {"date":4, "value0":0.120,"value1":0.63},
               {"date":5, "value0":0.422,"value1":0.6},
               {"date":6, "value0":0.45,"value1":0.43},
               {"date":7, "value0":0.633,"value1":0.41},
               {"date":8, "value0":0.687,"value1":0.40},
               {"date":9, "value0":0.743,"value1":0.40},
               {"date":10, "value0":0.752,"value1":0.22}];

var bar_data = [{"x":"Math", "values":[.5,.6,.7,.9,.56]},
                 {"x":"Physics", "values":[.67,.7,.35,.75,.80]},
                 {"x":"Chemistry", "values":[.65,.68,.92,.75,.85]}];

var spatialPos = [[-1,0,0.5],[1,0,0.5],[0.5,0,0.5]]

var curr_audio = false, myInterval;

var divisions = 12, clipTime = 30, spriteTime= clipTime/divisions; //divide the whole data in 20 divisions, probably best to
                 //have this as a parameter

var interval = 10000, myInterval;

var synth = window.speechSynthesis;

var currentChart = -1

// connect MediaStreamDestination to Howler.masterGain
let streamDest = false;

// // set up media recorder to record output
let chunks = [];
var mediaRecorder;
var imageSaved = false;


function get_data(){

  $.get("/get_csv/", {
      fileName : "tsla_gm.csv",
    },
    function(res) {
      // console.log(res)
      line_data = res.data.map(function(d){return { date : d.Date, value : d.Close_left, value1:d.Close_right}})
      console.log(line_data)
      discretizeVolume()
      selectChart(currentChart)
  });
}



function init_user(){
  $("#chart_div").append("<h2>Welcome</h2>")
  $("#chart_div").append("<input id='user_name' type='text' style='margin-top:150px;margin-bottom:50px'"+
                          " class='form-control' placeholder='Please state your name'>")

  $("#chart_div").append('<button id="save_name" class="btn btn-outline-primary">Continue</button>')

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

function normalize(data,min=false,max=false){
  // max = Math.max.apply(Math, data)
  // min = Math.min.apply(Math, data)
  console.log(min,max)
  normalized_data = []
  for(i=0;i<data.length;i++){
    normalized_data.push((data[i]-min)/(max-min))
  }
  return normalized_data

}
function find_average(start,end,data){
  sum = 0
  for(i=start;i<end;i++){
    sum += data[i]
  }
  return sum/(end-start)
}

function discretizeVolume(){
  line_volumes.push([])
  line_volumes.push([])
  var start,end;
  var data1 = line_data.map(function(d){return +d.value})
  var data2 = line_data.map(function(d){return +d.value1})
  var max = Math.max.apply(Math, data1)
  var min = Math.min.apply(Math, data2)
  var normalized_data = normalize(data1,min,max) //Normalize line data
  var normalized_data1 = normalize(data2,min,max) //Normalize line data
  var step = Math.floor(normalized_data.length/divisions)
  for(start=0; start<normalized_data.length; start += step){
    end = start+step
    if(end > normalized_data.length)
      end = normalized_data.length
    // console.log(start,end)
    v = find_average(start,end,normalized_data)
    v1 = find_average(start,end,normalized_data1)
    line_volumes[0].push(v+0.1)
    line_volumes[1].push(v1)
  }
  console.log(line_volumes)

}


function scatter_sound(data,k,vol=0.5){
  $.ajax({
      url: '/clusters',
      data: JSON.stringify({data:data,k:k}),
      type: 'POST',
      success: function(res){
          // console.log(res)
          play_scatter_sound(res.cluster_centers,vol)

      },
      error: function(error){
          console.log("error !!!!");
      }
  });
}

function play_scatter_sound(centers,vol=0.5){
  var x = 0, y=0, diffX,diffY;
  var i=0,time=0,changeFlag=true;
  cricket.pos(0,0,0.5)
  cricket.volume(vol)
  // mediaRecorder.start()
  beep.play("half")
  cricket.play()
  var timer = setInterval(mySound, 100);
  function mySound(){

    if(changeFlag){
      diffX = centers[i][0] - x
      diffY = centers[i][1] - y

      if(Math.abs(diffX) < 0.01 && Math.abs(diffY) < 0.01){
        x = centers[i][0]
        y = centers[i][1]
        // cricket.pos(x,y,-0.5)
        i += 1
        time = 0

        changeFlag = false
        console.log(x,y)
        if(currentChart == 9)
          $("#chart_div").append("<p>x: "+x.toFixed(2)+", y: "+y.toFixed(2)+"</p>")
        // cricket.volume(vol)
      }
      else if(Math.abs(diffX) < 0.01) {
        y += diffY/10
      }
      else
        x += diffX/10
      // time += 1
      cricket.pos(x,y,0.5)

    }
    else if(time > 50){
      if(i == centers.length){
        clearInterval(timer)
        cricket.stop()
        // mediaRecorder.stop()
        $("#chart_div").show()
        return
      }
      beep.play("half")
      changeFlag = true

    }
    else
      time += 1

    // console.log(time,i,x,y,diffX,diffY)
  }
}

function stop_current_sound(){

  line_audios.forEach(function(a){
    a.stop()
  });
  sounds.forEach(function(sound){
    sound.stop()
  })
  beep.stop()
  // cricket.forEach(function(cricket){
  cricket.stop()
  clearInterval(myInterval);
  curr_audio = false
  // $("#time_remaining").hide();
  // clearInterval(myInterval1);

}

function hide_time(){
    $("#time_label").hide()
    $("#time_value").hide()
}
function show_time(){
    $("#time_label").show()
    $("#time_value").show()
}
function update_time(t){
    $("#time_value").html(t)
}

function hide_interval(){
    $("#interval_label").hide()
    $("#interval").hide()
}

function show_interval(){
    $("#interval_label").show()
    $("#interval").show()
}
$("#interval").on("change",function(){
  interval =+ $(this).val()*1000
  console.log(interval)
})
