class Line {
    /*
    ----------------- Constructor for the class. intialize variables. --------------------
    */
    constructor (div_id, list_id, svg_div_id, data, interval=20) {
        this.div_id = div_id;
        this.list_id = list_id;
        this.svg_div_id = svg_div_id;
        this.index = 0;
        this.data = data;
        this.playing = false;
        this.binned_data = [];
        this.attrs = [];
        this.sounds = {};
        this.random_max = 2000;
        this.interval = interval;
        this.selected = [];
        this.timeouts = {};
        player.set_volume(CONFIG["beep_sound"], 10);
        this.install_events();
        this.load_data();
    }

    /*
    ---------------------- Utility Functions -------------------------
    */
    
    getInterval(self) {
        // console.log(self.random_max)
        return Math.random() * self.random_max;
    }

    normalize(data){
        let max = d3.max(data, d =>  d3.max(Object.values(d)))
        let min = d3.min(data, d =>  d3.min(Object.values(d)))
        console.log(min,max)
        let normalized_data = []
        data.forEach(function(d){
            let obj = {}
            for (let key in d) {
                obj[key] = (d[key] - min)/(max-min) 
            }
            normalized_data.push(obj)
        })
          
        return normalized_data 
    }

    calculate_average(start,end,data){
        let sum = {}
        for(let i=start; i<end; i++){
            for (let key in data[i]) {
                if( key in sum)
                    sum[key] += data[i][key]
                else
                    sum[key] = data[i][key]
            }
        }
        let obj = {};
        for (let key in sum){
            let v = sum[key]/(end-start)
            if(v < 0.05)
                v = 0.05;

            else if(v >= 0.8)
                v = 0.8;

            // this.sounds[key].volumes.push(v)
            obj[key] = v;
        }
        return obj
    }

    discretize_data(data){
        let step = Math.floor(data.length/CONFIG['bins'])
        let res = {}
        for(let start = 0; start < data.length; start += step){
          let end = start+step
          if(end > data.length)
            end = data.length
          
          let avg = this.calculate_average(start,end,data)
          for (let key in avg) {
              if (key in res) res[key].push(avg[key])
              else res[key] = [avg[key]]
          }
        //   this.binned_data.push(v)
        }
        // console.log(this.sounds) 
        return res;
    }

    /*
    ---------------------- Sound Playing functions ---------------------
    */
    play_background(){
        player.stop(CONFIG["background"])
        player.remove_event_single(CONFIG["background"])
        player.enable_loop(CONFIG["background"])
        player.play(CONFIG["background"]);
    }

    play_foreground(d, i, total_sound, self) {
        if ("sound" in d) {
            let sound = ""
            if('howler' in d){
                sound = d.howler;
            }
            else{
                sound = player.get_sound(d.sound);
                d.howler = sound;
            }
            sound.stop()
            sound.off()
            
            sound.play();
            sound.volume(d.volumes[d.volume_index])
            if(total_sound > 1){
                console.log("pos set")
                if(i%2)
                    sound.pos(-0.5,0.5)
                else
                    sound.pos(0.5,0.5)
            }
            else
                sound.pos(0,0)
            
            sound.on("end", function (){
                if(self.playing && d.active){
                    // console.log(d.active)
                    self.timeouts[d.sound] = setTimeout(function () {
                        sound.play();
                    }, self.getInterval(self))   
                } else {
                    console.log('enter1')
                    sound.stop();
                    sound.off()
                }
            });
        }
    }

    play_sound_volume() {
        var self = this;
        self.playing = true;
        player.stop_all();
        player.remove_events();
        player.play(CONFIG['key']) 
        self.play_background()
        self.total_sound = self.data.length;
        self.data.forEach(function (d,i) {
            d.active = 1;
            d.volume_index = 0
            if('howler' in d){
                d.howler.stop()
                d.howler.off()
            }  
            self.play_foreground(d, i, self.total_sound, self)
        })
        self.play_interval();
    }

    play(option = "playpausebar_volume"){
        var self = this;

        if(!self.playing){
            self.playing = true;
            player.stop_all();
            player.remove_events();
             
            self.play_sound_volume();

            // mediaRecorder.start()
            // self.calculate_volume();
            // player.play(CONFIG["background"]);
            // self.play_sound_volume();

            // let text = "You will now hear an audio."
            // // let text = ""
            // var utterThis = new SpeechSynthesisUtterance(text);
            // utterThis.rate = 0.8;
            // synth.speak(utterThis);
            // utterThis.onend = function(event) {

            //     if( option == "playpausebar_density"){
            //         self.calculateIntervals(3);
            //         player.play(CONFIG["background"]);
            //         self.play_sound_density();
            //     }
            //     else {
            //         // mediaRecorder.start()
            //         // self.calculate_volume();
            //         self.play_sound_volume();
            //     }
            // }
            
        }
        else {
            self.playing = false;
            self.data.forEach(function (d) {
                clearTimeout(self.timeouts[d.sound]);
                if('howler' in d){
                    d.howler.stop();
                    d.howler.off();
                } 
            })
            player.stop(CONFIG['background']);
            if(self.timer) clearInterval(self.timer);
        }
    }

    play_interval(){
        var self = this;
        // console.log("installed beep", self.interval*1000)
        if(self.timer) clearInterval(self.timer);

        self.timer = setInterval(myTimer, (self.interval/CONFIG['bins'])*1000);

        function myTimer (){
            // console.log("beep")
            let flag = 0;
            self.data.forEach(function(d){
                d.volume_index += 1
                if(d.volume_index < d.volumes.length){
                    if('howler' in d){
                        // console.log(d.volumes[d.volume_index])
                        flag = 1
                        d.howler.volume(d.volumes[d.volume_index])
                    }
                }
                else {
                    d.volume_index = 0
                    // if('howler' in d){
                    //     d.howler.stop();
                    //     d.howler.off();
                    // }
                }

            })
            if(!flag) {
                // self.play()
                flag = 1
                if(!player.isPlaying(CONFIG["beep_sound"]))
                    player.play(CONFIG["beep_sound"]);

                // setTimeout(() => {
                //     self.play_sound_volume()   
                // }, 1000);
                
            }
            // player.play(CONFIG["beep_sound"]);
        }
    }

    /*
    ---------------------- All events ---------------------
    */

    load_data(){
        var self = this;
        self.attrs = self.data.map(d => d.name)
        console.log(self.data)
        $.ajax({
            url: '/read_stock_data',
            //contentType: JSON,
            type: 'POST',
            data: JSON.stringify({attrs:self.attrs}),
            success: function(res) {
                console.log(res)
                self.stocks = res.stocks;
                self.normalized_data = self.normalize(self.stocks)
                self.binned_data =  self.discretize_data(self.normalized_data)
                self.attrs.forEach(function(a,i){
                    self.data[i].volumes = self.binned_data[a]
                })
                console.log(self.data)
                // self.draw_data(self.attrs); 
                // self.append_items(self.attrs)  
            },
            //error function for first ajax call
            error: function(error) {
                console.log(error);
            }
        })
    }
    
    install_events () {
        console.log("installed")
        let self = this;

        $("#play_control").on("click", function () {
            console.log("pressed in ambient line")
            player.play(CONFIG['key'])
            self.play();
        })
        $("#reset_control").on("click", function () {
            //user pressed esc
            player.play(CONFIG['key'])
            self.selected = []
            self.data.forEach(function (d, i) {
                d.active = 1
                if ('howler' in d) {
                    if (!d.howler.playing())
                        self.play_foreground(d, i, self.total_sound, self)
                }
            })
        })
        $("#decrease_control").on("click", function () {
            player.play(CONFIG['key'])
            self.interval += 5;
            if (self.interval > 30)
                self.interval = 30

            self.random_max = (self.interval / 15) * 1000;
            if (self.playing)
                self.play_interval() 
        })
        $("#increase_control").on("click", function () {
            player.play(CONFIG['key'])
            self.interval -= 5;
            if (self.interval < 5)
                self.interval = 5

            self.random_max = (self.interval / 15) * 1000;
            if (self.playing)
                self.play_interval()
        })
        $(".select_button").on("click", function () {
            player.play(CONFIG['key'])
            let ind = parseInt($(this).attr("id").split("_")[0])
            if (ind < self.data.length) {

                if (self.data.length == self.selected.length) {
                    self.selected = []
                }

                if (self.selected.indexOf(ind) == -1) {
                    self.selected.push(ind)
                }
                else {
                    let del_ind = self.selected.indexOf(ind)
                    self.selected.splice(del_ind, 1)
                }

                self.data.forEach(function (d, i) {
                    if (self.selected.indexOf(i) == -1) {
                        d.active = 0
                        if ("howler" in d) {
                            d.howler.stop()
                            d.howler.off()
                        }
                    }
                    else {
                        if (!d.active) {
                            d.active = 1
                            if ('howler' in d) {
                                if (!d.howler.playing())
                                    self.play_foreground(d, i, self.total_sound, self)
                            }
                        }
                    }
                })
            }
        })

        // $('body').keyup(function(e){
        //     let k =+ e.keyCode;

        //     if ( (k == 80)){
        //         // user has pressed space
        //         player.play(CONFIG['key'])  
        //         console.log("pressed in line")
        //         self.play();       
        //     }
        //     else if ( (k >= 49) && (k <= 57) && (self.playing)){
        //         //user pressed 1-9
        //         // player.stop_all()
        //         player.play(CONFIG['key'])  
        //         let ind = k - 49;
        //         if(ind < self.data.length){

        //             if(self.data.length == self.selected.length){
        //                 self.selected = []
        //             }
                    
        //             if(self.selected.indexOf(ind) == -1){
        //                 self.selected.push(ind)
        //             }    
        //             else {
        //                 let del_ind = self.selected.indexOf(ind)
        //                 self.selected.splice(del_ind, 1)
        //             }

        //             self.data.forEach(function (d,i) {
        //                 if(self.selected.indexOf(i) == -1){
        //                     d.active = 0
        //                     if ("howler" in d){
        //                         d.howler.stop()
        //                         d.howler.off()
        //                     }
        //                 }
        //                 else{
        //                     if(!d.active){
        //                         d.active = 1
        //                         if('howler' in d){
        //                             if(!d.howler.playing())
        //                                 self.play_foreground(d, i, self.total_sound, self)
        //                         }   
        //                     }   
        //                 }
        //             })
        //         }
                
        //     }
        //     else if ( (k == 27)) {
        //         //user pressed esc
        //         player.play(CONFIG['key'])  
        //         self.selected = []
        //         self.data.forEach(function (d,i) {
        //             d.active = 1
        //             if('howler' in d){
        //                 if(!d.howler.playing())
        //                     self.play_foreground(d, i, self.total_sound, self)
        //             }   
        //         })
        //     }
        //     else if ( (k == 39)) {
        //         player.play(CONFIG['key'])  
        //         self.interval -= 5;
        //         if(self.interval < 5)
        //             self.interval = 5
                
        //         self.random_max = (self.interval/15)*1000;
        //         if(self.playing)
        //             self.play_interval()

        //     }
        //     else if ( (k == 37)) {
        //         player.play(CONFIG['key'])  
        //         self.interval += 5;
        //         if(self.interval > 30)
        //             self.interval = 30
                
        //         self.random_max = (self.interval/15)*1000;
        //         if(self.playing)
        //             self.play_interval() 
        //     }

        //     else if ( (k == 73)) {
        //         player.play(CONFIG['key'])  
        //         self.play()
        //         let text = "the audio represents sonified trend of "+self.data.length + " students"
        //         var utterThis = new SpeechSynthesisUtterance(text);
        //         utterThis.rate = 0.8;
        //         synth.speak(utterThis);
        //         utterThis.onend = function(event) {
        //             self.play()
        //         }
        //     }
        // });
    }
    
}