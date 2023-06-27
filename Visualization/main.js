DRAFT_DATABASE = "https://gist.githubusercontent.com/kunafuego/106a696e84cbd056e4e2c6a2cc6e8387/raw/db12d21344c086a6e1c6a4e8b769e086e62043bf/draft.csv";
KICKERS_DATABASE = "https://gist.githubusercontent.com/Sancauid/aee1813abb6fa4021006d6e5730ceac3/raw/74b87d4d8e9177b8987447d8009e089448c98e4c/kickers.csv";

const WIDTH = 1200;
const HEIGHT = 600;

const MARGIN = {
    top: 50,
    bottom: 70,
    right: 20,
    left: 40,
  };
  
const HEIGHTVIS = HEIGHT - MARGIN.top - MARGIN.bottom;
const WIDTHVIS = WIDTH - MARGIN.right - MARGIN.left;


function heatMapKickers(kickersPercentages, currentYearIndex) {

  const dataForYear = kickersPercentages[currentYearIndex].fieldGoalPercentages;
  const year = kickersPercentages[currentYearIndex].year;

  const svg = d3.select("#heatmap")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

  const colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
      .domain([0.2, 1]);   

  svg.append("image")
      .attr("href", "post.png")
      .attr("x", 0)
      .attr("y", HEIGHT / 2 - 50)

  const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("top", "750px")

  svg.on("click", function() {
      addFootball();
      invertOrder();
      });

      function addFootball() {
        const initialX = (order === 1) ? -50 : WIDTH - 50;
        const finalX = (order === 1) ? WIDTH - 50 : -50;
      
        svg.append("image")
          .attr("href", "football.png")
          .attr("width", 40)
          .attr("height", 40)
          .attr("x", initialX)
          .attr("y", HEIGHT / 2 - 45)
          .style("opacity", 0)
          .transition()
          .duration(1000)
          .attr("x", finalX)
          .style("opacity", 1)
          .on("end", function() {
            d3.select(this).remove();
          });
      }
      
  svg
    .selectAll("g")
    .data(dataForYear)
    .join(
      enter => {

        const G = enter.append("g")

        G.append("rect")
          .data(dataForYear, (d) => d.distance)
          .attr("class", "rectFieldGoal")
          .attr("x", (_, i) => (i % 6) * (WIDTHVIS / 6) + MARGIN.left)
          .attr("y", (_, i) => Math.floor(i / 6) * (HEIGHTVIS / Math.ceil(dataForYear.length / 6)) + MARGIN.top)
          .attr("opacity", 0.8)
          .attr("stroke", "white")
          .attr("stroke-width", 2)
          .on("mouseover", function(event, d){
            stopTimer();
            tooltip
            .text("Percentage of Field Goals Made: " + (d.percentage * 100).toFixed(1) + "%")
            .style("left", "50%")
            .style("transform", "translateX(-50%)")
            .style("opacity", 1);
            d3.select(this).attr("stroke", "black");
            d3.select(this).attr("stroke-width", 4);
            d3.select(this.parentNode).raise();
            d3.select(this.parentNode).select(".textFieldGoal")
            .style("fill", "black")
            .style("stroke", "white")
            .style("stroke-width", "1px");
            })
          .on("mouseout", function(event, d){
            resumeTimer();
            tooltip
            .style("opacity", 0);
            d3.select(this).attr("stroke", "white");
            d3.select(this).attr("stroke-width", 2);
            d3.select(this).attr("opacity", 0.8);
            d3.select(this).style("z-index", "auto");
            d3.select(this.parentNode).select(".textFieldGoal")
            .style("fill", "white")
            .style("stroke", "black")
            .style("stroke-width", "0.5px");
          })
          .transition()
          .attr("width", WIDTHVIS / 6)
          .attr("height", HEIGHTVIS / Math.ceil(dataForYear.length / 6))
          .attr("fill", (d) => colorScale(parseFloat(d.percentage)));

        G.append("text")
          .attr("class", "textFieldGoal")
          .attr("x", (_, i) => (i % 6) * (WIDTHVIS / 6) + MARGIN.left + (WIDTHVIS / 12))
          .attr("y", (_, i) => Math.floor(i / 6) * (HEIGHTVIS / Math.ceil(dataForYear.length / 6)) + MARGIN.top + (HEIGHTVIS / (6 * Math.ceil(dataForYear.length / 6))))
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .style("font-size", "36px")
          .style("font-weight", "bold")
          .style("fill", "white")
          .style("stroke", "black")
          .style("stroke-width", "0.5px")
          .text((d) => d.distance);

        G.append("text")
          .attr("class", "textYear")
          .attr("x", WIDTH / 2)
          .attr("y", MARGIN.top / 2)
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
          .text("Año: " + year)
          .style("fill", "black")
          .style("font-size", "16px")

      },
      
      update => {

        update.selectAll(".textYear")
          .transition()
          .duration(200)
          .text("Año: " + year)
 
        
        update.selectAll("rect")
          .attr("class", ".rectFieldGoal")
          .data(dataForYear, (d) => d.distance)
          .transition()
          .duration(200)
          .attr("fill", (d) => colorScale(parseFloat(d.percentage)))
        
      },

      exit => {

        exit.selectAll("rect").remove();
        exit.selectAll("text").remove();   
      }
    )
}

function calculateFieldGoalPercentages(data) {
  const results = data.map(entry => {
    const year = entry.Year;
    const fgDistances = [
      { distance: "0-19", percentage: parseFloat(entry["FGM0-19"]) / parseFloat(entry["FGA0-19"]) },
      { distance: "20-29", percentage: parseFloat(entry["FGM20-29"]) / parseFloat(entry["FGA20-29"]) },
      { distance: "30-39", percentage: parseFloat(entry["FGM30-39"]) / parseFloat(entry["FGA30-39"]) },
      { distance: "40-49", percentage: parseFloat(entry["FGM40-49"]) / parseFloat(entry["FGA40-49"]) },
      { distance: "50+", percentage: parseFloat(entry["FGM50+"]) / parseFloat(entry["FGA50+"]) },
      { distance: "Total", percentage: parseFloat(entry["FGMTot"]) / parseFloat(entry["FGATot"]) }
    ];
    return {
      year: year,
      fieldGoalPercentages: fgDistances,
    };
  });
  return results;
}

let intervalId;
let kickersPercentages;
let currentYearIndex;
let order = 1;

function stopTimer() {
  clearInterval(intervalId);
}

function resumeTimer() {
  intervalId = setInterval(runHeatMap, 500);
}

function invertOrder() {
  if (order == -1){
    order = 1;
  }
  else {
    order = -1;
  }
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function runHeatMap() {
  currentYearIndex = mod(currentYearIndex + order, kickersPercentages.length);
  heatMapKickers(kickersPercentages, currentYearIndex);
}



function scatterPlotDraft(dataDraftUnfiltered) {
  const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
  const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

  const dataDraft = dataDraftUnfiltered.map(d => ({
    ...d,
    wAV: d.wAV !== "" ? d.wAV : 0
  }));

  const svg2 = d3.select("#scatterplot")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  const xScale = d3.scaleLinear()
    .domain([0, dataDraft.length])
    .range([MARGIN.left, INNER_WIDTH]);
  
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataDraft, d => parseInt(d.wAV)) + 5])
    .range([INNER_HEIGHT, MARGIN.top]);

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);
  
  const textData = ["Player", "Position", "Weighted Avg. Value", "Team Drafting", "Pick Number"];
  const textYPositions = [20, 40, 60, 80, 100];

  svg2
    .selectAll("g")
    .data(dataDraft)
    .join(enter => {
        
      const G = enter.append("g");

      G.append("circle")
        .data(dataDraft)
        .attr("class", "playerDots")
        .attr("cx", d => xScale(d.Pick))
        .attr("cy", d => yScale(parseInt(d.wAV)))
        .attr("r", 5)
        .attr("fill", d => colorScale(d.Pos))
        .on("mouseover", (event, d) => {
          tooltip.style("display", "block")

          tooltip.selectAll("text")
            .text((text, index) => {
              switch (index) {
                case 0:
                  return `Player: ${d.Player}`;
                case 1:
                  return `Position: ${d.Pos}`;
                case 2:
                  return `Weighted Avg. Value: ${d.wAV}`;
                case 3:
                  return `Team Drafting: ${d.Tm}`;
                case 4:
                  return `Pick Number: ${d.Pick}`;
                default:
                  return "";
              }
            });
        })
        .on("mouseout", () => {
          tooltip.style("display", "none");
        });

      enter.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${INNER_HEIGHT})`)
        .call(xAxis);

      enter.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${MARGIN.left}, 0)`)
        .call(yAxis);

      const tooltip = enter
        .append("g")
        .attr("class", "tooltip")
        .style("display", "none");

      tooltip.append("rect")
        .attr("width", 240)
        .attr("height", 110)
        .attr("x", 60)
        .attr("y", 60)
        .attr("fill", "white")
        .attr("stroke", "black");

      tooltip.selectAll("text")
        .data(textData)
        .enter()
        .append("text")
        .attr("x", 70)
        .attr("y", (d, i) => textYPositions[i] + 60)
        .text(d => d);
    });
}



d3.csv(KICKERS_DATABASE)
  .then((kickers) => {
    kickersPercentages = calculateFieldGoalPercentages(kickers);
    currentYearIndex = 0;
    intervalId = setInterval(runHeatMap, 500);
  })
  .catch((error) => console.log(error))

d3.csv(DRAFT_DATABASE)
    .then((draft) => {
      scatterPlotDraft(draft)
  })
  .catch((error) => console.log(error));
