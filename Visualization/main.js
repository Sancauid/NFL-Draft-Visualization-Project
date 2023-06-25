DRAFT_DATABASE = "https://gist.githubusercontent.com/kunafuego/106a696e84cbd056e4e2c6a2cc6e8387/raw/db12d21344c086a6e1c6a4e8b769e086e62043bf/draft.csv";
KICKERS_DATABASE = "https://gist.githubusercontent.com/Sancauid/aee1813abb6fa4021006d6e5730ceac3/raw/74b87d4d8e9177b8987447d8009e089448c98e4c/kickers.csv";

const WIDTH = 800;
const HEIGHT = 600;

const svg = d3.select("#heatmap")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

const MARGIN = {
    top: 50,
    bottom: 70,
    right: 20,
    left: 60,
  };
  
const HEIGHTVIS = HEIGHT - MARGIN.top - MARGIN.bottom;
const WIDTHVIS = WIDTH - MARGIN.right - MARGIN.left;

function heatMap(kickers) {

  const escala_x = d3.scaleLinear()
    .domain([0, 36000])
    .range([MARGIN.left, WIDTH - MARGIN.right]);

  const escala_y = d3.scaleLinear()
    .domain([0, 43000])
    .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

  const ejeX = d3.axisBottom(escala_x);
  const ejeY = d3.axisLeft(escala_y);

  svg
    .append("g")
    .attr("transform", `translate(0, ${HEIGHTVIS + MARGIN.top})`)
    .call(ejeX)
    .selectAll("text")
    .attr("font-size", 10);

  svg
    .append("g")
    .attr("transform", `translate(${MARGIN.left}, 0)`)
    .call(ejeY)
    .selectAll("text")
    .attr("font-size", 10);

  var colorScale = d3
    .scaleLinear()
    .domain([0, d3.max(kickers)])
    .range(["blue", "red"]);
  

  svg.append("g")
    .attr("class", "heatmap")
    .selectAll("rect")
    .data(kickers)
    .enter()
    .append("rect")
    .attr("x", d => escala_x(d))
    .attr("y", d => escala_y(d))
    .attr("width", WIDTH)
    .attr("height", HEIGHT)
    .style("fill", function(d) { return colorScale(d); });
}

d3.csv(DRAFT_DATABASE)
    .then((draft) => {
    console.log(draft);
  })
  .catch((error) => console.log(error)); 

d3.csv(KICKERS_DATABASE)
    .then((kickers) => {
    console.log("Kickers");
    console.log(kickers);
    heatMap(kickers);
  })
  .catch((error) => console.log(error));


