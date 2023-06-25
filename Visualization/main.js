HERRAMIENTAS_DATABASE = "https://gist.githubusercontent.com/Hernan4444/a61e71b1ce1befeda0d005500bb42b51/raw/225fc163ae07a92f776bca88bc4541d799e0069b/herramientas.json";
TUPLAS_DATABASE = "https://gist.githubusercontent.com/Hernan4444/a61e71b1ce1befeda0d005500bb42b51/raw/225fc163ae07a92f776bca88bc4541d799e0069b/herramientas_en_comun.csv";

const WIDTH = 800;
const HEIGHT = 600;

const svg = d3.select("#vis")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

// COMPLETAR CON CÓDIGO JS y D3.JS NECESARIO


// Márgenes de los bordes
const MARGIN = {
    top: 50,
    bottom: 70,
    right: 20,
    left: 60,
  };
  
// Cuánto es la altura y ancho de la visualización
const HEIGHTVIS = HEIGHT - MARGIN.top - MARGIN.bottom;
const WIDTHVIS = WIDTH - MARGIN.right - MARGIN.left;

// Función encargada de plotear todo
function joinDeDatos(datos, datos2) {

    // Hacemos el eje x, con su rango de valores
    const escala_x = d3.scaleLinear()
      .domain([0, 36000])
      .range([MARGIN.left, WIDTH - MARGIN.right]);
    // Lo mismo pero con el eje y
    const escala_y = d3.scaleLinear()
      .domain([0, 43000])
      .range([HEIGHT - MARGIN.bottom, MARGIN.top]);
    // Definimos en que parte van en el gráfico
    const ejeX = d3.axisBottom(escala_x);
    const ejeY = d3.axisLeft(escala_y);
    
    // Ponemos la línea horizontal
    svg
      .append("g")
      .attr("transform", `translate(0, ${HEIGHTVIS + MARGIN.top})`)
      .call(ejeX)
      .selectAll("text")
      .attr("font-size", 10);
    // Ponemos la línea vertical
    svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left}, 0)`)
      .call(ejeY)
      .selectAll("text")
      .attr("font-size", 10);
    // El primer texto
    svg
    .append("text")
    .attr("x", WIDTH - MARGIN.right * 8)
    .attr("y", HEIGHT-15)
    .attr("text-anchor", "middle")
    .text("Personas que desean utilizar esta herramienta");
    // El segundo texto
    svg
    .append("text")
    .attr("x", 0 + MARGIN.right * 9)
    .attr("y", MARGIN.top - 25)
    .attr("text-anchor", "middle")
    .text("Personas que utilizan actualmente esta herramienta");

    // Definimos la grilla
    const gridGroup = svg.append("g")
    .attr("class", "grid");
    // las líneas horizontales
    gridGroup.selectAll(".horizontal")
      .data(escala_y.ticks())
      .enter()
      .append("line")
      .attr("class", "horizontal")
      .attr("x1", MARGIN.left)
      .attr("y1", d => escala_y(d))
      .attr("x2", WIDTH - MARGIN.right)
      .attr("y2", d => escala_y(d))
      .attr("stroke", "black")
      .attr("stroke-dasharray", "2,2")
      .attr("stroke-opacity", 0.2);
    // las líneas verticales
    gridGroup.selectAll(".vertical")
      .data(escala_x.ticks())
      .enter()
      .append("line")
      .attr("class", "vertical")
      .attr("x1", d => escala_x(d))
      .attr("y1", MARGIN.top)
      .attr("x2", d => escala_x(d))
      .attr("y2", HEIGHT - MARGIN.bottom)
      .attr("stroke", "black")
      .attr("stroke-dasharray", "2,2")
      .attr("stroke-opacity", 0.2);

    // Creamos las líneas en base a ambos datos
    const lines = svg.selectAll(".line")
      .data(datos2.map((d) => {
        const x1 = parseInt(datos.find((item) => item.id === parseInt(d.nodo_1))?.desean);
        const y1 = parseInt(datos.find((item) => item.id === parseInt(d.nodo_1))?.trabajando);
        const x2 = parseInt(datos.find((item) => item.id === parseInt(d.nodo_2))?.desean);
        const y2 = parseInt(datos.find((item) => item.id === parseInt(d.nodo_2))?.trabajando);
        const t1 = d.usuarios_en_comun;
        return { x1, y1, x2, y2, t1 };
        }))
    
        .join(
          enter => enter.append("line")
            .attr("class", "line")
            .attr("x1", d => escala_x(d.x1))
            .attr("y1", d => escala_y(d.y1))
            .attr("x2", d => escala_x(d.x2))
            .attr("y2", d => escala_y(d.y2))
            .attr("stroke", "grey")
            .attr("stroke-opacity", 0.7)
            .attr("stroke-width", d => d.t1 * 0.0004)
            .on("mouseover", function(d) {
              d3.select(this).attr("stroke", "magenta");
            })
            .on("mouseout", function(d) {
              d3.select(this).attr("stroke", "grey");
            }),
          update => update
            .attr("x1", d => escala_x(d.x1))
            .attr("y1", d => escala_y(d.y1))
            .attr("x2", d => escala_x(d.x2))
            .attr("y2", d => escala_y(d.y2))
            .attr("stroke-width", d => d.t1 * 0.0004),
          exit => exit.remove()
        );

    // Definimos la escala de colores
    const colorScale = d3.scaleOrdinal()
      .domain(datos.map(d => d.categoria))
      .range(d3.schemeCategory10);
    // Creamos los puntos en el gráfico en base a los datos y los pintamos dependiendo de la categría
    const circles = svg.selectAll("circle")
      .data(datos)
      .join(
        (enter) => {
            enter
              .append("circle")
              .attr("cx", d => escala_x(d.desean))
              .attr("cy", d => escala_y(d.trabajando))
              .attr("r", 8)
              .attr("fill", d => colorScale(d.categoria))
              .attr("stroke", "black")
        },
        (exit) => exit.remove()
    );
    
    // Definimos la leyenda y dónde va
    const legendGroup = svg.append("g")
      .attr("transform", `translate(${MARGIN.left * 6 - 5}, ${MARGIN.top / 2 - 10})`);
    // Vemos los valores de cada texto en la leyenda
    const nombres = ["Lenguaje", "Tecnologias", "Base de Datos", "Frameworks"];
    const legendItem = legendGroup.selectAll(".legend-item")
      .data(nombres)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(${i * 120}, 0)`);
    // Hacemos los cuadrados pequeños que indican el color
    legendItem.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", colorScale);
    // El texto corresondiente a cada cuadrado
    legendItem.append("text")
      .attr("x", 18)
      .attr("y", 10)
      .text(d => d)
      .style("font-size", "12px");

  }

d3.csv("https://gist.githubusercontent.com/kunafuego/106a696e84cbd056e4e2c6a2cc6e8387/raw/db12d21344c086a6e1c6a4e8b769e086e62043bf/draft.csv")
    .then((datos) => {
    console.log(datos);
  })
  .catch((error) => console.log(error)); 

d3.csv("https://gist.githubusercontent.com/kunafuego/106a696e84cbd056e4e2c6a2cc6e8387/raw/db12d21344c086a6e1c6a4e8b769e086e62043bf/kickers.csv")
    .then((datos) => {
    console.log(datos);
  })
  .catch((error) => console.log(error)); 
