DRAFT_DATABASE = "https://gist.githubusercontent.com/kunafuego/106a696e84cbd056e4e2c6a2cc6e8387/raw/db12d21344c086a6e1c6a4e8b769e086e62043bf/draft.csv";
KICKERS_DATABASE = "https://gist.githubusercontent.com/Sancauid/aee1813abb6fa4021006d6e5730ceac3/raw/74b87d4d8e9177b8987447d8009e089448c98e4c/kickers.csv";

const WIDTH = 1200;
const HEIGHT = 600;

const svg = d3.select("#heatmap")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

const MARGIN = {
    top: 50,
    bottom: 70,
    right: 20,
    left: 20,
  };
  
const HEIGHTVIS = HEIGHT - MARGIN.top - MARGIN.bottom;
const WIDTHVIS = WIDTH - MARGIN.right - MARGIN.left;

function heatMapKickers(kickersPercentages) {

  let currentYearIndex = 0;

  const svg = d3.select("#heatmap")
      .append("svg")
      .attr("width", WIDTH)
      .attr("height", HEIGHT)
      .append("g")

  function updateHeatmap() {
      const dataForYear = kickersPercentages[currentYearIndex].fieldGoalPercentages;
    
      svg.selectAll("rect").remove();
      svg.selectAll("text").remove();

      const colorScale = d3.scaleSequential(d3.interpolateRdBu)
      .domain([1, 0.2]);

    const rects = svg.selectAll("rect")
      .data(dataForYear, (d) => d.distance)
      .enter()
      .append("rect")
      .attr("x", (_, i) => (i % 6) * (WIDTHVIS / 6) + MARGIN.left)
      .attr("y", (_, i) => Math.floor(i / 6) * (HEIGHTVIS / Math.ceil(dataForYear.length / 6)) + MARGIN.top)
      .attr("width", WIDTHVIS / 6)
      .attr("height", HEIGHTVIS / Math.ceil(dataForYear.length / 6))
      .attr("fill", (d) => colorScale(parseFloat(d.percentage)))
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    svg.selectAll("text")
      .data(dataForYear, (d) => d.distance)
      .enter()
      .append("text")
      .attr("x", (_, i) => (i % 6) * (WIDTHVIS / 6) + MARGIN.left + (WIDTHVIS / 12))
      .attr("y", (_, i) => Math.floor(i / 6) * (HEIGHTVIS / Math.ceil(dataForYear.length / 6)) + MARGIN.top * 9.5 + (HEIGHTVIS / (6 * Math.ceil(dataForYear.length / 6))))
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text((d) => d.distance);

    const yearText = svg.append("text")
      .attr("x", WIDTH / 2)
      .attr("y", MARGIN.top / 2)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .text(kickersPercentages[currentYearIndex].year)
      .style("fill", "black")
      .style("font-size", "16px");

      yearText.transition()
      .duration(1000)
      .style("opacity", 0)
      .on("end", function () {
        d3.select(this)
          .text(kickersPercentages[currentYearIndex].year)
          .transition()
          .duration(1000)
          .style("opacity", 1);
      }); 

    currentYearIndex = (currentYearIndex + 1) % kickersPercentages.length;
  }

  updateHeatmap();

  setInterval(updateHeatmap, 1000);

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

d3.csv(KICKERS_DATABASE)
    .then((kickers) => {
    console.log(kickers);
    const kickersPercentages = calculateFieldGoalPercentages(kickers);
    heatMapKickers(kickersPercentages);
  })
  .catch((error) => console.log(error));

d3.csv(DRAFT_DATABASE)
    .then((draft) => {
    console.log(draft);
  })
  .catch((error) => console.log(error)); 



