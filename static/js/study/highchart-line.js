class highchartLine {
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
        this.duration = 6000;
        this.series = [];
        this.timeout;
        // this.install_chart();
        this.load_data();

        player.set_volume(CONFIG["beep_sound"], 10);
    }

    // --------------- utility functions --------------
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
                    self.series.push({'data': self.binned_data[a]})
                })
                console.log(self.data)
                console.log(self.series)
                self.install_chart();
                // self.draw_data(self.attrs); 
                // self.append_items(self.attrs)  
            },
            //error function for first ajax call
            error: function(error) {
                console.log(error);
            }
        })
    }

    // ------------------- play highcharts -----------------
    install_chart (){
        var self = this;
        // Set up a simple chart
        self.chart = Highcharts.chart(self.svg_div_id, {
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
                        player.play(CONFIG["beep_sound"]);
                        self.timeout = setTimeout(function(){
                            console.log("play again")
                            self.play();
                        }, 1000)    
                    }
                },
            },
            accessibility: {
                landmarkVerbosity: 'one'
            },
            series:  self.series,
        });
        self.install_events();
    }

    play(){
        var self = this;

        self.chart.sonify({
            duration: self.duration,
            order: 'simultaneous',
            afterSeriesWait: 1000,
            instruments: [{
                instrument: 'triangleMajor',
                instrumentMapping: {
                    volume: 0.3,
                    duration: 150,
                    // pan: 'x',
                    frequency: 'y'
                },
                // Start at C5 note, end at C6
                instrumentOptions: {
                    minFrequency: 50,
                    maxFrequency: 450
                }
            }]
        });
    }

    /*
    ---------------------- ALL Events ---------------------
    */
    install_events () {
        var self = this;

        $("#play_control").on("click", function () {
            console.log("pressed in highcharts line")
            // player.play(CONFIG['key'])
            if (!self.playing) {
                self.playing = true;
                self.play();
            }
            else {
                clearTimeout(self.timeout);
                // player.play(CONFIG['key'])
                self.playing = false;
                self.chart.cancelSonify();
            }
        })

        $("#decrease_control").on("click", function () {
            player.play(CONFIG['key'])
            // self.chart.cancelSonify();

            self.duration += 1000;
            if (self.duration > 15000)
                self.duration = 15000;

            if (self.playing) {
                self.chart.cancelSonify();
                self.play();
            }
        })
        $("#increase_control").on("click", function () {
            player.play(CONFIG['key'])
            self.duration -= 1000;
            if (self.duration < 500)
                self.duration = 500;

            if (self.playing) {
                self.chart.cancelSonify();
                self.play();
            } 
        })

        // key board interactions
        // $('body').keyup(function(e){
        //     let k =+ e.keyCode;

        //     if ( (k == 80)){
        //         // user has pressed space
        //         console.log("pressed")

        //         if(!self.playing){
        //             self.playing = true;
        //             self.play(); 
        //         }
        //         else{
        //             clearTimeout(self.timeout);
        //             player.play(CONFIG['key']) 
        //             self.playing = false;
        //             self.chart.cancelSonify();
        //         }
                      
        //     }
        //     else if ( (k == 39)) {
        //         player.play(CONFIG['key']) 
        //         self.duration -= 1000;
        //         if(self.duration < 500)
        //             self.duration = 500;
                
        //         if(self.playing){
        //             self.chart.cancelSonify();
        //             self.play();
        //         }       
        //     }
        //     else if ( (k == 37)) {
        //         player.play(CONFIG['key']) 
        //         // self.chart.cancelSonify();

        //         self.duration += 1000;
        //         if(self.duration > 15000)
        //             self.duration = 15000;

        //         if(self.playing){
        //             self.chart.cancelSonify();
        //             self.play();
        //         } 
        //     }
        // })
    }
}

