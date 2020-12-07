const mapData = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json';

const fontSize = 12;

// set the dimensions and margins of the graph
var margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 1400 - margin.left - margin.right,
    height = 1400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// declare the div for tooltip
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// set tick width for legend
const legendSquareWidth = 40;

// format text to fit better into squares (thanks to Mike Bostock, developer of d3)
function formatText(selection) {
    selection.each(function () {
        const node = d3.select(this);
        const rectWidth = +node.attr('data-width');
        let word;
        const words = node.text().split(' ').reverse();
        let line = [];
        const x = node.attr('x');
        const y = node.attr('y');
        let tspan = node.text('').append('tspan').attr('x', x).attr('y', y);
        let lineNumber = 0;
        while (words.length > 1) {
            word = words.pop();
            line.push(word);
            tspan.text(line.join(' '));
            const tspanLength = tspan.node().getComputedTextLength();
            if (tspanLength > rectWidth && line.length !== 1) {
                line.pop();
                tspan.text(line.join(' '));
                line = [word];
                tspan = addTspan(word);
            }
        }

        addTspan(words.pop());

        function addTspan(text) {
            lineNumber += 1;
            return (
                node
                    .append('tspan')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('dy', `${lineNumber * fontSize}px`)
                    .text(text)
            );
        }
    });
}

// read json data
d3.json(mapData, function (data) {

    // Give the data to this cluster layout:
    var root = d3.hierarchy(data).sum((d) => d.value) // Here the size of each leave is given in the 'value' field in input data

    // Then d3.treemap computes the position of each element of the hierarchy
    d3.treemap()
        .size([width, height])
        //.paddingTop(28)
        //.paddingRight(7)
        //.paddingInner(3)      // Padding between each rectangle
        //.paddingOuter(6)
        .padding(1)
        (root)

    // prepare a color scale
    var color = d3.scaleOrdinal()
        .domain(data.children.map(d => d.name))
        .range(["#d79921", "#458588", "#b16286", "#689d6a", "#d65d0e"])

    // And a opacity scale
    var opacity = d3.scaleLinear()
        .domain([1559525, 20338986])
        .range([.5, 1])

    // use this information to add rectangles:
    svg
        .selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
        .attr("class", "tile")
        .attr("data-name", (d) => d.data.name)
        .attr("data-category", (d) => d.data.category)
        .attr("data-value", (d) => d.data.value)
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .style("fill", function (d) { return color(d.parent.data.name) })
        .style("opacity", function (d) { return opacity(d.data.value) })

        // define mouse actions for tooltip

        .on("mousemove", () => {
            tooltip
                .style("top", (d3.event.pageY - 10) + "px")
                .style("left", (d3.event.pageX + 10) + "px");
        })

        .on("mouseover", (d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9)
            tooltip.html(
                "Name: " + d.data.name +
                "<br/>Category: " + d.data.category +
                "<br/>Funding: $" + d.data.value)
                .attr("id", "tooltip")
                .attr("data-value", d.data.value)
            tooltip
                .style("top", (d3.event.pageY - 10) + "px")
                .style("left", (d3.event.pageX + 10) + "px");
        })

        .on("mouseout", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // and to add the text labels
    svg
        .selectAll("text")
        .data(root.leaves())
        .enter()
        .append("text")
        .attr("x", function (d) { return d.x0 + 5 })    // +10 to adjust position (more right)
        .attr("y", function (d) { return d.y0 + 20 })    // +20 to adjust position (lower)
        .attr('data-width', (d) => d.x1 - d.x0)
        .text((d) => d.data.name)
        .attr("font-size", `${fontSize}px`)
        .attr("fill", "black")
        .call(formatText);

    // add legend title
    d3.select("body").append("section")
        .append("h2")
        .text("Legend");
    
    // add legend svg
    const legend = d3.select("body").append("svg")
        .attr("id", "legend")
        .attr("width", width)
        .attr("height", legendSquareWidth + 200);

    // add rects to legend with colors that match data
    legend.selectAll("rect")
        .data(root.descendants().filter((d) => d.depth === 1))
        .enter()
        .append("rect")
        .attr("class", "legend-item")
        .attr("width", legendSquareWidth)
        .attr("height", legendSquareWidth)
        .style("fill", (d) => color(d.data.name))
        .attr("y", 0)
        .attr("x", (d, i) => (width - 19 * legendSquareWidth) / 2 + i * legendSquareWidth);

    // add labels to legend
    legend.selectAll("text")
        .data(root.descendants().filter((d) => d.depth === 1))
        .enter()
        .append("text")
        .text((d) => d.data.name)
        .style("fill", (d) => color(d.data.name))
        .attr("y", 45)
        .attr("x", (d, i) => (width - 19 * legendSquareWidth) / 2 + i * legendSquareWidth + legendSquareWidth / 2.8)
        .attr("transform", ((d, i) => "rotate(90, " + ((width - 19 * legendSquareWidth) / 2 + i * legendSquareWidth + legendSquareWidth / 2.8) + ",45)"));
})