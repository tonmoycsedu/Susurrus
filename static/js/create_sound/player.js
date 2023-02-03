class Player {
    constructor () {
        this.sounds = {};
        this.playing = {}
    }
    add_sound(name,howler_obj) {
        this.sounds[name] = howler_obj;
        this.playing[name] = 0;
    }
    get_sound(name) {
        return this.sounds[name];
    }
    play(name) {
        var id = this.sounds[name].play();
        this.playing[name] = 1;
        return id;
    }
    isPlaying(name) {
        return this.sounds[name].playing();
    }
    stop(name) {
        this.sounds[name].stop();
        this.playing[name] = 0;
    }
    stop_all () {
        for (let name in this.sounds) {
            this.sounds[name].stop();
            this.playing[name] = 0;
        }
    }
    play_pause_sound(name) {
        if (this.sounds[name].playing()){
            this.sounds[name].stop()
            this.playing[name] = 0;
        }
        else {
            this.sounds[name].play();
            this.playing[name] = 1;
        }
    }
    set_volume(name, volume) {
        volume = +volume/100
        if ((volume >=0 ) && (volume <= 1)) {
            this.sounds[name].volume(volume)
        }
    }
    get_volume(name) {
        return this.sounds[name].volume()
    }
    set_pos(name,x,y,a) {
        this.sounds[name].pos(x,y,a);
    }
    enable_loop (name) {
        this.sounds[name].loop(true);
        // var self = this;
        // self.sounds[name].on("end", function () {
        //     if(self.playing[name]) {
        //         self.sounds[name].play();
        //     }
        // })
    }
    getRandom(max) {
        return Math.random() * max;
    }
    install_events () {
        var self = this;
        for (let name in self.sounds) {
            self.sounds[name].on("end", function () {
                if ((name != CONFIG['background']) && (self.playing[name])) {
                    console.log("fired also", name, self.playing[name])
                    setTimeout(function () {
                        self.sounds[name].play();
                    }, self.getRandom(CONFIG['random_max']))
                }
                else if ((name == CONFIG['background'])) {
                    console.log("else fired", name, self.playing[name])
                    self.sounds[name].play();
                }
            })
        }
    }
    remove_events () {
        console.log("removed")
        var self = this;
        for (let name in self.sounds) {
            self.sounds[name].off()
        }

    }
    remove_event_single (name) {
        var self = this;
        self.sounds[name].off()
    }
}