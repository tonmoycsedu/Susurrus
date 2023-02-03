class Bar {
    /*
    ----------------- Consttructor -------------------
    */
    constructor (div_id, list_id, svg_div_id) {
        this.div_id = div_id;
        this.list_id = list_id;
        this.svg_div_id = svg_div_id;
        this.index = 0;
        this.data = [];
        this.playing = false;
        this.selected = [];
        this.interval = 30;
        this.timer = false;
        this.random_max = 5000;
        this.timeouts = {};

        $("#"+this.div_id).empty();
        $("#"+this.svg_div_id).empty();
        this.append_add_import_button();
        this.create_list();
        // this.append_item();
        this.append_create_button();
        this.append_export_button();
        this.create_svg();
        // this.add_play_button("density");
        this.add_play_button("volume");
        player.remove_events();
        player.install_events();
        player.set_volume(CONFIG["beep_sound"], 10);
        this.install_events();
    }

    /*
    ---------------- HTML code ----------------------
    */
    append_add_import_button () {
        let html_string = '<label for="bar_file_upload" class="ui mini teal icon button">Import Data</label>'+
            '<input type="file" id="bar_file_upload" style="display:none"/>'+
            '<button id="add_item" class="ui mini icon button">Add new bar</button>';
        $("#"+this.div_id).append(html_string);
    }
    append_create_button () {
        let html_string = '<button id="create_bar_chart" class="ui mini blue icon button disabled">Create Bar Chart</button>';
        $("#"+this.div_id).append(html_string);

    }
    append_export_button () {
        let html_string = '<button id="export_button" class="ui mini teal icon button disabled">Export Audible Data</button>';
        $("#"+this.div_id).append(html_string);

    }
    create_list () {
        let html_string = '<div id="'+this.list_id+'" class="ui divided list"></div>'
        $("#"+this.div_id).append(html_string);
    }
    append_item (d = false) {
        if(this.index == 0) {
            $("#export_button").removeClass("disabled");
            $("#create_bar_chart").removeClass("disabled");
        }

        var data;
        if(d){
            data = JSON.parse(JSON.stringify(d));
            if (!("sound" in data))
                data['sound'] = "";
        }
        else{
            data = {"value":"", "active":1}
        }

        if (this.index < 5) {
            let html_string = 
                '<div class="item">'+
                    '<div class="ui mini input">'+
                        '<input id="bar_'+this.index+'" class="bar_input" type="number" placeholder="insert value" value='+data.value+'>'+
                    '</div>';

            html_string += '<select id="soundselect_'+this.index+'" class="soundselect"> <option> Select Sound </option>'
            CONFIG['sounds'].forEach(function(sound){
                if(sound != CONFIG["background"])
                    if(sound == data.sound)
                        html_string += '<option selected value="'+sound+'">'+sound+'</option>'
                    else
                        html_string += '<option value="'+sound+'">'+sound+'</option>'
            })
            html_string += '<select>'+
                '</div>';
            html_string +=
                '<div class="ui mini input">' +
                    '<input id="barvolume_' + this.index + '" class="bar_volume" type="number" placeholder="volume">' +
                '</div>';

            $("#"+this.list_id).append(html_string);

            if(!d){
                this.data.push(data);
            }
            this.index += 1;
        }
        else {
            alert("Maximum 5 bars allowed at this moment. We are working on extending this feature.")
        }
    }
    reset (){
        this.index = 0;
        // this.data = [];
        $("#"+this.list_id).empty();

    }
    add_play_button (type) {
        let html_string = '<button id="playpausebar_'+type+'" class="ui mini blue icon button playpausebar" style="display:none">'+
                'Play/Pause --'+ type+
                // '<i class="play icon"></i>'+
                '</button>';
            
        $("#"+this.svg_div_id).append(html_string);
    }
    show_play_button (type) {
        // console.log("show")
        $("#playpausebar_"+type).show();
    }

    /*
    ---------------- Utility Function ---------------
    */

    getInterval(self) {
        console.log(self.random_max)
        return Math.random() * self.random_max;
    }

    // This version is using volume to control loudness.
    // This is to demonstrate the idea.
    // In the study, we used LUFS, not volume.
    // However, this code is not integrated in the code base yet
    calculate_volume() {
        var self = this;
        let values = self.data.map(d => d.value)
        let max = Math.max.apply(Math, values)
        let min = Math.min.apply(Math, values)
        // let total = values.reduce((a, b) => a + b, 0)
        self.data.forEach(function (d) {
            let vol = (d.value - min)/(max - min)
            if ((vol < 0.03) && (self.data.length > 2))
                vol = 0.03;

            else if ((vol < 0.03) && (self.data.length <= 2))
                vol = 0.2;
            
            else if(vol >= 0.8)
                vol = 0.8;
            
            d.volume = vol
        })
        console.log(self.data)
    }

    /*
    ---------------- Audio Functions ----------------
    */
    
    play_background() {
        player.stop(CONFIG["background"])
        player.remove_event_single(CONFIG["background"])
        player.enable_loop(CONFIG["background"])
        player.play(CONFIG["background"]);
    }

    play_foreground(d, i, self, update_pos=true) {
        if ("sound" in d) {
            let sound = "";
            if ('howler' in d) {
                sound = d.howler;
            }
            else {
                sound = player.get_sound(d.sound);
                d.howler = sound;
            }
            sound.stop()
            sound.off()

            sound.play();
            // using volume only in this demo
            sound.volume(d.volume)

            if (update_pos){
                if (i % 2)
                    sound.pos(-0.5, 0.5)
                else
                    sound.pos(0.5, 0.5)
            }

            sound.on("end", function () {
                if (self.playing && d.active) {
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

    play(option = "playpausebar_volume") {
        var self = this;

        if (!self.playing) {
            self.playing = true;
            player.stop_all();
            player.remove_events();
            // self.calculate_volume();
            self.play_sound_volume();

            mediaRecorder.start();
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

                if ('howler' in d) {
                    d.howler.stop();
                    d.howler.off();
                }
            })
            player.stop(CONFIG['background']);
            if (self.timer) clearInterval(self.timer);
            mediaRecorder.stop();
        }
    }

    play_interval() {
        var self = this;
        // console.log("installed beep", self.interval*1000)
        if (self.timer) clearInterval(self.timer);

        self.timer = setInterval(myTimer, self.interval * 1000);

        function myTimer() {
            console.log("beep")
            player.play(CONFIG["beep_sound"]);
        }
    }

    calculateIntervals(max_interval) {
        var self = this;
        self.intervals = {}
        let values = self.data.map(d => d.value)
        // let max = Math.max.apply(Math, values)
        // let min = Math.min.apply(Math, values)
        let total = values.reduce((a, b) => a + b, 0)
        self.data.forEach(function (d) {
            d.interval = max_interval - ((d.value/total) * max_interval) 
            self.intervals[d.name] = d.interval;
        })
        console.log(self.data)
    }

    play_sound_density() {
        var self = this;
        self.data.forEach(function (d) {
            console.log(d.sound,d.interval)
            if ("sound" in d) {
                let sound = player.get_sound(d.sound);
                sound.play();
                sound.volume(0.5)
                sound.on("end", function (){
                    if(self.playing){
                        // console.log("on end", d.sound)
                        if ((d.sound != CONFIG['background'])) {
                            console.log("fired", d.sound)
                            setTimeout(function () {
                                sound.play();
                            }, d.interval * 1000)
                        }
                        else if ((d.sound == CONFIG['background'])) {
                            console.log("else fired", d.sound )
                            sound.play();
                        }
                    } else {
                        player.stop_all();
                    }
                });
            }
        })
    }
    /*
    ---------------------- ALL Events ---------------------
    */
    install_events () {
        console.log("installed")
        let self = this;
        $("#add_item").on("click", function (){
            self.append_item();
        });

        $("#create_bar_chart").on("click", function (){
            self.draw_data();
        });

        $("#export_button").on("click", function (){
            // console.log(self.data)
            self.data.forEach(function(d) {
                if("sound" in d)
                    d["volume"] = player.get_volume(d['sound'])
            });
            console.log(self.data)
            $.ajax({
                url: '/save_bar_data',
                data: JSON.stringify({data:self.data}),
                type: 'POST',
                success: function(res){
                    console.log(res)
                    self.DownloadCsv(res, 'bar_data.csv')
                    // alert("Successfully saved data!")
                },
                error: function(error){
                    console.log("error !!!!");
                }
            });
        });

        $("body").on("change", ".bar_input", function () {
            // console.log(this.data)
            let index = $(this).attr("id").split("_")[1]
            self.data[index]['value'] = $(this).val();
            console.log(self.data);
        })
        $("body").on("change", ".bar_volume", function () {
            // console.log(this.data)
            let index = $(this).attr("id").split("_")[1]
            self.data[index]['volume'] = $(this).val();
            console.log(self.data);
        })

        $("body").on("change", ".soundselect", function () {
            // console.log(this.data)
            let index = $(this).attr("id").split("_")[1]
            self.data[index]['sound'] = $(this).val();
            console.log(self.data);
        })

        $("body").on("click", ".playpausebar", function () {
            // console.log("play button clicked")
            self.play($(this).attr("id"))      
        })

        // key board interactions
        $('body').keyup(function(e){
            let k =+ e.keyCode;

            if(k == 32){
                // user has pressed space
                self.play();       
            }
            else if ((k >= 49) && (k <= 57) && (self.playing)){
                //user pressed 1-9
                // player.stop_all()
                let ind = k - 49;
                console.log(ind)
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
                                        self.play_foreground(d, i, self, false)
                                }   
                            }   
                        }
                    })
                }
                
            }
            else if (k == 27) {
                //user pressed esc
                self.selected = []
                self.data.forEach(function (d) {
                    d.active = 1
                    if('howler' in d){
                        if(!d.howler.playing())
                            self.play_foreground(d, self)
                    }   
                })
            }
            else if(k == 37) {
                self.interval -= 5;
                if(self.interval < 5)
                    self.interval = 5
                
                self.random_max = (self.interval/6)*1000;
                self.play_interval()

            }
            else if(k == 39) {
                self.interval += 5;
                if(self.interval > 30)
                    self.interval = 30
                
                self.random_max = (self.interval/6)*1000;
                self.play_interval() 
            }
         });

        // function to read file and render the graph
        $('#bar_file_upload').on('change', function(e) { self.uploadCsv(e, self)});
    }

    /*
    ------------------- SVG draw functions -----------------------
    */
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

        self.show_play_button("density");
        self.show_play_button("volume");
    }

    /*
    --------------- CSV upload/download function ----------------
    */
    DownloadCsv = (function() {
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        return function(data, fileName) {
          const blob = new Blob([data], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);
        };
    }());

    uploadCsv(e, self) {
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
                    url: '/read_bar_data',
                    data: JSON.stringify({content:reader.result}),
                    //contentType: JSON,
                    type: 'POST',
                    success: function(res) {
                        console.log(res)
                        self.reset()
                        self.data = res.data;
                        self.data.forEach(function(d) {
                            d['active'] = 1
                            if("sound" in d){
                                let volume_id = "#volume\\+"+d['sound']
                                volume_id = volume_id.replace(/\./g, '\\.');
                                console.log(volume_id)
                                $(volume_id).val(d['volume']*100)
                                player.set_volume(d['sound'], d['volume']*100)
                            }
                            self.append_item(d)
                        });
                    },
                    //error function for first ajax call
                    error: function(error) {
                        console.log(error);
                    }
                })
            }
        }   
    }
}