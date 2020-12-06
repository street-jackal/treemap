const mapData = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';
const educationData = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';

// The map svg
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
var path = d3.geoPath();
var projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305])

// set tick width for legend
const legendSquareWidth = 40;

// Color scale for map and legend
const legendSquares = [10, 15, 20, 25, 30, 35, 50, 55, 60];
var colorScale = d3.scaleThreshold()
    .domain(legendSquares)
    .range(d3.schemeBlues[9]);

// declare the div for tooltip
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Load external data and wait
d3.queue()
    .defer(d3.json, mapData)
    .defer(d3.json, educationData)
    .await(ready);

// do everything once the json data is loaded
function ready(error, topo, edu) {

    if (error) {
        throw error;
    }

    // Draw the map
    svg.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(topo, topo.objects.counties).features)
        .enter().append("path")
        .attr("class", "county")
        .attr("data-fips", (d => d.id))
        .attr('data-education', function (d) {
            var result = edu.filter(function (obj) {
                return obj.fips === d.id;
            });
            return result[0].bachelorsOrHigher;
        })
        .attr('fill', function (d) {
            // get the bacherlorsOrHigher value from the edu data with fips matching id from county data
            var result = edu.filter(function (obj) {
                return obj.fips === d.id;
            });
            return colorScale(result[0].bachelorsOrHigher);
        })
        .attr("d", path)

        // define mouse actions for tooltip
        .on("mouseover", (d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(
                "County: " + edu[edu.findIndex((item) => item.fips === d.id)].area_name +
                "<br/>State: " + edu[edu.findIndex((item) => item.fips === d.id)].state +
                "<br/>College: " + edu[edu.findIndex((item) => item.fips === d.id)].bachelorsOrHigher + "%")
                .attr("id", "tooltip")
                .attr('data-education', function() {
                    var result = edu.filter(function (obj) {
                        return obj.fips === d.id;
                    });
                    return result[0].bachelorsOrHigher;
                });
            tooltip
                .style("top", (d3.event.pageY - 10) + "px")
                .style("left", (d3.event.pageX + 10) + "px");
        })
        .on("mouseout", (d) => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0)
        });

    // add states outline
    svg.append("path")
        .datum(topojson.mesh(topo, topo.objects.states, (a, b) => a !== b))
        .attr("class", "states")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-linejoin", "round")
        .attr("d", path);

    // add country outline
    svg.append("path")
        .datum(topojson.mesh(topo, topo.objects.nation))
        .attr("class", "nation")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-linejoin", "round")
        .attr("d", path);

    d3.select("body").append("section")
        .append("h2")
        .text("Legend");

    const legend = d3.select("body").append("svg")
        .attr("id", "legend")
        .attr("width", width)
        .attr("height", legendSquareWidth + 50);

    legend.selectAll("rect")
        .data(legendSquares)
        .enter()
        .append("rect")
        .attr("class", "legend")
        .attr("width", legendSquareWidth)
        .attr("height", legendSquareWidth)
        .style("fill", d => colorScale(d))
        .attr("y", 0)
        .attr("x", (d, i) => (width-9*legendSquareWidth)/2 + i * legendSquareWidth);
    legend.selectAll("text")
        .data(legendSquares)
        .enter()
        .append("text")
        .text((d) => d.toFixed(0) + "%")
        .attr("y", 55)
        .attr("x", (d, i) => (width-9*legendSquareWidth)/2 + i * legendSquareWidth + legendSquareWidth/5);
        
    return svg.node();
}