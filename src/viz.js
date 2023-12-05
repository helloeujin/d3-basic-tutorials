import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////
const svg = d3.select("#svg-container").append("svg").attr("id", "svg");
// const g = svg.append("g"); // group

let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height"));
const margin = { top: 30, right: 60, bottom: 60, left: 60 };

// parsing & formatting
const parseTime = d3.timeParse("%Y-%m-%d");
const formatXAxis = d3.timeFormat("%b %Y");

// scale
const xScale = d3.scaleUtc().range([margin.left, width - margin.right]);
const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

// axis
const xAxis = d3
  .axisBottom(xScale)
  .tickFormat((d) => formatXAxis(d))
  .ticks(5)
  .tickSizeOuter(0);

const yAxis = d3.axisLeft(yScale).ticks(5);

// line
const line = d3
  .line()
  .curve(d3.curveCardinal)
  .x((d) => xScale(d.date_parsed))
  .y((d) => yScale(d.Close));

// svg elements
let path, x, y;

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
let data = [];

d3.csv("/data/BTC-USD.csv")
  .then((raw_data) => {
    // data parsing
    data = raw_data.map((d) => {
      d.date_parsed = parseTime(d.Date);
      d.Close = parseInt(d.Close);
      return d;
    });

    //  scale updated
    xScale.domain(d3.extent(data, (d) => d.date_parsed));
    yScale.domain(d3.extent(data, (d) => d.Close));

    // axis
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis);

    // add path
    path = svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#8868cb")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  })
  .catch((error) => {
    console.error("Error loading CSV data: ", error);
  });

////////////////////////////////////////////////////////////////////
////////////////////////////  Resize  //////////////////////////////
window.addEventListener("resize", () => {
  //  width, height updated
  width = parseInt(d3.select("#svg-container").style("width"));
  height = parseInt(d3.select("#svg-container").style("height"));

  //  scale updated
  xScale.range([margin.left, width - margin.right]);
  yScale.range([height - margin.bottom, margin.top]);

  //  line updated
  line.x((d) => xScale(d.date_parsed)).y((d) => yScale(d.Close));

  //  path updated
  path.attr("d", line);

  //  axis updated
  d3.select(".x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  d3.select(".y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis);
});
