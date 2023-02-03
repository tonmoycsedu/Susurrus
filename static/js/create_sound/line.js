class Line {
    /*
    ----------------- Constructor for the class. intialize variables. --------------------
    */
    constructor (div_id, list_id, svg_div_id) {
        this.div_id = div_id;
        this.list_id = list_id;
        this.svg_div_id = svg_div_id;
        this.index = 0;
        this.data = [];
        this.playing = false;
        this.binned_data = [];
        this.attrs = [];
        this.sounds = {};
        this.random_max = 2000;
        this.interval = 30;
        this.selected = [];

        $("#"+this.div_id).empty();
        $("#"+this.svg_div_id).empty();
        this.add_import_button();
        this.add_export_button();
        this.add_search_bar();
        this.update_search_bar();
        this.add_create_button();
        this.create_list();
        
        this.create_svg();
        // this.add_play_button("density");
        player.set_volume(CONFIG["beep_sound"], 10);
        this.add_play_button("volume");
        player.remove_events();
        player.install_events();
        this.install_events();
    }

    /*
    ------------------ Functions for adding/appending UI elements ---------------------
    */
    add_import_button () {
        let html_string = '<label for="bar_file_upload" class="ui mini teal icon button">Import Data</label>'+
            '<input type="file" id="bar_file_upload" style="display:none"/>';
        $("#"+this.div_id).append(html_string);
    }

    add_export_button () {
        let html_string = '<button id="export_button" class="ui mini teal icon button">Export Audible Data</button>';
        $("#"+this.div_id).append(html_string);

    }

    add_create_button () {
        let html_string = '<button id="create_chart" class="ui mini blue icon button">Create Bar Chart</button>';
        $("#"+this.div_id).append(html_string);

    }

    add_search_bar (){
        let html_string = '<select id="select_stock" placeholder="Select Stock" class="ui search dropdown" multiple="">'+
        '<option value="">Select Stock</option>  </select>'
        $("#"+this.div_id).append(html_string);
        $('#select_stock').dropdown({});
    }

    update_search_bar (){
        $.ajax({
            url: '/read_stock_categories',
            //contentType: JSON,
            type: 'POST',
            success: function(res) {
                console.log(res)
                res.stocks.forEach(function(s) {
                    $("#select_stock").append('<option value="'+s+'">'+s+'</option>')
                })
                
            },
            //error function for first ajax call
            error: function(error) {
                console.log(error);
            }
        })
    }

    create_list () {
        let html_string = '<div id="'+this.list_id+'" class="ui divided list"></div>'
        $("#"+this.div_id).append(html_string);
    }

    append_items (data) {
        var self = this;
        self.reset();
        if (data.length < 5) {
            data.forEach(function (d,i){
                let html_string = 
                    '<div class="item">'+
                        '<label>'+d+'</label>';

                html_string += '<select id="soundselect_'+i+'" class="soundselect"> <option> Select Sound </option>'
                CONFIG['sounds'].forEach(function(sound){
                    if(sound != CONFIG["background"])
                        html_string += '<option value="'+sound+'">'+sound+'</option>'
                })


                html_string += '<select>'+
                    '</div>'

                $("#"+self.list_id).append(html_string);

            })
        }
        else {
            alert("Maximum 5 lines allowed at this moment. We are working on extending this feature.")
        }
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

    reset (){
        // this.index = 0;
        // this.data = [];
        $("#"+this.list_id).empty();

    }

    /*
    ---------------------- Utility Functions -------------------------
    */
    
    getInterval(self) {
        // console.log(self.random_max)
        return Math.random() * self.random_max;
    }

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

    /*
    ---------------------- Sound Playing functions ---------------------
    */
    play_background(){
        player.stop(CONFIG["background"])
        player.remove_event_single(CONFIG["background"])
        player.enable_loop(CONFIG["background"])
        player.play(CONFIG["background"]);
    }

    play_foreground(d, self) {
        if ("sound" in d) {
            let sound = player.get_sound(d.sound);
            d.howler = sound;
            sound.stop()
            sound.off()
            
            sound.play();
            // This version is using volume to control loudness.
            // This is to demonstrate the idea.
            // In the study, we used LUFS, not volume.
            // However, this code is not integrated in the code base yet
            sound.volume(d.volumes[d.volume_index])
            sound.on("end", function (){
                if(self.playing && d.active){
                    // console.log(d.active)
                    setTimeout(function () {
                        sound.play();
                    }, self.getInterval(self))   
                } else {
                    console.log('enter1')
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

        self.play_background()
        self.data.forEach(function (d) {
            d.active = 1;
            d.volume_index = 0
            if('howler' in d){
                d.howler.stop()
                d.howler.off()
            }  
            self.play_foreground(d, self)
        })
        self.play_interval();
    }

    play(option = "playpausebar_volume"){
        var self = this;

        if(!self.playing){
            self.playing = true;
            player.stop_all();
            player.remove_events();

            // mediaRecorder.start()
            // self.calculate_volume();
            // player.play(CONFIG["background"]);
            // self.play_sound_volume();

            let text = "You will now hear an audio."
            // let text = ""
            var utterThis = new SpeechSynthesisUtterance(text);
            utterThis.rate = 0.8;
            synth.speak(utterThis);
            utterThis.onend = function(event) {

                if( option == "playpausebar_density"){
                    self.calculateIntervals(3);
                    player.play(CONFIG["background"]);
                    self.play_sound_density();
                }
                else {
                    // mediaRecorder.start()
                    // self.calculate_volume();
                    self.play_sound_volume();
                }
            }
            
        }
        else {
            self.playing = false;
            self.data.forEach(function (d) {
                if('howler' in d){
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

        self.timer = setInterval(myTimer, (self.interval/CONFIG['bins'])*1000);

        function myTimer (){
            // console.log("beep")
            let flag = 0;
            self.data.forEach(function(d){
                d.volume_index += 1
                if(d.volume_index < d.volumes.length){
                    if('howler' in d){
                        // console.log(d.volumes[d.volume_index])
                        flag = 1
                        d.howler.volume(d.volumes[d.volume_index])
                    }
                }
                else {
                    d.volume_index = 0
                    // if('howler' in d){
                    //     d.howler.stop();
                    //     d.howler.off();
                    // }
                }

            })
            if(!flag) {
                // self.play()
                flag = 1
                if(!player.isPlaying(CONFIG["beep_sound"]))
                    player.play(CONFIG["beep_sound"]);

                // setTimeout(() => {
                //     self.play_sound_volume()   
                // }, 1000);
                
            }
            // player.play(CONFIG["beep_sound"]);
        }
    }

    /*
    ---------------------- All events ---------------------
    */
    
    install_events () {
        console.log("installed")
        let self = this;

        $("#create_chart").on("click", function (){
            self.attrs = $('#select_stock').dropdown("get values")
            self.data = []
            self.attrs.forEach(function(a){
                let obj = {}
                obj.name = a;
                obj.volumes = [];
                obj.volume_index = 0;
                self.data.push(obj)
            })
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
                    })
                    console.log(self.data)
                    self.draw_data(self.attrs); 
                    self.append_items(self.attrs)  
                },
                //error function for first ajax call
                error: function(error) {
                    console.log(error);
                }
            })
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

        $("body").on("change", ".soundselect", function () {
            // console.log(this.data)
            let index = $(this).attr("id").split("_")[1]
            self.data[index].sound = $(this).val();
            console.log(self.data);
        })

        $("body").on("click", ".playpausebar", function () {
            self.play($(this).attr("id"))      
        })

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
                                        self.play_foreground(d, self)
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
                
                self.random_max = (self.interval/15)*1000;
                self.play_interval()

            }
            else if(k == 39) {
                self.interval += 5;
                if(self.interval > 30)
                    self.interval = 30
                
                self.random_max = (self.interval/15)*1000;
                self.play_interval() 
            }
        });

        // function to read file and render the graph
        $('#bar_file_upload').on('change', function(e) {
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
                        contentType: 'application/json; charset=utf-8',
                        dataType: "json",
                        type: 'POST',
                        success: function(res) {
                            console.log(res)
                            self.reset()
                            self.data = res.data;
                            self.data.forEach(function(d) {
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
        });
    }

    /*
    ---------------------- File upload and save functions ---------------------
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

    /*
    ---------------------- SVG draw functions using d3.js -------------------------
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
        
        this.color = d3.scaleOrdinal(d3.schemeCategory10);
        
        this.x = d3.scaleLinear()
            .range([ 0, this.width ]);

        this.y = d3.scaleLinear()
            .range([this.height, 0])
        
        // add the x Axis
        this.xAxis = this.svg.append("g")
        .attr("transform", "translate(0," + this.height + ")");

        // add the y Axis
        this.yAxis = this.svg.append("g");

        this.g = this.svg.append("g")
        
    }

    draw_data (attrs) {
        var self = this;
        let data = self.normalized_data;
        
        self.x
        .domain([0,data.length])

        self.y
        .domain([0, d3.max(data, d =>  d3.max(Object.values(d)))])
        
        self.xAxis.selectAll("*").remove();
        self.xAxis.call(d3.axisBottom(self.x));

        self.yAxis.selectAll("*").remove();
        self.yAxis.call(d3.axisLeft(self.y))

        // append the rectangles for the bar chart
        self.g.selectAll("*").remove();

        attrs.forEach(function(attr,i){ // Add lines for each attributes
            self.g.append("path")
            .datum(data)
                .attr("id","path_"+i)
                .attr("fill", "none")
                .attr("stroke-width", 1.5)
                .attr("stroke",self.color(i))
                .attr("d", d3.line()
                .x(function(d, ix) { return self.x(ix) })
                .y(function(d) { return self.y(d[attr]) })
                )

            self.g.append("text")
                .attr("fill",self.color(i))
                .attr("x", self.x(10))
                .attr("y", (i * 20 + 20))
                .text(attr)
        })
        self.show_play_button("volume");
    }
    
}