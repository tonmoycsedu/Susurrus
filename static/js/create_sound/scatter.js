class Scatter {
    constructor (div_id, list_id, svg_div_id) {
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
        // this.file_name = file_name;

        $("#"+this.div_id).empty();
        $("#"+this.svg_div_id).empty();
        this.append_add_import_button();
        this.append_create_button();
        this.append_export_button();
        this.create_svg();
        this.add_play_button();
        this.add_rate_buttons();
        this.install_events();
        this.create_backgroud_dropdown();
        this.create_main_dropdown();
        player.remove_events();
    }
    append_add_import_button () {
        let html_string = '<label for="scatter_file_upload" class="ui mini teal icon button">Import Data</label>'+
            '<input type="file" id="scatter_file_upload" style="display:none"/>'+
            '<button id="random_data" class="ui mini icon button">Add Random Data</button>';
        $("#"+this.div_id).append(html_string);
    }
    append_create_button () {
        let html_string = '<button id="create_scatter_plot" class="ui mini blue icon button disabled">Create Scatter Plot</button>';
        $("#"+this.div_id).append(html_string);

    }
    append_export_button () {
        let html_string = '<button id="export_button" class="ui mini teal icon button disabled">Export Audible Data</button>';
        $("#"+this.div_id).append(html_string);

    }
    add_play_button () {
        let html_string = '<br><button id="playpausescatter" class="ui mini blue icon button" style="display:none">'+
                'Chart Audio'+
                '<i class="play icon"></i>'
                '</button>'+
            
        $("#"+this.svg_div_id).append(html_string);
    }
    create_backgroud_dropdown () {
        
        let html_string = '<br><select id="background_sound" class="soundselect" style="margin-top:10px;margin-right:5px"> <option> Select Background </option>';
        CONFIG['sounds'].forEach(function(sound){
            html_string += '<option value="'+sound+'">'+sound+'</option>'
        })
        $("#"+this.div_id).append(html_string);
    
    }
    create_main_dropdown () {
        
        let html_string = '<select id="main_sound" class="soundselect" style="margin-top:10px;"> <option> Select Main Sound </option>';
        CONFIG['sounds'].forEach(function(sound){
            html_string += '<option value="'+sound+'">'+sound+'</option>'
        })
        $("#"+this.div_id).append(html_string);
    
    }
    show_play_button () {
        // console.log("show")
        $("#playpausescatter").show();
    }
    add_rate_buttons () {
        let html_string = "";
        [10,15,20,25,30,35, 40].forEach(function (d) {
            html_string += '<button id="rate_'+d+'" class="ui mini button rate_buttons" style="display:none">'+
                'Audio Length --'+ d+
                '</button>';
        })
        console.log(html_string)
        $("#"+this.svg_div_id).append(html_string);
    }
    show_rate_buttons () {
        $(".rate_buttons").show()
    }
    create_svg () {
        this.margin = {top: 30, right: 0, bottom: 30, left: 40};
        // this.width = $("#"+this.svg_div_id).width() - this.margin.left - this.margin.right;
        this.width = 400 - this.margin.left - this.margin.right;
        this.height = 200 - this.margin.top - this.margin.bottom;

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

        self.color.domain(data.map(d => d.sound))
        
        self.xAxis.selectAll("*").remove();
        self.xAxis.call(d3.axisBottom(self.x).ticks(5));

        self.yAxis.selectAll("*").remove();
        self.yAxis.call(d3.axisLeft(self.y).ticks(2))

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
            .attr("fill", (d,i) => self.color(d.sound))
            .style("opacity",0.8);
            // .style("fill","#2196F3");

        self.show_play_button();
        self.show_rate_buttons();
    }
    play() {
        var self = this;
        var background;
        if (self.background) background = self.background;
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

        function mySound() {
            // player.play(background)
            if (posX >= 1) {
                posX = -1;
                player.play(CONFIG["beep_sound"]);
            }
            player.set_pos(background, posX, 0.5, 0.5);
            self.data.forEach(function (d) {
                if ((d.x > (posX)) && (d.x < (posX + .1)) && (d.y > 0) && (d.active)) {
                    if (!player.isPlaying(d.sound)) {
                        player.set_pos(d.sound, d.x, 0.5);
                        player.set_volume(d.sound, d.y * 100)
                        player.play(d.sound);
                        // console.log("played")
                    }
                    // console.log("found some",d.degrees, degree)
                }
            })
            posX += .01;
        }
    }
    add_polar_coordinates () {
        var self = this;

        self.data.forEach(function (d) {
            d.distance = Math.sqrt(d.x*d.x + d.y*d.y)
            d.radians = Math.atan2(d.y,d.x) //This takes y first
            d.degrees = d.radians * (180/Math.PI)
            if (d.degrees < 0) 
                d.degrees = 360 + d.degrees;
        })
        console.log("updated!", self.data)
    }
    install_events () {
        console.log("installed")
        let self = this;
        $("#random_data").on("click", function (){
            $.ajax({
                url: '/load_random_scatter_data',
                type: 'POST',
                success: function(res){
                    console.log(res)
                    self.data = res.data;
                    self.add_polar_coordinates();
                    $("#export_button").removeClass("disabled");
                    $("#create_scatter_plot").removeClass("disabled");
                    alert("data loaded succesfully!")
                },
                error: function(error){
                    console.log("error !!!!");
                }
            });
        });

        $("#create_scatter_plot").on("click", function (){
            self.draw_data();
        });

        $("body").on("change", "#background_sound", function () {
            
            self.background = $(this).val();    
            console.log(self.background)
        })

        $("body").on("click", "#playpausescatter", function () {
            // console.log("play button clicked")

            let curElement = $(this).children("i");

            if(curElement.hasClass("play")){
                mediaRecorder.start()

                curElement.removeClass("play").addClass("stop");
                self.play()
            }
            else {
                curElement.removeClass("stop").addClass("play");
                player.stop_all();
                mediaRecorder.stop()
                if(self.timer) clearInterval(self.timer)
            }       
        })

        $("body").on("click",".rate_buttons",function(){
            let rate = $(this).attr("id").split("_")[1]
            self.total_time = rate;
        })

        // function to read file and render the graph
        $('#scatter_file_upload').on('change', function(e) {
            //check file length
            if (!e.target.files.length) return;  

            var file = e.target.files[0];
            var data_name = file.name;
            var ext = data_name.split('.').pop();

            if (ext != "csv") {
                file_error("File format error");
            } else {
                // read csv data          
                var reader = new FileReader();
                reader.readAsText(file);   

                //send csv data to server using ajax
                reader.onload = function(event) {
                    //console.log(reader.result)
                    $.ajax({
                        url: '/read_scatter_data',
                        data: JSON.stringify({content:reader.result}),
                        //contentType: JSON,
                        type: 'POST',
                        success: function(res) {
                            console.log(res)
                            self.data = res.data;
                            self.categories = [...new Set(self.data.map((d) => d.sound))]
                            console.log(self.categories)
                            // self.draw_data(self.attrs);
                            // self.append_items(self.attrs) 
                            // self.add_polar_coordinates();
                            $("#export_button").removeClass("disabled");
                            $("#create_scatter_plot").removeClass("disabled");
                            alert("data loaded succesfully!")
                        },
                        //error function for first ajax call
	                    error: function(error) {
	                        console.log(error);
                        }
                    })
                }
            }
        });
    }
}