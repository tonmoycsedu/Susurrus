class highchartScatter {
    constructor (div_id, list_id, svg_div_id) {
        this.div_id = div_id;
        this.list_id = list_id;
        this.svg_div_id = svg_div_id;
        this.index = 0;
        this.data = data;
        this.playing = false;
        this.selected = [];
        this.duration = 50;
        this.timer = false;
        this.random_max = 5000;
        this.chart = false;
        this.duration = 6000;
        this.series = []
        // this.install_chart();
        this.load_data();

        player.set_volume(CONFIG["beep_sound"], 10);
        player.remove_events();
    }
    create_svg () {
        this.margin = {top: 30, right: 0, bottom: 30, left: 40};
        this.width = $("#"+this.svg_div_id).width() - this.margin.left - this.margin.right;
        this.height = 400 - this.margin.top - this.margin.bottom;

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
        .attr("transform", "translate(0," + this.height/2 + ")");

        // add the y Axis
        this.yAxis = this.svg.append("g")
        .attr("transform", "translate("+this.width/2+",0)");

        this.g = this.svg.append("g")
        
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
        .domain([-1,1])
        
        self.xAxis.selectAll("*").remove();
        self.xAxis.call(d3.axisBottom(self.x));

        self.yAxis.selectAll("*").remove();
        self.yAxis.call(d3.axisLeft(self.y))

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
            .style("fill","#2196F3");

        self.show_play_button();
        self.show_rate_buttons();
    }
    play_sound (){
        var self = this;
        var background;
        if(self.background) background = self.background;
        else background = CONFIG['scatter_sound']
        player.stop_all();
        player.enable_loop(background)
        player.set_volume(CONFIG["beep_sound"], 5)
        let pi = Math.PI;
        let posX = -1;
        player.play(background);
        self.timer = setInterval(mySound, this.duration);
        console.log("entered")

        function mySound (){
            if (posX >= 1) {
                posX = -1;
                player.play(CONFIG["beep_sound"]);
            }
            player.set_pos(background,posX,0.5,0.5);
            self.data.forEach(function (d) {
                if ((d.x > (posX)) && (d.x < (posX + .1)) && (d.y > 0)){
                    if(!player.isPlaying(CONFIG["point_sound"])) {
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
                    self.chart.cancelSonify();
                }
                      
            }
            else if(k == 39) {

                self.duration -= 10;
                if(self.duration < 10)
                    self.duration = 10;
                
                if(self.playing){
                    self.chart.cancelSonify();
                    self.play();
                }       
            }
            else if(k == 37) {
                self.chart.cancelSonify();

                self.duration += 20;
                if(self.duration > 500)
                    self.duration = 500;

                if(self.playing){
                    self.chart.cancelSonify();
                    self.play();
                } 
            }
        })
    }
}