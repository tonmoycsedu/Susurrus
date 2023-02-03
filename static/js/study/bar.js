class Bar {
    /*
    ----------------- Consttructor -------------------
    */
    constructor (div_id, list_id, svg_div_id, data) {
        this.div_id = div_id;
        this.list_id = list_id;
        this.svg_div_id = svg_div_id;
        this.index = 0;
        this.data = data;
        this.playing = false;
        this.selected = [];
        this.interval = 30;
        this.timer = false;
        this.random_max = 5000;
        this.timeouts = {};

        player.set_volume(CONFIG["beep_sound"], 10);
        this.install_events();
    }

    /*
    ---------------- Utility Function ---------------
    */

    getInterval(self) {
        console.log(self.random_max)
        return Math.random() * self.random_max;
    }
    calculate_volume() {
        var self = this;
        let values = self.data.map(d => d.value)
        let max = Math.max.apply(Math, values)
        let min = Math.min.apply(Math, values)
        // let total = values.reduce((a, b) => a + b, 0)
        self.data.forEach(function (d) {
            let vol = (d.value - min)/(max - min)
            if( (vol < 0.03 ) && (self.data.length > 2))
                vol = 0.03;

            else if ((vol < 0.03) && (self.data.length <= 2))
                vol = 0.05;
            
            else if(vol >= 0.9)
                vol = 0.9;
            
            d.volume = vol
        })
        console.log(self.data)
    }

    /*
    ---------------- Audio Functions ----------------
    */
    
    play_background(){
        player.stop(CONFIG["background"])
        player.remove_event_single(CONFIG["background"])
        player.enable_loop(CONFIG["background"])
        player.play(CONFIG["background"]);
    }

    play_foreground(d, i, self) {
        if ("sound" in d) {
            let sound = "";
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
            sound.volume(d.volume)

            if(i%2)
                sound.pos(-0.5,0.5)
            else
                sound.pos(0.5,0.5)

            sound.on("end", function (){
                if(self.playing && d.active){
                    // console.log(d.active)
                    self.timeouts[d.sound] = setTimeout(function () {
                        sound.play();
                    }, self.getInterval(self))   
                } else {
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
        self.data.forEach(function (d, i) {
            d.active = 1;
            self.play_foreground(d, i, self)    
        })
        self.play_interval();
    }

    play(option = "playpausebar_volume"){
        var self = this;

        if(!self.playing){
            self.playing = true;
            player.stop_all();
            player.remove_events();
            self.calculate_volume();
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
            //         self.calculate_volume();
            //         self.play_sound_volume();
            //     }
            // }
            
        }
        else {
            self.playing = false;
            self.data.forEach(function (d) {
                clearTimeout(self.timeouts[d.sound]);
                
                if('howler' in d) {
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

        self.timer = setInterval(myTimer, self.interval*1000);

        function myTimer (){
            console.log("beep")
            player.play(CONFIG["beep_sound"]);
        }
    }
    /*
    ---------------------- ALL Events ---------------------
    */
    install_events () {
        var self = this;
        // key board interactions
        $("#play_control").on("click", function(){
            console.log("pressed in ambient bar")
            player.play(CONFIG['key'])
            self.play(); 
        })
        $("#reset_control").on("click", function(){
            //user pressed esc
            player.play(CONFIG['key'])
            self.selected = []
            self.data.forEach(function (d, i) {
                d.active = 1
                if ('howler' in d) {
                    if (!d.howler.playing())
                        self.play_foreground(d, i, self)
                }
            })
        })
        $("#decrease_control").on("click", function () {
            player.play(CONFIG['key'])
            self.interval += 5;
            if (self.interval > 30)
                self.interval = 30

            self.random_max = (self.interval / 6) * 1000;
            self.play_interval() 
        })
        $("#increase_control").on("click", function () {
            player.play(CONFIG['key'])
            self.interval -= 5;
            if (self.interval < 5)
                self.interval = 5

            self.random_max = (self.interval / 6) * 1000;
            self.play_interval()
        })
        $(".select_button").on("click", function(){
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
                                    self.play_foreground(d, i, self)
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
        //         console.log("pressed")
        //         player.play(CONFIG['key'])   
        //         self.play();       
        //     }
        //     else if ( (k >= 49) && (k <= 57) && (self.playing)){
        //         //user pressed 1-9
        //         // player.stop_all()
        //         player.play(CONFIG['key'])   
        //         let ind = k - 49;
        //         console.log(ind)
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
        //                                 self.play_foreground(d, i, self)
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
        //         self.data.forEach(function (d, i) {
        //             d.active = 1
        //             if('howler' in d){
        //                 if(!d.howler.playing())
        //                     self.play_foreground(d, i, self)
        //             }   
        //         })
        //     }
        //     else if ( (k == 39)) {
        //         player.play(CONFIG['key'])   
        //         self.interval -= 5;
        //         if(self.interval < 5)
        //             self.interval = 5
                
        //         self.random_max = (self.interval/6)*1000;
        //         self.play_interval()

        //     }
        //     else if ( (k == 37)) {
        //         player.play(CONFIG['key'])   
        //         self.interval += 5;
        //         if(self.interval > 30)
        //             self.interval = 30
                
        //         self.random_max = (self.interval/6)*1000;
        //         self.play_interval() 
        //     }

        //     else if ( (k == 73)) {
        //         player.play(CONFIG['key'])   
        //         self.play()
        //         let text = "the audio represents sonified score of "+self.data.length + " students"
        //         var utterThis = new SpeechSynthesisUtterance(text);
        //         utterThis.rate = 0.8;
        //         synth.speak(utterThis);
        //         utterThis.onend = function(event) {
        //             self.play()
        //         }
        //     }
        //  });
    }

}