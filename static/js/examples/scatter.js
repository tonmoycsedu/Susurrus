class Scatter {
    constructor (div_id, list_id, svg_div_id, file_name) {
        this.div_id = div_id;
        this.list_id = list_id;
        this.svg_div_id = svg_div_id;
        this.index = 0;
        this.data = [];
        this.playing = false;
        this.selected = [];
        this.categories = [];
        this.duration = 50;
        this.timer = false;
        this.random_max = 5000;
        this.chart = false;
        // this.duration = 6000;
        this.series = []
        this.file_name = file_name;
        // this.install_chart();
        this.create_svg();
        this.load_data();

        player.set_volume(CONFIG["beep_sound"], 10);
        player.remove_events();
        this.install_events();
    }
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
        
        this.x = d3.scaleLinear()
            .range([0, this.width]);

        this.y = d3.scaleLinear()
            .range([this.height, 0])
        
        // add the x Axis
        this.xAxis = this.svg.append("g")
        .attr("transform", "translate(0," + this.height + ")");

        // add the y Axis
        this.yAxis = this.svg.append("g")
        .attr("transform", "translate("+this.width/2+",0)");

        this.g = this.svg.append("g")

        this.color = d3.scaleOrdinal(d3.schemeDark2);
        
    }
    draw_data () {
        var self = this;
        let data = self.data
        // format the data
        data.forEach(function(d) {
            d.x = +d.x;
            d.y = +d.y;
        });

        self.x
        .domain([-1,1]);

        self.y
        .domain([0,1])
        
        self.xAxis.selectAll("*").remove();
        self.xAxis.call(d3.axisBottom(self.x));

        self.yAxis.selectAll("*").remove();
        self.yAxis.call(d3.axisLeft(self.y))

        self.color.domain(data.map(d => d.sound))

        // append the rectangles for the bar chart
        self.g.selectAll("*").remove();

        // Add dots
        self.g.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
            .attr("cx", function (d) { return self.x(d.x); } )
            .attr("cy", function (d) { return self.y(d.y); } )
            .attr("r", 3.5)
            .style("opacity",0.8)
            .attr("fill", (d,i) => self.color(d.sound));

        var unique = [...new Set(data.map(d => d.sound).values())];
        self.g.append("g")
        .selectAll("text")
        .data(unique)
        .enter()
        .append("text")
        .attr("fill", (d,i) => self.color(d))
            .attr("x", self.x(0.02))
            .attr("y", (d,i) => (i * 20 + 20))
            .text(d => d);


        // self.show_play_button();
        // self.show_rate_buttons();
    }
    play (){
        var self = this;
        var background;
        if(self.background) background = self.background;
        else background = CONFIG['scatter_sound']
        player.stop_all();
        player.enable_loop(background)
        player.set_volume(CONFIG["beep_sound"], 5)
        player.set_volume(background, 100)
        player.play(CONFIG['key']) 
        let pi = Math.PI;
        let posX = -1;
        player.play(background);
        self.timer = setInterval(mySound, this.duration);
        console.log("entered")

        function mySound (){
            // player.play(background)
            if (posX >= 1) {
                posX = -1;
                player.play(CONFIG["beep_sound"]);
            }
            player.set_pos(background,posX,0.5,0.5);
            self.data.forEach(function (d) {
                if ((d.x > (posX)) && (d.x < (posX + .1)) && (d.y > 0) && (d.active)){
                    if(!player.isPlaying(d.sound)) {
                        player.set_pos(d.sound,d.x,0.5);
                        player.set_volume(d.sound,d.y*100)
                        player.play(d.sound);
                        // console.log("played")
                    }
                    // console.log("found some",d.degrees, degree)
                }
            })
            posX += .01;
        }
    }
    load_data(){
        var self = this;
        // self.attrs = self.data.map(d => d.name)
        // console.log(self.data)
        $.ajax({
            url: '/get_csv/',
            //contentType: JSON,
            type: 'POST',
            data: JSON.stringify({fileName:self.file_name}),
            success: function(res) {
                console.log(res)
                self.data = res.data;
                self.categories = [...new Set(self.data.map((d) => d.sound))]
                console.log(self.categories)
                self.draw_data(); 
                // self.append_items(self.attrs)  
            },
            //error function for first ajax call
            error: function(error) {
                console.log(error);
            }
        })
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

                if(!self.playing){
                    self.playing = true;
                    self.play(); 
                }
                else{
                    self.playing = false;
                    player.stop_all();
                    if(self.timer) clearInterval(self.timer);
                    player.play(CONFIG['key']) 
                }
                      
            }
            else if (k == 27) {
                //user pressed esc
                player.play(CONFIG['key'])   
                self.selected = []
                self.data.forEach(function (d) {
                    d.active = 1;  
                })
            }
            else if ((k >= 49) && (k <= 57) && (self.playing)){
                //user pressed 1-9
                // player.stop_all()
                player.play(CONFIG['key'])   
                let ind = k - 49;
                if(ind < self.categories.length){

                    if(self.categories.length == self.selected.length){
                        self.selected = []
                    }
                    
                    if(self.selected.indexOf(self.categories[ind]) == -1){
                        self.selected.push(self.categories[ind])
                    }    
                    else {
                        let del_ind = self.selected.indexOf(self.categories[ind])
                        self.selected.splice(del_ind, 1)
                    }

                    self.data.forEach(function (d,i) {
                        if(self.selected.indexOf(d.sound) == -1){
                            d.active = 0
                            // if ("howler" in d){
                            //     d.howler.stop()
                            //     d.howler.off()
                            // }
                        }
                        else{    
                            d.active = 1  
                        }
                    })
                }
                
            }
            else if(k == 38) {
                player.play(CONFIG['key']) 
                self.duration -= 10;
                if(self.duration < 10)
                    self.duration = 10;
                
                if(self.playing){
                    player.stop_all();
                    if(self.timer) clearInterval(self.timer)
                    self.play()
                }       
            }
            else if(k == 40) {
                player.play(CONFIG['key']) 
                self.chart.cancelSonify();

                self.duration += 20;
                if(self.duration > 500)
                    self.duration = 500;

                if(self.playing){
                    player.stop_all();
                    if(self.timer) clearInterval(self.timer)
                    self.play()
                } 
            }
            // else if(k == 77) {
            //     player.play(CONFIG['key'])   
            //     self.play()
            //     let text = "the audio represents sonification of "+self.data.length + " points"
            //     var utterThis = new SpeechSynthesisUtterance(text);
            //     utterThis.rate = 0.7;
            //     synth.speak(utterThis);
            //     utterThis.onend = function(event) {
            //         self.play()
            //     }
            // }
        })
    }
}