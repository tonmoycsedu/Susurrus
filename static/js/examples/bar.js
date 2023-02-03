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
        this.create_svg();
        this.draw_data();
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
            if(vol < 0.05)
                vol = 0.05;
            
            else if(vol >= 0.8)
                vol = 0.8;
            
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
                sound.pos(-1,0.5)
            else
                sound.pos(1,0.5)

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
        
        $('body').keyup(function(e){
            let k =+ e.keyCode;

            if(k == 32){
                // user has pressed space
                console.log("pressed")
                player.play(CONFIG['key'])   
                self.play();       
            }
            else if ((k >= 49) && (k <= 57) && (self.playing)){
                //user pressed 1-9
                // player.stop_all()
                player.play(CONFIG['key'])   
                let ind = k - 49;
                if(ind < self.data.length){

                    if(self.data.length == self.selected.length){
                        self.selected = []
                    }
                    
                    if(self.selected.indexOf(ind) == -1){
                        self.selected.push(ind)
                    }    
                    else {
                        let del_ind = self.selected.indexOf(ind)
                        self.selected.splice(del_ind, 1)
                    }

                    self.data.forEach(function (d,i) {
                        if(self.selected.indexOf(i) == -1){
                            d.active = 0
                            if ("howler" in d){
                                d.howler.stop()
                                d.howler.off()
                            }
                        }
                        else{
                            if(!d.active){
                                d.active = 1
                                if('howler' in d){
                                    if(!d.howler.playing())
                                        self.play_foreground(d, i, self)
                                }   
                            }   
                        }
                    })
                }
                
            }
            else if (k == 27) {
                //user pressed esc
                player.play(CONFIG['key'])   
                self.selected = []
                self.data.forEach(function (d, i) {
                    d.active = 1
                    if('howler' in d){
                        if(!d.howler.playing())
                            self.play_foreground(d, i, self)
                    }   
                })
            }
            else if(k == 38) {
                player.play(CONFIG['key'])   
                self.interval -= 5;
                if(self.interval < 5)
                    self.interval = 5
                
                self.random_max = (self.interval/6)*1000;
                self.play_interval()

            }
            else if(k == 40) {
                player.play(CONFIG['key'])   
                self.interval += 5;
                if(self.interval > 30)
                    self.interval = 30
                
                self.random_max = (self.interval/6)*1000;
                self.play_interval() 
            }

            else if(k == 77) {
                player.play(CONFIG['key'])   
                self.play()
                let text = "the audio represents sonified score of "+self.data.length + " students"
                var utterThis = new SpeechSynthesisUtterance(text);
                utterThis.rate = 0.7;
                synth.speak(utterThis);
                utterThis.onend = function(event) {
                    self.play()
                }
            }
         });
    }

    /*
    ------------------- SVG draw functions -----------------------
    */
    create_svg () {
        this.margin = {top: 30, right: 0, bottom: 30, left: 40};
        this.width = $("#"+this.svg_div_id).width() - this.margin.left - this.margin.right;
        this.height = 300 - this.margin.top - this.margin.bottom;
        
        this.svg = d3.select("#"+this.svg_div_id)
        .append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
            .attr("transform", 
                "translate(" + this.margin.left + "," + this.margin.top + ")");
        
        this.x = d3.scaleBand()
            .range([0, this.width])
            .padding(0.1);

        this.y = d3.scaleLinear()
            .range([this.height, 0])
        
        // add the x Axis
        this.xAxis = this.svg.append("g")
        .attr("transform", "translate(0," + this.height + ")");

        // add the y Axis
        this.yAxis = this.svg.append("g");

        this.g = this.svg.append("g")
        
    }
    draw_data () {
        var self = this;
        let data = self.data.filter(d => "value" in d)
        // format the data
        data.forEach(function(d) {
            d.value = +d.value;
        });

        self.x
        .domain(d3.range(data.length));

        self.y
        .domain([0, d3.max(data, d => d.value)])
        
        self.xAxis.selectAll("*").remove();
        self.xAxis.call(d3.axisBottom(self.x).tickFormat(i => data[i].sound).tickSizeOuter(0));

        self.yAxis.selectAll("*").remove();
        self.yAxis.call(d3.axisLeft(self.y))

        // append the rectangles for the bar chart
        self.g.selectAll("*").remove();

        self.g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d, i) { return self.x(i); })
        .attr("width", self.x.bandwidth())
        .attr("y", function(d) { return self.y(d.value); })
        .attr("height", function(d) { return self.height - self.y(d.value); })
        .style("opacity",0.8)
        .style("fill","#2196F3");

        // self.show_play_button("density");
        // self.show_play_button("volume");
    }

}