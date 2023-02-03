
function synthText(time="1 minute"){

  return "You will now here a"+time+" audio clip."
        // +" The sound will be played in loop."+
        //   " You can press Space button to stop the sound."+
        //   " Press 0 to 9 to listen part of the data"

}


$("#line_button1").on("click",function(){
  
  console.log("clicked line chart button")
  // console.log(line_data)
  var utterThis = new SpeechSynthesisUtterance(synthText());
  synth.speak(utterThis);
  utterThis.onend = function(event) {
    console.log("on end")
    play_line_sound1()
  }
  
})

// $(".cat_data").on("click", function(){

//   data = cat_data.map(function(d){return d.value})
  
//   min = d3.min(data)
//   max = d3.max(data)
//   console.log(min,max)

//   for(i=0;i<sounds.length;i++){
//     d = data[i]
//     val = (+d - min)/(max-min)
//     console.log(val)
//     sounds[i].volume(val+0.05)
//     sounds[i].pos(cat_data[i].posX,cat_data[i].posY,-0.5)
//     sounds[i].play()
         
//   }
  
// });
$("#bar_button1").on("click", function(){

  data = cat_data.map(function(d){return d.value})

  min = d3.min(data)
  max = d3.max(data)
  val = (+data[0] - min)/(max-min)
  rain.play()
  rain.volume(val+0.05)
  i = 1

  //on sound end clear the timer
  rain.on('end', function() {
    d = data[i]
    val = (+d - min)/(max-min)
    // console.log(val)
    doSetTimeout(i,val);
    i += 1
    
  });

})
function play_bar_sound(){
  curr_audio = "bar", bar_playing = true,

  data = cat_data.map(function(d){return d.value})
  min = d3.min(data)
  max = d3.max(data)

  for(i=0;i<sounds.length;i++){
    d = data[i]
    val = (+d/max)-0.1
    console.log(val)
    if(val > 0.8) sounds[i].volume(1)
    else sounds[i].volume(val)

    sounds[i].pos(cat_data[i].posX,cat_data[i].posY,-0.5)
    sounds[i].play("clip")     
  }

  sounds[2].once("end",function(){
    setTimeout(function(){ play_bar_sound()}, 1000);
    
  })
}
$("#bar_button3").on("click", function(){
  var utterThis = new SpeechSynthesisUtterance(synthText("30 seconds"));
  synth.speak(utterThis);
  utterThis.onend = function(event) {
    console.log("on end")
    play_bar_sound()
    
  }

  
  
});
$("#scatter_button").on("click",function(){
  $.ajax({
      url: '/clusters',
      data: JSON.stringify({data:scatter_data}),
      type: 'POST',
      success: function(res){
          console.log(res)
          play_scatter_sound(res.cluster_centers)
          
      },
      error: function(error){
          console.log("error !!!!");
      }
  });
})

$(".pause").on("click",function(){
  // $( "#animateCircle" ).stop();
  stop_current_sound()
  curr_audio = false;

    
})

$("#next").on("click",function(){
  // if(!imageSaved){
  //   alert("Want to move to the next test?")
  //   imageSaved = true
  //   return;
  // } 
  currentChart += 1
  selectChart(currentChart)
})
$("#previous").on("click",function(){
  currentChart -= 1
  selectChart(currentChart)
})

$(document).on("keydown",function(e){
  
  k =+ e.which
  // console.log(k)
  if(k == 32 && curr_audio){
    e.preventDefault()
    console.log("space clicked!!")
    stop_current_sound()
    clearInterval(myInterval);
    synth.speak(new SpeechSynthesisUtterance("You have stopped the sound. Press 0 to 9 to listen part of the data"));

  }
  if(k >= 48 && k <= 57 && curr_audio){
    e.preventDefault()
    console.log(k-48)
    d = k-48
    if(curr_audio == "line" || curr_audio == "line_multi"){
      var step = Math.floor(line_data.length/divisions)
      var selected = line_data.slice(d*step,d*step+step)
      // console.log(selected.length,line_data.length,step)
      var utterThis = new SpeechSynthesisUtterance("Start time "+selected[0].date+". End time "+selected[selected.length-1].date);
      synth.speak(utterThis);
      utterThis.onend = function(event) {
        console.log("on end")
        
        var spriteSound1 = line_audios[0].play("d"+d.toString())
        line_audios[0].volume(line_volumes[0][d],spriteSound1)
        if(curr_audio == "line_multi"){
          var spriteSound2 = line_audios[1].play("d"+d.toString())
          line_audios[1].volume(line_volumes[1][d],spriteSound2)
        }

      }

    }
    else if(curr_audio == "bar" && d<sounds.length){
      // if(bar_playing.length == sounds.length) bar_playing = []
      // else if(bar_playing.indexOf(d) == -1) bar_playing.push(d)
      var c = [];
      for(i=0;i<sounds.length;i++) {
        if(sounds[i].playing()) c.push(i)
        sounds[i].stop()
      }
      console.log(c)
      if(bar_playing || (c.length == sounds.length)){
        var text = "The value is: "+ cat_data[d].x+" , "+cat_data[d].value.toString()+". ";
        var utterThis = new SpeechSynthesisUtterance(text);
        synth.speak(utterThis);
        utterThis.onend = function(event) {
          sounds[d].play("clip")
        }
        bar_playing = false

      }
      else {
        var text = "The values are: ";
        c.forEach(function(b){
          text += cat_data[b].x+" , "+cat_data[b].value.toString()+". "
        })
        text += cat_data[d].x+" , "+cat_data[d].value.toString()+". "

        console.log(text)
        var utterThis = new SpeechSynthesisUtterance(text);
        synth.speak(utterThis);
        utterThis.onend = function(event) {
          c.forEach(function(b){
            sounds[b].play("clip")
          })
          sounds[d].play("clip")
        }
        
      } 

    }
    
    // full_rain.on("end",spriteEnd,spriteSound)
  }
})

function spriteEnd(){
  synth.speak(new SpeechSynthesisUtterance("Do you want to play again?"));

}