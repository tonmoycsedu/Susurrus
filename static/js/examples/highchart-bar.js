class highchartBar {
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
        this.chart = false;
        this.duration = 3000;
        this.timeout;
        this.install_chart();

        player.set_volume(CONFIG["beep_sound"], 10);
    }
    install_chart (){
        var self = this;
        // Set up a simple chart
        self.chart = Highcharts.chart(self.svg_div_id, {
            chart: {
                type: "column"
            },
            title: {
                text: 'Chart sonified in sequence'
            },
            legend: {
                enabled: false
            },
            sonification: {
                events: {
                    onPointStart: function (e, point) {
                        point.onMouseOver();
                    },
                    onEnd: function () {
                        // player.play(CONFIG["beep_sound"]);
                        if(self.playing){
                            self.timeout = setTimeout(function(){
                                self.play();
                            }, 1000)
                        } 
                    }
                },
            },
            accessibility: {
                landmarkVerbosity: 'one'
            },
            series: [{
                data: self.data
            }]
        });
        self.install_events();
    }

    play(){
        var self = this;

        self.chart.sonify({
            duration: self.duration,
            order: 'sequential',
            afterSeriesWait: 1000,
            instruments: [{
                instrument: 'triangleMajor',
                instrumentMapping: {
                    volume: 0.8,
                    duration: 150,
                    // pan: 'x',
                    frequency: 'y'
                },
                // Start at C5 note, end at C6
                instrumentOptions: {
                    minFrequency: 520,
                    maxFrequency: 1050
                }
            }]
        });
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
                // player.play(CONFIG['key']) 
                if(!self.playing){
                    self.playing = true;
                    self.play(); 
                }
                else{
                    console.log("canceled")
                    clearTimeout(self.timeout);
                    player.play(CONFIG['key']) 
                    self.playing = false;
                    self.chart.cancelSonify();
                }
                      
            }
            else if(k == 38) {
                player.play(CONFIG['key']) 
                self.duration -= 500;
                if(self.duration < 500)
                    self.duration = 500;
                
                if(self.playing){
                    self.chart.cancelSonify();
                    self.play();
                }       
            }
            else if(k == 40) {
                player.play(CONFIG['key']) 
                self.chart.cancelSonify();

                self.duration += 500;
                if(self.duration > 4000)
                    self.duration = 4000;

                if(self.playing){
                    self.chart.cancelSonify();
                    self.play();
                } 
            }
        })
    }
}