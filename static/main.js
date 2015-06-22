    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

    (function(){
      var spin_opts = { lines: 13, length: 13, width: 3, radius: 15, corners: 0, rotate: 0, direction: 1, color: '#000', speed: 1, trail: 42, shadow: false, hwaccel: false, className: 'ajax-spinner', zIndex: 2e9, top: '50%', left: '50%', color: '#2171b5' };
      var target = document.getElementById('ajax-loader');
      var spinner = new Spinner(spin_opts).spin(target);
    }());

    function create_stacks(data) {
      $("#ajax-loader").show();

      var parseDate = d3.time.format("%Y-%m-%d").parse,
          formatDate = function(d) { return d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate(); };

      var margin = {top: 13.5, right: 20, bottom: 20, left: 150},
          width = 1100 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

      var y0 = d3.scale.ordinal()
          .rangeRoundBands([height, 0], .2);

      var y1 = d3.scale.linear();

      var x = d3.scale.ordinal()
          .rangeRoundBands([0, width], .1, 0);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .tickFormat(formatDate);

      var nest = d3.nest()
          .key(function(d) { return d.group; });

      var stack = d3.layout.stack()
          .values(function(d) { return d.values; })
          .x(function(d) { return parseDate(d.date); })
          .y(function(d) { return d.value; })
          .out(function(d, y0) { d.valueOffset = y0; });

      var color = d3.scale.category10();

      var svg = d3.select("body").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var dataByGroup = nest.entries(data);
      stack(dataByGroup);
      x.domain(dataByGroup[0].values.map(function(d) { return parseDate(d.date); }));
      y0.domain(dataByGroup.map(function(d) { return d.key; }));
      y1.domain([0, d3.max(data, function(d) { return d.value; })]).range([y0.rangeBand(), 0]);

      var group = svg.selectAll(".group")
          .data(dataByGroup)
        .enter().append("g")
          .attr("class", "group")
          .attr("candidate", function(d) { return d.key; })
          .attr("transform", function(d) { return "translate(0," + y0(d.key) + ")"; });

      group.append("text")
          .attr("class", "group-label")
          .attr("x", 0)
          .attr("y", function(d) { return y1((d.values[0].value) / 2); })
          .attr("dy", "1em")
          .text(function(d) { return d.key; });

      group.selectAll("rect")
          .data(function(d) { return d.values; })
        .enter().append("rect")
          .style("fill", function(d) { return color(d.group); })
          .attr("date", function(d) { return d.date; })
          .attr("class","candidate-block")
          .attr("x", function(d) { return x(parseDate(d.date)); })
          .attr("y", function(d) { return y1(d.value); })
          .attr("width", x.rangeBand())
          .attr("height", function(d) { return y0.rangeBand() - y1(d.value); });

      group.filter(function(d, i) { return !i; }).append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (y0.rangeBand() + 10) + ")")
          .call(xAxis);

      $("#ajax-loader").hide();
    }

    function update_map(hours, search_terms) {
      $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/tweets",
        dataType: "json",
        async: true,
        data: '{"hrs":' + String(hours) + ', "search":"' + String(search_terms) + '"}',
        // data: '{"hrs":' + String(30) + ', "search":"' + String("nba, cavs, warriors, finals") + '"}',
        success: function (data) {
          console.log(Object.size(data))
          console.log(data)
        },
        error: function (result) {
          console.log("hmm?")
        }
        // complete: function () {
        //   setTimeout(update_map, 5000)
        // }
      });
    }

    // update_map(100, "jurassic");

    function update_candidates(group_val, individual) {
      $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/candidates",
        dataType: "json",
        async: true,
        data: '{"group" :"' + group_val + '", "individual" :"' + individual + '"}',
        success: function (results) {
          data = results['data'];
          console.log(results)
          create_stacks(data)
        },
        error: function (result) {
          console.log("hmm?")
        }
        // complete: function () {
        //   setTimeout(update_map, 5000)
        // }
      });
    }
    update_candidates("top","");

    function generate_word_cloud(data) {
        var fill = d3.scale.category20();
        d3.layout.cloud().size([960, 600])
            .words(data)
            .padding(5)
            .rotate(function() { return ~~(Math.random() * 2) * 90; })
            .font("Impact")
            .fontSize(function(d) { return d.size; })
            .on("end", draw)
            .start();
        function draw(words) {
          d3.select("body").append("svg")
              .attr("width", 960)
              .attr("height", 960)
            .append("g")
              .attr("transform", "translate(480,300)")
            .selectAll("text")
              .data(words)
            .enter().append("text")
              .style("font-size", function(d) { return d.size + "px"; })
              .style("font-family", "Impact")
              .style("fill", function(d, i) { return fill(i); })
              .attr("text-anchor", "middle")
              .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
              })
              .text(function(d) { return d.text; });
        }
    }

    function return_candidate_img_src(name) {
      name = "static/img/candidates/" + name.toLowerCase().replace(" ", "-") + ".jpg";
      return name;
    }
