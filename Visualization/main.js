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

  svg.on("click", addFootball);
  function addFootball() {
    svg.append("image")
      .attr("href", "football.png")
      .attr("width", 40)
      .attr("height", 40)
      .attr("x", WIDTH - 50)
      .attr("y", HEIGHT / 2 - 45)
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .attr("x", -50)
      .style("opacity", 1)
      .on("end", function() {
        d3.select(this)
          .transition()
          .duration(1000)
          .attr("x", -50)
          .remove();
      });  
    }

  svg
    .selectAll("g")
    .data(dataForYear)
    .join(
      enter => {

        const G = enter.append("g")

        G.append("rect")
          .attr("class", "rectFieldGoal")
          .attr("x", (_, i) => (i % 6) * (WIDTHVIS / 6) + MARGIN.left)
          .attr("y", (_, i) => Math.floor(i / 6) * (HEIGHTVIS / Math.ceil(dataForYear.length / 6)) + MARGIN.top)
          .attr("width", 0)
          .attr("height", 0)
          .attr("stroke", "white")
          .attr("stroke-width", 2)
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
        .text("Año: " + year)
 
        
        update.selectAll("rect")
          .attr("class", ".rectFieldGoal")
          .data(dataForYear, (d) => d.distance)
          .transition()
          .duration(500)
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

d3.csv(KICKERS_DATABASE)
  .then((kickers) => {
    const kickersPercentages = calculateFieldGoalPercentages(kickers);
    let currentYearIndex = 0;
    function runHeatMap() {
      heatMapKickers(kickersPercentages, currentYearIndex);
      currentYearIndex = (currentYearIndex + 1) % kickersPercentages.length;
    }
    runHeatMap();
    setInterval(runHeatMap, 1000);
  })
  .catch((error) => console.log(error))

d3.csv(DRAFT_DATABASE)
    .then((draft) => {
      console.log(draft)
      //createScatterPlot(draft)
  })
  .catch((error) => console.log(error)); 

