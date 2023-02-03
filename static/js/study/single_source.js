class Single_Source {
    /*
    ----------------- Consttructor -------------------
    */
    constructor (name, volume, beep) {
        this.name = name;
        this.sound = false;
        this.playing = false;
        this.volume = volume;
        this.random_max = 1000;
        this.playBeep = beep;
        player.set_volume(CONFIG["beep_sound"], 10);
        this.install_events()
    }

    /*
    ---------------- Audio Functions ----------------
    */

    getInterval(self) {
        console.log(self.random_max)
        return Math.random() * self.random_max;
    }

    play() {
        var self = this;
        if(!self.playing){
            self.playing = true;
            player.stop_all();
            // player.remove_events();
            console.log(self.name)
            self.sound = player.get_sound(self.name);
            
            // self.sound.stop()
            // self.sound.off()
            
            self.sound.play();
            self.sound.volume(self.volume)
            self.sound.on("end", function (){
                if(self.playing){
                    // console.log(d.active)
                    if(self.playBeep)
                        player.play(CONFIG["beep_sound"]);

                    setTimeout(function () {
                        self.sound.play();
                    }, self.getInterval(self))   
                } else {
                    self.sound.stop();
                    self.sound.off()
                }
            });
        }
        else {
            self.playing = false;
            self.sound.stop();
            self.sound.off(); 

        }

    }
    
    /*
    ---------------------- ALL Events ---------------------
    */
    install_events () {
        var self = this;

        $("#play_control").on("click", function () {
            console.log("pressed in single source")
            player.play(CONFIG['key'])
            self.play();
        })

        // key board interactions
        // $('body').keyup(function(e){
        //     let k =+ e.keyCode;

        //     if ((k == 80)){
                
        //         // user has pressed space
        //         console.log("pressed in audio")
        //         self.play();   
        //         player.play(CONFIG['key'])    
        //     }
        //  });
    }

}