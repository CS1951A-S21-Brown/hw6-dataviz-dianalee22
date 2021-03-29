// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 200};

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2), graph_1_height = 350;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 350;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 350;

// Shared comparator for all graphs
const compare = function(a,b) {
    return parseInt(b.sales) - parseInt(a.sales);
}

// ---------- Graph 1 ----------

let svg1 = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create x,y axes
let x1 = d3.scaleLinear()
    .range([0, graph_1_width - margin.left - margin.right]);

let y1 = d3.scaleBand()
    .range([0, graph_1_height-margin.bottom-margin.top])
    .padding(0.1);

// Set up references
let countRef1 = svg1.append("g");
let y_axis_label1 = svg1.append("g");

// Add title, axes labels 
const count_x1 = graph_1_width/2 - margin.left 
const count_y1 = graph_1_height - margin.top 
svg1.append("text")
    .attr("transform", `translate(${count_x1}, ${count_y1})`)      
    .style("text-anchor", "middle")
    .text("Sales in millions");;

const game_x1 = -1 * margin.left 
const game_y1 = graph_1_height/2 - margin.top 
let y_axis_text1 = svg1.append("text")
    .attr("transform", `translate(${game_x1}, ${game_y1})`)       
    .style("text-anchor", "left")
    .text("Game");

const title_x1 = graph_1_width/2 - margin.left 
const title_y1 = -1 * margin.top + 15
let title1 = svg1.append("text")
    .attr("transform", `translate(${title_x1}, ${title_y1})`)
    .style("text-anchor", "middle")
    .style("font-size", 15);



function setData1() {
    d3.csv("../data/video_games.csv").then(function(data) {
        data = cleanData1(data, compare, NUM_EXAMPLES);

        // Update x,y axes
        x1.domain([0, d3.max(data, function(d){return parseInt(d.sales)})]);
        y1.domain(data.map(entry => entry.name));
        // Render y axis
        y_axis_label1.call(d3.axisLeft(y1).tickSize(0).tickPadding(10));

        // Color 
        let color = d3.scaleOrdinal()
            .domain(data.map(function(d) { return d.name }))
            .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), NUM_EXAMPLES));

        // Render bars
        let bars = svg1.selectAll("rect").data(data);
        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("fill", function(d) { return color(d.name) })
            .attr("x", x1(0))
            .attr("y", function(d) { return y1(d.name) })               
            .attr("width", function(d) { return x1(d.sales) })
            .attr("height",  y1.bandwidth());  
        
        // Render counts
        let counts = countRef1.selectAll("text").data(data);
        counts.enter()
            .append("text")
            .merge(counts)
            .transition()
            .duration(1000)
            .attr("x", function(d) { return x1(d.sales) + 10 })      
            .attr("y", function(d) { return y1(d.name) + 12 })       
            .style("text-anchor", "start")
            .text(function(d) { return d.sales });

        // Set title
        title_text = "Top 10 Video Games of All Time in Global Sales";
        title1.text(title_text);

        // Remove elements not in use if fewer groups in new dataset
        bars.exit().remove();
        counts.exit().remove();
    });
}

function cleanData1(data, compare, topn) {
    var simplified = [];
    for (i=0; i<topn; i++) {
        simplified.push({"name": data[i].Name, "sales": parseFloat(data[i]["Global_Sales"])});
    }
    simplified.sort(compare)
    return simplified
}

setData1()

// ---------- Graph 2 ----------
let svg2 = d3.select("#graph2")      
    .append("svg")
    .attr("width", graph_2_width)     
    .attr("height", graph_2_height)     
    .append("g")
    .attr("transform", `translate(${graph_2_width/2}, ${graph_2_height/2})`);

let countRef2 = svg2.append("g");

let tooltip = d3.select("#graph2")
    .append("div")
    .attr("class", "tooltip");

let radius = Math.min(graph_2_height, graph_2_width) / 2.8

const title_x2 = 0
const title_y2 = -1 * graph_2_height/2 + 15
let title2 = svg2.append("text")
    .attr("transform", `translate(${title_x2}, ${title_y2})`)
    .style("text-anchor", "middle")
    .style("font-size", 15);

function setData2(region){
    d3.csv("../data/video_games.csv").then(function(data) {
        data = cleanData2(data, region, compare);

        // Set up pie chart 
        var pie = d3.pie();
        var data_ready = pie(data.map(entry => entry.sales));

        // Tooltip functions 
        let mouseover = function(d) {
            let html = `Genre: ${data[d.index].name}</br>
                    Rank: ${d.index + 1} </br>
                    Sales in millions: ${data[d.index].sales}`;  
    
            tooltip.html(html)
                .style("left", `${(d3.event.pageX) - 220}px`)
                .style("top", `${(d3.event.pageY) - 30}px`)
                .style("background", "#FFFFFF")
                .transition()
                .duration(200)
                .style("opacity", 0.9)
        };

        let mouseout = function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        };
        
        // Drawing pie chart
        var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

        svg2.selectAll('slices')
            .data(data_ready)
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', "rgb(110, 170, 200)")
            .attr("stroke", "black")
            .style("stroke-width", "2px")
            .on("mouseover", mouseover) 
            .on("mouseout", mouseout);

        let counts = countRef2.selectAll("text").data(data_ready);
        counts.enter()
            .append("text")
            .merge(counts)
            .transition()
            .duration(1000)
            .attr("transform", function(d) {
                var c = arc.centroid(d),
                    x = c[0],
                    y = c[1],
                    h = Math.sqrt(x*x + y*y);
                return "translate(" + (x/h * 140) +  ',' +
                (y/h * 140) +  ")"; 
            })
            .attr("text-anchor", function(d) {
                return (d.endAngle + d.startAngle)/2 > Math.PI ?
                    "end" : "start";
            })
            .text(function(d){ return d.data})

        // Title 
        switch(region) {
            case 'Global_Sales':
                title_text = 'Breakdown of Global Sales (in millions) by Video Game Genre'
                break;
            case 'NA_Sales':
                title_text = 'Breakdown of North American Sales (in millions) by Video Game Genre'
                break;
            case 'JP_Sales':
                title_text = 'Breakdown of Japanese Sales (in millions) by Video Game Genre'
                break;
            case 'EU_Sales':
                title_text = 'Breakdown of EU Sales (in millions) by Video Game Genre'
        }
        title2.text(title_text);
    });
}

function cleanData2(data, region, compare) {
    var dict = {};
    for (i=0; i<data.length; i++) {
        d = data[i]
        if (d.Genre in dict) {
            dict[d.Genre] += parseInt(d[region]);
        } else {
            dict[d.Genre] = parseInt(d[region]);
        }

    }

    var simplified = [];
    for (var key in dict) {
        simplified.push({"name": key, "sales": dict[key]});
    }
    simplified.sort(compare);
    return simplified
}

setData2("Global_Sales")

// ---------- Graph 3 ----------
let svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)
    .attr("height", graph_3_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create x,y axes
let x3 = d3.scaleLinear()
    .range([0, graph_3_width - margin.left - margin.right]);

let y3 = d3.scaleBand()
    .range([0, graph_3_height-margin.bottom-margin.top])
    .padding(0.1);

// Set up references to SVG group and y axis label
let countRef3 = svg3.append("g");
let y_axis_label3 = svg3.append("g");

// Add title and axes labels 
const count_x3 = graph_3_width/2 - margin.left 
const count_y3 = graph_3_height - margin.top - 10
svg3.append("text")
    .attr("transform", `translate(${count_x3}, ${count_y3})`)      
    .style("text-anchor", "middle")
    .text("Sales in millions");

const publisher_x3 = -1 * margin.left 
const publisher_y3 = graph_3_height/2 - margin.top
let y_axis_text3 = svg3.append("text")
    .attr("transform", `translate(${publisher_x3}, ${publisher_y3})`)       
    .style("text-anchor", "left")
    .text("Publisher");

const title_x3 = graph_3_width/2 - margin.left 
const title_y3 = -1 * margin.top + 15
let title3 = svg3.append("text")
    .attr("transform", `translate(${title_x3}, ${title_y3})`)
    .style("text-anchor", "middle")
    .style("font-size", 15);

function setData3(genre) {
    d3.csv("../data/video_games.csv").then(function(data) {
        data = cleanData3(data, genre, compare);

        // Update x,y axes
        x3.domain([0, d3.max(data, function(d){return parseInt(d.sales)})]);
        y3.domain(data.map(entry => entry.name));
        
        // Render y axis
        y_axis_label3.call(d3.axisLeft(y3).tickSize(0).tickPadding(10));

        // Color 
        let color = d3.scaleOrdinal()
            .domain(data.map(function(d) { return d.name }))
            .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), NUM_EXAMPLES3));

        // Render bars
        let bars = svg3.selectAll("rect").data(data);
        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("fill", function(d) { return color(d.name) })
            .attr("x", x3(0))
            .attr("y", function(d) { return y3(d.name) })               
            .attr("width", function(d) { return x3(d.sales) })
            .attr("height",  y3.bandwidth());  
        
        // Render counts
        let counts = countRef3.selectAll("text").data(data);
        counts.enter()
            .append("text")
            .merge(counts)
            .transition()
            .duration(1000)
            .attr("x", function(d) { return x3(d.sales) + 10 })       
            .attr("y", function(d) { return y3(d.name) + 12 })      
            .style("text-anchor", "start")
            .text(function(d) { return d.sales });

        // Set title
        title3.text(`Top 10 Publishers in ${genre} Games by Global Sales`);

        // Remove elements not in use if fewer groups in new dataset
        bars.exit().remove();
        counts.exit().remove();

    });

}

function cleanData3(data, genre, compare) {
    var dict = {};
    for (i=0; i<data.length; i++) {
        d = data[i]
        if (d.Genre == genre) {
            if (d.Publisher in dict) {
                dict[d.Publisher] += parseInt(d.Global_Sales);
            } else {
                dict[d.Publisher] = parseInt(d.Global_Sales);
            }
        }
    }

    var simplified = [];
    for (var key in dict) {
        simplified.push({"name": key, "sales": dict[key]});
    }
    simplified.sort(compare)
    return simplified.slice(0, NUM_EXAMPLES3)
}

setData3("Action")