const mapData = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';
const educationData = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';

// The svg
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
var path = d3.geoPath();
var projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305])

// Data and color scale
var colorScale = d3.scaleThreshold()
    .domain([10, 15, 20, 25, 30, 35, 50 ,70, 80])
    .range(d3.schemeBlues[9]);

// Load external data and wait
d3.queue()
    .defer(d3.json, mapData)
    .defer(d3.json, educationData)
    .await(ready);

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
        .attr("d", path);

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

    return svg.node();
}