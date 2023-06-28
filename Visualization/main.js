DRAFT_DATABASE = "https://gist.githubusercontent.com/kunafuego/106a696e84cbd056e4e2c6a2cc6e8387/raw/db12d21344c086a6e1c6a4e8b769e086e62043bf/draft.csv";
KICKERS_DATABASE = "https://gist.githubusercontent.com/Sancauid/aee1813abb6fa4021006d6e5730ceac3/raw/74b87d4d8e9177b8987447d8009e089448c98e4c/kickers.csv";
TEAMS_DATABASE = "https://gist.githubusercontent.com/Sancauid/c79a546a512ab67dfcf6a2c61923c8e7/raw/8cdd1cd9bb3726ac86fe0484966201571d51e199/teams.csv";

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
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

const svg3 = d3.select("#bubbleplot")
    .attr("width", WIDTH)
    .attr("height", HEIGHT - 40);

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
      invertOrder();
      });

      
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

const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
.range(d3.schemeCategory10.concat(["#FF0010", "#10FF00", "#0012FF", "#FF00FF"]));

const svg2 = d3.select("#scatterplot")
  .attr("width", WIDTH)
  .attr("height", HEIGHT - 40)

function scatterPlotDraft(dataDraftUnfiltered, filtroEquipo) {

  const dataDraft = dataDraftUnfiltered.map(d => ({
    ...d,
    wAV: d.wAV !== "" ? d.wAV : 0
  }));
  
  const xScale = d3.scaleLinear()
    .domain([0, 254])
    .range([MARGIN.left, INNER_WIDTH]);
  
  const yScale = d3.scaleLinear()
    .domain([0, 190])
    .range([INNER_HEIGHT, MARGIN.top]);

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);
  
  const textData = ["Player", "Position", "Weighted Avg. Value", "Team Drafting", "Pick Number"];
  const textYPositions = [20, 40, 60, 80, 100];

  console.log(dataDraft)
  console.log(filtroEquipo)

  svg2
    .selectAll("g")
    .data(dataDraft, d => d.Pick)
    .join(

      enter => {

        const G = enter.append("g");

        G.append("circle")
          .data(dataDraft, d => d.Pick)
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

        G.append("text")
          .attr("class", "x-axis-label")
          .attr("x", WIDTH / 2)
          .attr("y", HEIGHT - MARGIN.bottom)
          .attr("text-anchor", "middle")
          .style("fill", "black")
          .style("background-color", "rgba(255, 255, 255, 0.8)")
          .text("Pick Number");

        G.append("text")
          .attr("class", "y-axis-label")
          .attr("x", 80)
          .attr("y", 30)
          .attr("text-anchor", "middle")
          .style("fill", "black")
          .style("background-color", "rgba(255, 255, 255, 0.8)")
          .text("Weighted Avg. Value");

        G.append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0, ${INNER_HEIGHT})`)
          .call(xAxis);

        G.append("g")
          .attr("class", "y-axis")
          .attr("transform", `translate(${MARGIN.left}, 0)`)
          .call(yAxis);

        const tooltip = enter
          .append("g")
          .attr("class", "tooltip")
          .style("display", "none");

        tooltip.append("rect")
          .attr("class", "tooltipRect")
          .attr("width", 240)
          .attr("height", 110)
          .attr("x", 90)
          .attr("y", 50)
          .attr("fill", "white")
          .attr("stroke", "black");

        tooltip.selectAll("text")
          .attr("class", "tooltipText")
          .data(textData)
          .enter()
          .append("text")
          .attr("x", 100)
          .attr("y", (d, i) => textYPositions[i] + 50)
          .text(d => d);

        return G;

      },

      update => {
        
        update.selectAll(".playerDots")
          .data(dataDraft, d => d.Pick)
          .style("opacity", d => (filtroEquipo === false || d.Tm === filtroEquipo) ? 1 : 0)
          .each(function(d) {
            if (filtroEquipo === false || d.Tm === filtroEquipo) {
              d3.select(this).style("display", "block");
            } else {
              d3.select(this).style("display", "none");
            }
          });

            
      return update;

      },
      exit => {

        exit.selectAll(".playerDots")
        .remove();
      
      return exit;
    }
    );

  const zoom = d3.zoom()
    .scaleExtent([1, 20])
    .translateExtent([[0, 0], [WIDTH, HEIGHT]])
    .on("zoom", handleZoom);

  svg2.call(zoom);

  function handleZoom(event) {
      
    const transform = event.transform;

    svg2.selectAll(".playerDots")
      .transition()
      .duration(200)
      .attr("transform", transform);

    svg2.selectAll(".x-axis")
      .call(xAxis.scale(transform.rescaleX(xScale)));

    svg2.selectAll(".y-axis")
      .call(yAxis.scale(transform.rescaleY(yScale)));
  }

  svg2.on("click", () => {
    scatterPlotDraft(dataDraftUnfiltered, false);
    bubblePlotTeams(teamsWithWav, draftData);
    });

}

function bubblePlotTeams(dataTeams, draft) {

  svg3.on("dblclick", function(d) 
  { d3.selectAll(".teamBubbles").attr("stroke", "none");
    d3.selectAll(".teamBubbles").attr("opacity", "1");
    scatterPlotDraft(draft, false)
 })

  const colorScale = d3.scaleOrdinal()
    .domain(dataTeams.map(d => d.Tm))
    .range([
      "#97233F", // Arizona Cardinals
      "#A71930", // Atlanta Falcons
      "#241773", // Baltimore Ravens
      "#00338D", // Buffalo Bills
      "#0085CA", // Carolina Panthers
      "#0B162A", // Chicago Bears
      "#FB4F14", // Cincinnati Bengals
      "#311D00", // Cleveland Browns
      "#041E42", // Dallas Cowboys
      "#002244", // Denver Broncos
      "#0076B6", // Detroit Lions
      "#203731", // Green Bay Packers
      "#002C5F", // Indianapolis Colts
      "#101820", // Jacksonville Jaguars
      "#E31837", // Kansas City Chiefs
      "#A5ACAF", // Las Vegas Raiders
      "#003594", // Los Angeles Rams
      "#008E97", // Miami Dolphins
      "#4F2683", // Minnesota Vikings
      "#002244", // New England Patriots
      "#000000", // New Orleans Saints
      "#0B2265", // New York Giants
      "#004C54", // New York Jets
      "#008E97", // Philadelphia Eagles
      "#FFB612", // Pittsburgh Steelers
      "#4B92DB", // San Francisco 49ers
      "#AA0000", // Seattle Seahawks
      "#773141", // Tampa Bay Buccaneers
      "#0076B6", // Tennessee Titans
      "#773141"  // Washington Football Team
    ]);

  const xScale = d3.scaleLinear()
    .domain([-10, d3.max(dataTeams, d => parseInt(d.wAVSum) + 20)])
    .range([MARGIN.left, INNER_WIDTH]);
  
  const yScale = d3.scaleLinear()
    .domain([d3.min(dataTeams, d => parseFloat(d.WLPer)) - 0.05, d3.max(dataTeams, d => parseFloat(d.WLPer))])
    .range([INNER_HEIGHT, MARGIN.top]);

  const widthScale = d3.scaleLinear()
    .domain([d3.min(dataTeams, d => parseFloat(d.YearsActive)), d3.max(dataTeams, d => parseFloat(d.YearsActive))])
    .range([100, 350]);
  
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  svg3
    .selectAll("g")
    .data(dataTeams)
    .join(
      enter => {

        const G = enter.append("g");

        const circles = G.append("circle")
          .attr("class", "teamBubbles")
          .attr("cx", d => xScale(parseInt(d.wAVSum)))
          .attr("cy", d => yScale(parseFloat(d.WLPer)))
          .attr("r", d => widthScale(parseFloat(d.YearsActive)) / 15)
          .attr("fill", d => colorScale(d.Tm))
          .attr("stroke", "none")
          .attr("opacity", "1")
          .on("click", (event, d) => {
            d3.selectAll(".teamBubbles").attr("stroke", "none");
            d3.selectAll(".teamBubbles").attr("opacity", "0.2");
            d3.select(event.currentTarget).attr("stroke", "black");
            d3.select(event.currentTarget).attr("opacity", "1");
            d3.select(event.currentTarget).attr("stroke-width", 3);
            d3.select(event.currentTarget).raise();
            scatterPlotDraft(draft, d.Tm)
          })
          .append("title")
          .text(d => `${d.Tm}\nWinning Percentage: ${d.WLPer}\nwAV Draft Value: ${d.wAVSum}\nYears Active: ${d.YearsActive}`);
                      

        enter.append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0, ${INNER_HEIGHT})`)
          .call(xAxis);

        enter.append("g")
          .attr("class", "y-axis")
          .attr("transform", `translate(${MARGIN.left}, 0)`)
          .call(yAxis);

        G.append("text")
          .attr("class", "x-axis-label")
          .attr("x", WIDTH / 2)
          .attr("y", HEIGHT - MARGIN.bottom)
          .attr("text-anchor", "middle")
          .style("fill", "black")
          .style("background-color", "rgba(255, 255, 255, 0.8)")
          .text("wAV Acquired 2000 Draft");

        G.append("text")
          .attr("class", "y-axis-label")
          .attr("x", 80)
          .attr("y", 30)
          .attr("text-anchor", "middle")
          .style("fill", "black")
          .style("background-color", "rgba(255, 255, 255, 0.8)")
          .text("Win-Loss Percentage");
      },

      update => {

        update.selectAll(".teamBubbles")
          .attr("stroke", "none")
          .attr("opacity", "1")
        

        return update;

      },

      exit => {

        exit.selectAll(".teamBubbles")
        .remove();

        return exit;
      }
    );
}

let draftData;

function addTeamInfoToDraftArray(teamsArray, draftArray) {
  const wAVSumByTeam = teamsArray.reduce((acc, team) => {
    const teamName = team.Tm;
    const wAVSum = draftArray
      .filter(player => player.Tm === teamName)
      .reduce((sum, player) => sum + (isNaN(parseInt(player.wAV)) ? 0 : parseInt(player.wAV)), 0);
    return acc.set(teamName, wAVSum);
  }, new Map());

  const teamsSet = new Set(teamsArray.map(team => team.Tm));

  teamsSet.forEach(teamName => {
    const wAVSum = wAVSumByTeam.get(teamName) || 0;
    const team = teamsArray.find(team => team.Tm === teamName);
    if (team) {
      team.wAVSum = wAVSum.toString();
    }
  });

  return teamsArray;
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
      draftData = draft;
      scatterPlotDraft(draft, false)
  })
  .catch((error) => console.log(error));

  d3.csv(TEAMS_DATABASE)
  .then((teams) => {
      const updatedTeams = teams.map((team) => {
      const fromYear = parseInt(team.From);
      const toYear = parseInt(team.To);
      const yearsActive = toYear - fromYear + 1;
      return { ...team, YearsActive: yearsActive.toString() };
    });
    d3.csv(DRAFT_DATABASE)
    .then((draft) => {
      teamsWithWav = addTeamInfoToDraftArray(updatedTeams, draft)
      bubblePlotTeams(teamsWithWav, draft);
    })
    .catch((error) => console.log(error));
  })
  .catch((error) => console.log(error));

