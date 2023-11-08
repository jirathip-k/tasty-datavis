/*
Data Visualisation Project: 
Tasty Ingredients Pairing

By Jirathip Kunkanjanathorn
*/
// Define global variables
var nodesData;
var edgesData;
var recipeData;
var fullrecipeData;
var topNodes;
var topNodesCentralityCutoff;
var top30NodesCutoff;
var top30Nodes;
var ingredientsGroup;
var stackedRecipeTemp;
var stackedRecipe;
var seriesRecipe;
var topNodesPosition = {};
var nodeColor = {};
var maxRating;
var selectedNode = "avocado";
var filteredSpider;
var sectionIndex;
var communityXY;

var spiderArcAngle;

var percentScrolled;

// Set up svg width and height
var width = 1080;
const height = 720;

// Set up svg margin
const margin = {
  top: 10,
  left: 10,
  right: 10,
  bottom: 10,
};
// padding for facet charts
const padding = 10;

// Facet chart cell width and height
const cellWidth = (width - padding) / 4.5 - padding;
const cellHeight = (height - padding) / 3.5 - padding;

// cell position
const catXY = [
  [cellWidth / 2, cellHeight / 2],
  [cellWidth / 2, cellHeight * 2 - cellHeight / 2],
  [cellWidth / 2, cellHeight * 3 - cellHeight / 2],
  [cellWidth * 2 - cellWidth / 2, cellHeight / 2],
  [cellWidth * 2 - cellWidth / 2, cellHeight * 2 - cellHeight / 2],
  [cellWidth * 2 - cellWidth / 2, cellHeight * 3 - cellHeight / 2],
  [cellWidth * 3 - cellWidth / 2, cellHeight / 2],
  [cellWidth * 3 - cellWidth / 2, cellHeight * 2 - cellHeight / 2],
  [cellWidth * 3 - cellWidth / 2, cellHeight * 3 - cellHeight / 2],
  [cellWidth * 4 - cellWidth / 2, cellHeight / 2],
  [cellWidth * 4 - cellWidth / 2, cellHeight * 2 - cellHeight / 2],
  [cellWidth * 4 - cellWidth / 2, cellHeight * 3 - cellHeight / 2],
];

// Function to get unique value
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

// Function to create group position from array of group
function createXY(arr) {
  var i = 1;
  var j = 0.1;
  var position = {};

  for (value in arr.filter(onlyUnique)) {
    position[parseFloat(value) + 1] = [
      (width * i) / 12 - 0.1,
      (height * j) / 11 - 0.1,
    ];
    i += 1;
    if (i % 10 === 0) {
      i = 1;
      j += 1;
    }
  }

  return position;
}

// Function to create vertical node position
function createXYvertical(obj) {
  var i = 1;
  var j = 100;
  var position = {};

  for (value in obj) {
    if (obj[value].centrality != 0) {
      position[obj[value].name] = [j, i * 35];
      i += 1;
      if (i % 17 === 0) {
        i = 1;
        j += 100;
      }
    } else {
      position[obj[value].name] = [-100, -100];
    }
  }
  return position;
}

// Function to random node position
function randomPosition(obj) {
  var position = {};

  for (value in obj) {
    if (obj[value].centrality != 0) {
      position[obj[value].name] = [
        (Math.random() - 1) * 50 * Math.PI,
        (Math.random() - 1) * 25 * Math.PI,
      ];
    } else {
      position[obj[value].name] = [
        (Math.random() - 1) * 100 * Math.PI,
        (Math.random() - 1) * 100 * Math.PI,
      ];
    }
  }

  return position;
}

// Color scale for nodes
const colorScale = [
  //avocado
  "#7A871E",
  //nutmeg
  "#a6cee3",
  //sesame
  "#85D2D0",
  //cucumber
  "#BACC81",
  //mango
  "#EB8842",
  //oil
  "#C26DBC",
  //lime
  "#88CA5E",
  //banana
  "#F8CF2C",
  //rice
  "#cab2d6",
  //carrot
  "#FF8300",
  //onion
  "#E5C295",
  //pepper
  "#E7625F",
];

// node image from https://www.flaticon.com
const nodeImage = {
  //Avocado icons created by Vitaly Gorbachev - Flaticon
  avocado: "images/avocado.png",
  //Food and restaurant icons created by POD Gladiator - Flaticon
  cucumber: "images/cucumber.png",
  //Lime icons created by Vector Stall - Flaticon
  lime: "images/lime.png",
  //Carrot icons created by Freepik - Flaticon
  carrot: "images/carrot.png",
  //Nutmeg icons created by surang - Flaticon
  nutmeg: "images/nutmeg.png",
  //Mango icons created by BomSymbols - Flaticon
  mango: "images/mango.png",
  //Banana juice icons created by Eucalyp - Flaticon
  banana: "images/banana.png",
  //Onion icons created by imaginationlol - Flaticon
  onion: "images/onion.png",
  //Sesame icons created by Freepik - Flaticon
  sesame: "images/sesame.png",
  //Oil icons created by Freepik - Flaticon
  oil: "images/oil.png",
  //Rice icons created by Freepik - Flaticon
  rice: "images/rice.png",
  //Chili icons created by Freepik - Flaticon
  pepper: "images/pepper.png",
};
// Text from wikipedia
ingredientsTextWiki = {
  avocado:
    "Generally, avocado is served raw, though some cultivars, including the common 'Hass', can be cooked for a short time without becoming bitter. The flesh of some avocados may be rendered inedible by heat. Prolonged cooking induces this chemical reaction in all cultivars.",
  cucumber:
    "Raw cucumber is 95% water. And depending on variety, cucumbers may have a mild melon aroma and flavor.",
  lime: "In cooking, lime is valued both for the acidity of its juice and the floral aroma of its zest. It is a common ingredient in authentic Mexican, Vietnamese and Thai dishes.",
  carrot:
    "Carrots can be eaten in a variety of ways. Only 3 percent of the β-carotene in raw carrots is released during digestion: this can be improved to 39% by pulping, cooking and adding cooking oil. Alternatively they may be chopped and boiled, fried or steamed, and cooked in soups and stews.",
  nutmeg:
    "Nutmeg and mace have similar sensory qualities, with nutmeg having a slightly sweeter and mace a more delicate flavour. Mace is often preferred in light dishes for the bright orange, saffron-like hue it imparts. Nutmeg is used for flavouring many dishes.",
  mango:
    "Mangoes are used in many cuisines. Sour, unripe mangoes are used in chutneys (i.e. Mango chutney), pickles, daals and other side dishes in Bengali cuisine. Ripe mangoes are also used to make curries.",
  banana:
    "In some countries, bananas used for cooking may be called 'plantains', distinguishing them from dessert bananas. The fruit is variable in size, color, and firmness, but is usually elongated and curved.",
  onion:
    "Onions are commonly chopped and used as an ingredient in various hearty warm dishes, and may also be used as a main ingredient in their own right, for example in French onion soup, creamed onions, and onion chutney. They are versatile and can be baked, boiled, braised, grilled, fried, roasted, sautéed, or eaten raw in salads.",
  sesame:
    "Sesame seed is a common ingredient in various cuisines. It is used whole in cooking for its rich, nutty flavour. Sesame seeds are sometimes added to bread, including bagels and the tops of hamburger buns.",
  oil: "Cooking oils are composed of various fractions of fatty acids. For the purpose of frying food, oils high in monounsaturated or saturated fats are generally popular, while oils high in polyunsaturated fats are less desirable. High oleic acid oils include almond, macadamia, olive, pecan, pistachio, and high-oleic cultivars of safflower and sunflower.",
  rice: "Rice is the staple food of over half the world's population. It is the predominant dietary energy source for 17 countries in Asia and the Pacific, 9 countries in North and South America and 8 countries in Africa.",
  pepper:
    "Ground, dried, and cooked peppercorns have been used since antiquity, both for flavour and as a traditional medicine. Black pepper is the world's most traded spice, and is one of the most common spices added to cuisines around the world.",
};

// Spider chart related variables and functions
const spiderFeatures = [
  "score",
  "no. positive rating",
  "calories",
  "no. ingredients",
  "cook time",
];
const spiderFeaturesReverseforText = [
  "recipe's score",
  "cook time",
  "no. ingredients",
  "recipe's calories",
  "positive rating",
];
const spiderColors = ["#98B66E", "#00B1B0", "#FEC84D", "#E42256", "#A06AB4"];

// Set center position of spider chart
const xSpider = 400;
const ySpider = 350;

// Create circle scale
var radialScale = d3.scaleLinear().domain([0, 100]).range([50, 250]);
const ticks = [0, 20, 40, 60, 80, 100];

// Function for calculating coord from angle (Yang, 2019)
function angleToCoordinate(angle, value) {
  let x = Math.cos(angle) * radialScale(value);
  let y = Math.sin(angle) * radialScale(value);
  return { x: xSpider + x, y: ySpider - y };
}

// Function to create list of coord from number of variables (Yang, 2019)
function getPathCoordinates(data_point) {
  let coordinates = [];
  for (var i = 0; i < spiderFeatures.length; i++) {
    let ft_name = spiderFeatures[i];
    let angle = Math.PI / 2 + (2 * Math.PI * i) / spiderFeatures.length;
    coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
  }
  return coordinates;
}

// Cruve line variable
var spiderLine = d3
  .line()
  .x((d) => d.x)
  .y((d) => d.y)
  .curve(d3.curveCardinalClosed);

// Function to generate spider elements
function drawSpider() {
  // Loop for each data point
  for (var i = 0; i < filteredSpider.length; i++) {
    let d = filteredSpider[i];
    let color = spiderColors[i];
    let coordinates = getPathCoordinates(d);

    // Draw the spider element
    spiderElement = g_spider.append("g").attr("class", "spider-element");
    // Draw path inner color filled
    spiderElement
      .append("path")
      .attr("class", "spider-path")
      .datum(coordinates)
      .attr("d", spiderLine)
      .attr("stroke-width", 1)
      .attr("stroke", color)
      .attr("fill", color)
      .attr("fill-opacity", 0.5);
    // Draw path outline with visible fill
    spiderElement
      .append("path")
      .attr("class", "spider-outline")
      .datum(coordinates)
      .attr("d", spiderLine)
      .attr("stroke-width", 5)
      .attr("stroke", color)
      .attr("fill", "transparent")
      .attr("stroke-opacity", 1)
      .style("filter", "url(#spider-glow)")
      .datum(d);
    // Draw circle on each datapoint features
    spiderElement
      .selectAll(null)
      .data(coordinates)
      .enter()
      .append("circle")
      .attr("class", "spider-dot")
      .attr("r", 5)
      .attr("cx", (d) => d.x || 0)
      .attr("cy", (d) => d.y || 0)
      .attr("fill", color);
  }
}

// Load all dataset and ensure that all of them is loaded before generating visualisation
var promises = [
  d3.csv("data/ingredients_nodes.csv", function (d) {
    return {
      name: d.name,
      centrality: parseFloat(d.centrality),
      community: parseFloat(d.community),
      index: d.rowid,
    };
  }),
  d3.csv("data/ingredients_edges.csv", function (d) {
    return { source: parseFloat(d.from) - 1, target: parseFloat(d.to) - 1 };
  }),
  d3.csv("data/top_recipe_for_top_ingredients.csv", function (d) {
    return {
      ingredients: d.ingredients,
      recipe: d.recipe.replace(/-/g, " "),
      n: parseFloat(d.n),
      ratings_positive: parseFloat(d.ratings_positive),
      score: parseFloat(d.score),
      calories: parseFloat(d.calories),
      num_ingedient: parseFloat(d.number_of_ingredients),
      cooktime: parseFloat(d.cook_time),
    };
  }),
  d3.csv("data/top_recipe.csv", function (d) {
    return {
      ingredients: d.ingredients,
      recipe: d.recipe.replace(/-/g, " "),
      score: parseFloat(d.score_scale),
      "no. positive rating": parseFloat(d.ratings_positive_scale),
      calories: parseFloat(d.calories_scale),
      "no. ingredients": parseFloat(d.number_of_ingredients_scale),
      "cook time": parseFloat(d.cook_time_scale),
      score_info: parseFloat(d.score),
      rating_info: parseFloat(d.ratings_positive),
      calories_info: parseFloat(d.calories),
      num_ingedient_info: parseFloat(d.number_of_ingredients),
      cooktime_info: parseFloat(d.cook_time),
    };
  }),
];

dataPromised = Promise.all(promises);

dataPromised.then(function (data) {
  // Assign datasets to variables
  nodesData = data[0];
  edgesData = data[1];
  recipeData = data[2];
  fullrecipeData = data[3];

  // Simple wrangling to get top 12 and 30 ingredients
  topNodesCentralityCutoff = nodesData
    .map((d) => d.centrality)
    .sort((a, b) => b - a)
    .slice(11, 12)[0];
  topNodes = nodesData.filter((d) => d.centrality >= topNodesCentralityCutoff);
  top30NodesCutoff = nodesData
    .map((d) => d.centrality)
    .sort((a, b) => b - a)
    .slice(29, 30)[0];
  top30Nodes = nodesData.filter((d) => d.centrality >= top30NodesCutoff);

  recipeData.map((d) => d.ingredients);

  // Create group of ingredients and recipes
  ingredientsGroup = d3.group(recipeData, (d) => d.ingredients);

  // Calculate max rating for scaling
  maxRating = Math.max(...recipeData.map((d) => d.ratings_positive));

  // Map node name to the specify position
  nodesData
    .map((d) => d.name)
    .forEach((key, i) => (topNodesPosition[String(key)] = [0, 0]));
  topNodes
    .map((d) => d.name)
    .forEach((key, i) => (topNodesPosition[String(key)] = catXY[i]));

  // Set default color for nodes with top 12 has specific color to differentiate
  nodesData
    .map((d) => d.name)
    .forEach((key, i) => (nodeColor[key] = "#a2a2a2"));
  topNodes
    .map((d) => d.name)
    .forEach((key, i) => (nodeColor[key] = colorScale[i]));

  // Use `groupToStack` for transform group data to stack for stack bar chart (Gómez, 2020)
  stackedRecipeTemp = groupToStack(
    recipeData.filter((d) => d.n > 1).sort((a, b) => a.n - b.n),
    "recipe",
    "ingredients",
  );
  stackedRecipe = d3
    .stack()
    .keys(topNodes.map((d) => d.name))
    .order(d3.stackOrderInsideOut);
  seriesRecipe = stackedRecipe(stackedRecipeTemp);

  // Create position for vis1 to group node by its community using proximity
  communityXY = createXY(nodesData.map((d) => d.community));

  // Create position for vis8 to align node vertically as a selector
  verticalNodeSelector = createXYvertical(nodesData);

  // Generate randomPosition for nodes
  randomNodePos = randomPosition(nodesData);

  // Default spider chart data
  filteredSpider = fullrecipeData.filter((d) => d.ingredients === selectedNode);

  // Call startVis to draw all visualisation
  startVis();

  console.log(document.getElementsByTagName("*").length);
});

function startVis() {
  // Set up the main svg variable
  let svg = d3
    .select("#vis")
    .classed("svg-container", true)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + width + " " + height)
    .classed("svg-content-responsive", true)
    .attr("opacity", 1);

  /*----------
    Text section
    -----------*/
  svg
    .append("text")
    .attr("text-anchor", "start")
    .attr("x", 100)
    .attr("y", 50)
    .attr("font-size", 30)
    .attr("class", "vis-title")
    .text("Tasty Ingredients Pairing");

  /*------------------
    Force Layout section
    --------------------*/
  // Create force simulation using nodesData
  forceLayout = d3.forceSimulation().nodes(nodesData);

  // Create edge for force simulation
  var edges = svg
    .append("g")
    .selectAll(null)
    .data(edgesData)
    .enter()
    .append("line")
    .attr("class", "force-edge")
    .style("stroke", "#ccc")
    .style("stroke-width", 1);

  /* ---------------
    Bar charts section
    ------------------*/
  // Define scaling variable
  const xScale = d3
    .scaleLinear()
    .domain([0, maxRating])
    .range([0, cellWidth - padding]);
  // Set up g element to store bar chart elements
  g = svg
    .append("g")
    .attr("transform", "translate(" + [margin.left, margin.top] + ")");

  // Set up plots to each ingredients
  plots = g
    .selectAll(null)
    .data(ingredientsGroup)
    .enter()
    .append("g")
    .attr("transform", function (d) {
      return (
        "translate(" +
        [topNodesPosition[d[0]][0], topNodesPosition[d[0]][1]] +
        ")"
      );
    });
  // Create Axis
  facetXaxis = plots
    .append("g")
    .attr("class", "facet-axis")
    .attr("transform", "translate(" + [0, cellHeight - height / 10] + ")")
    .call(d3.axisBottom(xScale).ticks(3))
    .attr("opacity", 0);
  // Add chart title for each ingredients
  plots
    .append("text")
    .attr("class", "facet-title")
    .text((d) => d[0])
    .attr("x", 20)
    .attr("y", -10)
    .attr("font-size", "15px")
    .attr("font-weight", "bold")
    .attr("opacity", 0);
  // Add ingredient image next to each chart title
  plots
    .append("image")
    .attr("class", "facet-img")
    .attr("xlink:href", (d) => nodeImage[d[0]])
    .attr("height", 15)
    .attr("width", 15)
    .attr("x", 0)
    .attr("y", -22)
    .attr("opacity", 0);
  // Chart bar chart
  plots
    .selectAll(null)
    .data((d) => d[1])
    .enter()
    .append("rect")
    .attr("class", "facet-bar")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 0)
    .attr("height", 10)
    .attr("fill", (d) => nodeColor[d.ingredients]);
  // Add mouse interaction in bar chart
  plots
    .selectAll(".facet-bar")
    .attr("opacity", 0)
    .on("mouseover", mouseOverfBar)
    .on("mouseout", mouseOutfBar);
  // Add text label
  plots
    .selectAll(null)
    .data((d) => d[1])
    .enter()
    .append("text")
    .attr("class", "facet-text")
    .attr("x", 0)
    .attr("y", function (d, i) {
      return i * 12 + 7;
    })
    .attr("font-size", "8px");
  // Hide text for now
  plots.selectAll(".facet-text").attr("opacity", 0);

  plots
    .append("foreignObject")
    .attr("class", "wiki-text")
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("font-size", "8px")
    .append("xhtml:body")
    .html(
      (d) =>
        '<div style="width: 150px;">' + ingredientsTextWiki[d[0]] + "</div>",
    );

  svg.selectAll(".wiki-text").attr("visibility", "hidden");

  // Mouse interaction function for facet bar chart
  function mouseOverfBar(event, d) {
    // Get mouse position
    var xPosition = event.x + 10 + "px";
    var yPosition = event.y - 10 + "px";

    // Highlight selected bar
    d3.select(this)
      .transition("mouseover")
      .duration(100)
      .attr("opacity", 1)
      .attr("stroke-width", 2)
      .attr("stroke", "black");
    // Show tooltips
    d3.select("#tooltip")
      .html(
        "<b>" +
          this.__data__.recipe +
          "</b><br>" +
          "no. positive rating: " +
          this.__data__.ratings_positive +
          "<br>" +
          "score: " +
          this.__data__.score +
          "<br>" +
          "cook time: " +
          this.__data__.cooktime +
          "<br>" +
          "no. ingredients: " +
          this.__data__.num_ingedient +
          "<br>" +
          "calories: " +
          this.__data__.calories,
      )
      .style("display", "inline-block")
      .style("left", xPosition)
      .style("top", yPosition);
  }
  function mouseOutfBar(event, d) {
    // Revert chart to default
    d3.select(this)
      .transition("mouseout")
      .duration(100)
      .attr("opacity", 0.8)
      .attr("stroke-width", 0);

    d3.select("#tooltip").style("display", "none");
  }

  /*-----------------------
    Stacked bar chart section
    -------------------------*/
  // Set up X Y scale
  groupYscale = d3
    .scaleBand()
    .domain(stackedRecipeTemp.map((d) => d.recipe))
    .range([height - 200, 0])
    .padding([0.2]);
  groupXscale = d3
    .scaleLinear()
    .domain([0, 3])
    .range([0, width - padding - 220]);
  // Set up g element to store chart elements
  g_stack = svg
    .append("g")
    .attr("transform", "translate(" + [margin.left, 100] + ")");

  // Generate Axis
  groupBarYaxis = g_stack
    .append("g")
    .attr("transform", "translate(" + 200 + ", 0)")
    .attr("class", "stack-bar-axis")
    .call(d3.axisLeft(groupYscale))
    .attr("opacity", 0);
  // Draw bar
  groupStackBar = g_stack
    .append("g")
    .selectAll("g")
    .data(seriesRecipe)
    .enter()
    .append("g")
    .attr("class", "stack-chart")
    .attr("fill", (d) => nodeColor[d.key])
    .attr("opacity", (d) =>
      topNodes.map((d) => d.name).includes(d.key) ? 1 : 0,
    )
    .selectAll("rect")
    .data((d) => d);

  /*-----------------
    Spider Chart layout
    -------------------*/
  // Set up g element to store element
  g_spider = svg.append("g").attr("class", "g-spider");

  // Draw circle axis
  ticks.forEach((t) =>
    g_spider
      .append("circle")
      .attr("class", "spider-circle")
      .attr("cx", xSpider)
      .attr("cy", ySpider)
      .attr("fill", "none")
      .attr("stroke", "gray")
      .attr("r", radialScale(t)),
  );
  ticks.forEach((t) =>
    g_spider
      .append("text")
      .attr("class", "spider-text-path")
      .attr("x", xSpider)
      .attr("y", ySpider + 10 - radialScale(t))
      .text(t),
  );

  var arcGeneratorSpider = d3
    .arc()
    .innerRadius(radialScale(0))
    .outerRadius(radialScale(105))
    .padAngle(0.02)
    .startAngle(function (d) {
      return d.startAngleArc;
    })
    .endAngle(function (d) {
      return d.endAngleArc;
    });

  // Draw axis line for each features
  for (var i = 0; i < spiderFeatures.length; i++) {
    let ft_name = spiderFeaturesReverseforText[i];
    let start_angle =
      Math.PI / 2 + (2 * Math.PI * i - 1) / spiderFeatures.length;
    let angle = Math.PI / 2 + (2 * Math.PI * i) / spiderFeatures.length;
    let line_coordinate = angleToCoordinate(angle, 100);

    spiderAxes = g_spider.append("g").attr("class", "spider-axe");
    //draw axis line
    spiderAxes
      .append("line")
      .attr("class", "spide-axe-line")
      .attr("x1", xSpider)
      .attr("y1", ySpider)
      .attr("x2", line_coordinate.x)
      .attr("y2", line_coordinate.y)
      .attr("stroke", "black");

    spiderAxes
      .append("path")
      .attr("id", "text-path-holder-" + i)
      .attr(
        "d",
        arcGeneratorSpider({
          startAngleArc: angle - 2,
          endAngleArc: start_angle - 0.95,
        }),
      )
      .attr("opacity", 0)
      .attr("transform", "translate(" + xSpider + "," + ySpider + ")");

    spiderAxes
      .append("text")
      .append("textPath")
      .attr("class", "spider-text-path")
      .attr("startOffset", "8%")
      .attr("xlink:href", "#text-path-holder-" + i)
      .text(ft_name);
  }

  // Create glow filter for spider elements (Bremer, 2022)
  var spiderFilter = g
      .append("defs")
      .append("filter")
      .attr("id", "spider-glow"),
    feGaussianBlur = spiderFilter
      .append("feGaussianBlur")
      .attr("stdDeviation", "2.5")
      .attr("result", "coloredBlur"),
    feMerge = spiderFilter.append("feMerge"),
    feMergeNode_1 = feMerge.append("feMergeNode").attr("in", "coloredBlur"),
    feMergeNode_2 = feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  // Add text to show selected nodes on page
  svg
    .append("text")
    .attr("text-anchor", "start")
    .attr("x", 100)
    .attr("y", 80)
    .attr("font-size", 15)
    .attr("class", "selected-node-text")
    .text(selectedNode);

  svg.selectAll(".selected-node-text").attr("visibility", "hidden");

  // Hide spider chart for now
  svg.selectAll(".spider-axe").attr("opacity", 0);
  svg.selectAll(".spider-circle").attr("opacity", 0);
  svg.selectAll(".spider-text").attr("opacity", 0);
  svg
    .selectAll(".spider-element")
    .attr("opacity", 0)
    .attr("pointer-events", "none");
  svg.selectAll(".g-spider").attr("visibility", "hidden");

  // Create 'g' elements to store all nodes elements
  var nodes = svg
    .append("g")
    .selectAll(".force-node")
    .data(nodesData)
    .enter()
    .append("g")
    .attr("class", "force-node");

  // Append circle in node
  nodes
    .append("circle")
    .attr("class", "node-circle")
    .attr("fill", (d) => nodeColor[d.name]);

  // Append image to node
  nodes
    .append("image")
    .attr("class", "node-img")
    .attr("xlink:href", (d) => nodeImage[d.name])
    .attr("height", 15)
    .attr("width", 15)
    .attr("x", -8)
    .attr("y", -8)
    .attr("opacity", 0);

  // Append text to node for top 30 nodes to avoid too much text
  nodes
    .append("text")
    .text((d) => (d.centrality >= top30NodesCutoff ? "" : ""))
    .attr("x", "1.2em")
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("class", "node-text")
    .attr("opacity", 0)
    .attr("font-size", "15px");

  var nodeArcGenerator = d3.arc().innerRadius(0).outerRadius(20);
  nodes
    .append("path")
    .attr("id", function (d, i) {
      return i;
    })
    .attr("class", "node-invis")
    .attr("d", nodeArcGenerator({ startAngle: -1, endAngle: Math.PI }))
    .attr("fill", "transparent");

  nodes
    .append("text")
    .append("textPath")
    .attr("class", "node-text-path")
    .attr("xlink:href", function (d, i) {
      return "#" + i;
    })
    .attr("font-size", "15px")
    .text((d) => (d.centrality >= top30NodesCutoff ? d.name : ""))
    .attr("visibility", "hidden");

  // Function to identify which nodes are connected to selected node
  var is_connected = function (d, opacity) {
    // if connected change color to and opacity 1
    edges.transition().style("stroke-opacity", function (o) {
      return o.source.name === d.name || o.target.name === d.name ? 1 : opacity;
    });
  };

  // Add mouse interaction
  svg
    .selectAll(".force-node")
    .on("mouseover", mouseOverNode)
    .on("mouseout", mouseOutNode);

  // mouse over event
  function mouseOverNode(event, d) {
    // Call is_connected to show only connected nodes
    is_connected(d, 0);

    // Store selected node data in variable
    selectedNode = this.__data__.name;
    filteredSpider = fullrecipeData.filter(
      (d) => d.ingredients === selectedNode,
    );

    // Update text
    d3.select(".selected-node-text").text(selectedNode);

    // Get mouse position
    var xPosition = event.x + 10 + "px";
    var yPosition = event.y - 10 + "px";

    // Highlight selected node
    d3.select(this)
      .select(".node-circle")
      .transition("mouseover")
      .duration(100)
      .attr("opacity", 1)
      .attr("stroke-width", 2)
      .attr("stroke", "black");

    // Show tooltip
    d3.select("#tooltip")
      .html(selectedNode)
      .style("display", "inline-block")
      .style("left", xPosition)
      .style("top", yPosition);

    /*------------------
        Spider chart section
        --------------------*/
    // If vis8 (section 7) create spider chart based on selected node
    if (sectionIndex === 7) {
      // Remove of chart elements before creating it again
      d3.selectAll(".spider-element").remove();

      // Draw spider chart
      drawSpider();

      // Add mouse interaction for spider chart
      svg
        .selectAll(".spider-outline")
        .on("mouseover", function (event, d) {
          d3.selectAll(".spider-path")
            .transition()
            .duration(200)
            .style("fill-opacity", 0.1);

          d3.selectAll(".spider-outline")
            .transition()
            .duration(200)
            .style("stroke-opacity", 0.5);

          d3.select(this.parentNode)
            .select(".spider-path")
            .transition()
            .duration(200)
            .style("fill-opacity", 0.7);

          // Get mouse position
          var xPosition = event.x + 10 + "px";
          var yPosition = event.y - 10 + "px";
          // Show tooltip
          d3.select("#tooltip")
            .html(
              "<b>" +
                this.__data__.recipe +
                "</b><br>" +
                "score: " +
                this.__data__.score_info +
                "<br>" +
                "no. positive rating: " +
                this.__data__.rating_info +
                "<br>" +
                "calories: " +
                this.__data__.calories_info +
                "<br>" +
                "no. ingredients: " +
                this.__data__.num_ingedient_info +
                "<br>" +
                "cook time: " +
                this.__data__.cooktime_info +
                " mins",
            )
            .style("display", "inline-block")
            .style("left", xPosition)
            .style("top", yPosition);
        })
        .on("mouseout", function (event, d) {
          d3.selectAll(".spider-path")
            .transition()
            .duration(200)
            .style("fill-opacity", 0.5);
          d3.selectAll(".spider-outline")
            .transition()
            .duration(200)
            .style("stroke-opacity", 1);
          d3.select("#tooltip").style("display", "none");
        });
    }
  }
  // Mouse interaction for node when mouse leave
  function mouseOutNode(event, d) {
    is_connected(d, 0.5);

    d3.select(this)
      .select(".node-circle")
      .transition("mouseout")
      .duration(100)
      .attr("opacity", 0.8)
      .attr("stroke-width", 0);

    d3.select("#tooltip").style("display", "none");
  }
  // Link nodes and edges
  forceLayout.on("tick", () => {
    edges
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);
    nodes.attr("transform", (d) => `translate(${d.x},${d.y})`);
  });

  var nodeLegendVal = [0.25, 0.5, 0.75, 1];

  nodeLegend = svg.append("g").attr("class", "node-legend");

  nodeLegend
    .selectAll(null)
    .data(nodeLegendVal)
    .enter()
    .append("circle")
    .attr("class", "node-legend-circle")
    .attr("cx", 900)
    .attr("cy", (d) => 100 - d * 20)
    .attr("r", (d) => d * 20)
    .style("fill", "transparent")
    .style("opacity", 0.5)
    .style("stroke", "black");

  nodeLegend
    .selectAll(null)
    .data(nodeLegendVal)
    .enter()
    .append("line")
    .attr("class", "node-legend-line")
    .attr("x1", (d) => (d % 0.5 === 0 ? 850 : 950))
    .attr("x2", (d) => (d % 0.5 === 0 ? 900 - d * 20 : 900 + d * 20))
    .attr("y1", (d) => 100 - d * 20)
    .attr("y2", (d) => 100 - d * 20)
    .style("stroke", "black")
    .style("stroke-dasharray", "2,2");
  nodeLegend
    .selectAll(null)
    .data(nodeLegendVal)
    .enter()
    .append("text")
    .attr("class", "node-legend-text")
    .attr("text-anchor", "end")
    .attr("x", (d) => (d % 0.5 === 0 ? 845 : 970))
    .attr("y", (d) => 100 - d * 18)
    .style("alignment-baseline", "middle")
    .style("font-size", "10px")
    .text((d) => d);
  // Legend title
  nodeLegend
    .append("text")
    .attr("class", "node-legend-text")
    .attr("text-anchor", "end")
    .attr("x", 930)
    .attr("y", 120)
    .attr("font-size", "15px")
    .text("centrality");

  svg.selectAll(".node-legend").attr("visibility", "hidden");

  // Stop force layout for now
  forceLayout.stop();
}

/*--------------------------------------------------------------
Start generating each visualisation when scrolling down the page
----------------------------------------------------------------*/
function vis1() {
  for (let element of document.querySelectorAll(".app"))
    element.style.visibility = "visible";
  // Set up svg variable
  let svg = d3.select("#vis").select("svg");
  // Show text
  svg.selectAll(".vis-intro").attr("visibility", "visible");

  svg.select(".vis-title").text("Tasty Ingredients Pairing");

  // Hide force simulation
  svg
    .selectAll(".force-node")
    .transition()
    .duration(300)
    .attr("opacity", 0)
    .attr("pointer-events", "none");

  svg.selectAll(".force-edge").transition().duration(300).attr("opacity", 0);
}

function vis2() {
  for (let element of document.querySelectorAll(".app"))
    element.style.visibility = "hidden";
  // Set up svg variable
  let svg = d3.select("#vis").select("svg");
  svg.selectAll(".vis-intro").attr("visibility", "hidden");
  svg.selectAll(".node-text-path").attr("visibility", "hidden");
  svg.selectAll(".node-legend").attr("visibility", "hidden");

  svg
    .select(".vis-title")
    .text("Ingredients Universe Clustered by its Community");

  svg
    .selectAll(".force-node")
    .transition()
    .duration(50)
    .attr("pointer-events", "all")
    .attr("opacity", (d) =>
      d.centrality >= topNodesCentralityCutoff ? 1 : 0.6,
    );
  svg
    .selectAll(".node-circle")
    .transition()
    .duration(50)
    .attr("opacity", (d) =>
      d.centrality >= topNodesCentralityCutoff ? 1 : 0.6,
    )
    .attr("r", (d) => (d.centrality >= topNodesCentralityCutoff ? 10 : 3));
  svg.selectAll(".node-text").transition().duration(50).attr("dy", 20);
  svg
    .selectAll(".node-img")
    .transition()
    .duration(50)
    .attr("opacity", 1)
    .attr("height", 15)
    .attr("width", 15)
    .attr("x", -8)
    .attr("y", -8);
  svg.selectAll(".node-text").attr("dx", -15).attr("dy", 20).attr("opacity", 0);

  svg.selectAll(".force-edge").attr("opacity", 0);

  forceLayout
    .force("charge", d3.forceManyBody().strength(-2))
    .force(
      "forceX",
      d3.forceX().x((d) => communityXY[d.community][0]),
    )
    .force(
      "forceY",
      d3.forceY().y((d) => communityXY[d.community][1]),
    )
    .force("center", d3.forceCenter().x(500).y(300))
    .force("collision", d3.forceCollide().radius(5))
    .force("link", null);

  forceLayout.alpha(0.9).restart();
}

function vis3() {
  // Set up svg variable
  let svg = d3.select("#vis").select("svg");
  svg.selectAll(".wiki-text").attr("visibility", "hidden");
  svg.selectAll(".node-text-path").attr("visibility", "visible");
  svg.selectAll(".node-legend").attr("visibility", "visible");

  svg.select(".vis-title").text("Ingredients Pairing Network");

  svg
    .selectAll(".force-node")
    .transition()
    .duration(500)
    .attr("pointer-events", (d) => (d.centrality != 0 ? "all" : "none"))
    .attr("opacity", 1);

  svg
    .selectAll(".node-circle")
    .transition()
    .duration(500)
    .attr("opacity", (d) => (d.centrality != 0 ? 1 : 0))
    .attr("r", (d) => (d.centrality != 0 ? d.centrality * 20 : 0));

  svg
    .selectAll(".node-img")
    .transition()
    .duration(500)
    .attr("height", 20)
    .attr("width", 20)
    .attr("x", -10)
    .attr("y", -10);

  svg
    .selectAll(".node-text")
    .attr("dx", -20)
    .attr("dy", 30)
    .attr("opacity", (d) => (d.centrality != 0 ? 1 : 0));

  svg.selectAll(".force-edge").attr("opacity", 0.5);

  svg.selectAll(".force-edge").attr("visibility", "visible");

  forceLayout
    .force("charge", d3.forceManyBody().strength(-2000))
    .force(
      "forceX",
      d3
        .forceX()
        .x((d) => randomNodePos[d.name][0])
        .strength(2),
    )
    .force(
      "forceY",
      d3
        .forceY()
        .y((d) => randomNodePos[d.name][1])
        .strength(2),
    )
    .force("center", d3.forceCenter().x(100).y(-200))
    .force("collision", d3.forceCollide().radius(1))
    .force("link", d3.forceLink(edgesData));
  forceLayout.alpha(0.1).restart();
}

function vis4() {
  // Set up svg variable
  let svg = d3.select("#vis").select("svg");

  svg.select(".vis-title").text("Top 12 Importance Ingredients");

  svg.selectAll(".force-edge").attr("visibility", "hidden");
  svg.selectAll(".node-legend").attr("visibility", "hidden");

  svg
    .selectAll(".force-node")
    .transition()
    .duration(1000)
    .attr("opacity", (d) => (d.centrality >= topNodesCentralityCutoff ? 1 : 0))
    .attr("pointer-events", (d) =>
      d.centrality >= topNodesCentralityCutoff ? "all" : "none",
    );
  svg
    .selectAll(".node-img")
    .transition()
    .duration(500)
    .attr("height", 20)
    .attr("width", 20)
    .attr("x", -10)
    .attr("y", -10);
  svg
    .selectAll(".node-circle")
    .transition()
    .duration(50)
    .attr("opacity", (d) => (d.centrality >= topNodesCentralityCutoff ? 1 : 0))
    .attr("r", (d) => (d.centrality >= topNodesCentralityCutoff ? 20 : 0));

  svg
    .selectAll(".node-text")
    .attr("dx", -20)
    .attr("dy", 30)
    .attr("font-size", "15px")
    .attr("opacity", (d) => (d.centrality >= topNodesCentralityCutoff ? 1 : 0));

  svg.selectAll(".wiki-text").attr("visibility", "visible");

  forceLayout
    .force("link", null)
    .force("charge", d3.forceManyBody().strength(0))
    .force(
      "forceX",
      d3
        .forceX()
        .x((d) => topNodesPosition[d.name][0])
        .strength(2),
    )
    .force(
      "forceY",
      d3
        .forceY()
        .y((d) => topNodesPosition[d.name][1])
        .strength(2),
    )
    .force("center", d3.forceCenter().x(0).y(0))
    .force("collision", d3.forceCollide().radius(5));

  plots
    .selectAll(".facet-bar")
    .transition()
    .duration(1000)
    .attr("width", 0)
    .attr("y", 0)
    .attr("opacity", 0);
  plots.selectAll(".facet-text").transition().duration(1000).attr("opacity", 0);
  plots
    .selectAll(".facet-title")
    .transition()
    .duration(1000)
    .attr("opacity", 0);
  plots.selectAll(".facet-img").transition().duration(1000).attr("opacity", 0);

  plots.selectAll(".facet-axis").transition().duration(1000).attr("opacity", 0);

  forceLayout.alpha(1).restart();
}

function vis5() {
  // Set up svg variable
  let svg = d3.select("#vis").select("svg");

  svg.select(".vis-title").text("Top 12 Importance Ingredients' Recipe");
  svg.selectAll(".wiki-text").attr("visibility", "hidden");

  forceLayout
    .force("center", d3.forceCenter().x(-500).y(-500))
    .force("forceX", d3.forceX().x(-500))
    .force("forceY", d3.forceY().y(-500));

  const xScale = d3
    .scaleLinear()
    .domain([0, maxRating])
    .range([0, cellWidth - padding]);

  svg
    .selectAll(".force-node")
    .transition()
    .duration(1000)
    .attr("opacity", 0)
    .attr("pointer-events", "none");

  plots
    .selectAll(".facet-bar")
    .transition()
    .duration(1000)
    .attr("width", (d) => xScale(d.ratings_positive))
    .attr("y", function (d, i) {
      return i * 12;
    })
    .attr("opacity", 0.8)
    .attr("pointer-events", "all");
  plots
    .selectAll(".facet-text")
    .transition()
    .duration(1000)
    .attr("opacity", 0)
    .text("");

  plots
    .selectAll(".facet-title")
    .transition()
    .duration(1000)
    .attr("opacity", 1);
  plots.selectAll(".facet-img").transition().duration(1000).attr("opacity", 1);
  plots.selectAll(".facet-axis").transition().duration(1000).attr("opacity", 1);

  svg.selectAll(".stack-chart").attr("visibility", "hidden");
  svg.selectAll(".stack-bar-axis").attr("visibility", "hidden");
}

function vis6() {
  // Set up svg variable
  let svg = d3.select("#vis").select("svg");

  svg
    .select(".vis-title")
    .text("Intersection of Importance Ingredients' Recipe");

  forceLayout.stop();

  plots
    .selectAll(".facet-bar")
    .transition()
    .duration(1000)
    .attr("width", cellWidth - padding)
    .attr("y", function (d, i) {
      return i * 12;
    })
    .attr("opacity", (d) =>
      stackedRecipeTemp.map((d) => d.recipe).includes(d.recipe) ? 0.8 : 0.2,
    )
    .attr("pointer-events", "none");
  plots
    .selectAll(".facet-text")
    .transition()
    .duration(1000)
    .text((d) => d.recipe)
    .attr("opacity", (d) =>
      stackedRecipeTemp.map((d) => d.recipe).includes(d.recipe) ? 0.9 : 0,
    )
    .attr("fill", (d) =>
      d3.hsl(nodeColor[d.ingredients]).l > 0.65 ? "#000" : "#fff",
    );
  plots.selectAll(".facet-axis").transition().duration(1000).attr("opacity", 0);
  plots
    .selectAll(".facet-title")
    .transition()
    .duration(1000)
    .attr("opacity", 1);
  plots.selectAll(".facet-img").transition().duration(1000).attr("opacity", 1);

  svg.selectAll(".stack-bar").transition().duration(1000).attr("opacity", 0);
  svg
    .selectAll(".stack-bar-axis")
    .transition()
    .duration(1000)
    .attr("opacity", 0);
  svg.selectAll(".stack-label").transition().duration(1000).attr("opacity", 0);
  svg.selectAll(".stack-img").transition().duration(1000).attr("opacity", 0);
}

function vis7() {
  // Set up svg variable
  let svg = d3.select("#vis").select("svg");

  svg.select(".vis-title").text("Common Recipe of Importance Ingredients");

  plots
    .selectAll(".facet-bar")
    .transition()
    .duration(1000)
    .attr("width", 0)
    .attr("y", 0)
    .attr("opacity", 0);
  plots.selectAll(".facet-text").attr("opacity", 0);
  plots
    .selectAll(".facet-title")
    .transition()
    .duration(1000)
    .attr("opacity", 0);
  plots.selectAll(".facet-img").transition().duration(1000).attr("opacity", 0);

  d3.selectAll(".stack-bar").remove();

  groupStackBar
    .enter()
    .append("rect")
    .attr("height", groupYscale.bandwidth())
    .merge(groupStackBar)
    .transition()
    .duration(1000)
    .attr("class", "stack-bar")
    .attr("x", (d) => groupXscale(d[0]) + 200)
    .attr("y", (d) => groupYscale(d.data.recipe))
    .attr("width", (d) =>
      groupXscale(d[1]) - groupXscale(d[0]) ===
      groupXscale(d[1]) - groupXscale(d[0])
        ? groupXscale(d[1]) - groupXscale(d[0])
        : 0,
    )
    .attr("opacity", 0.8);

  groupStackBar
    .enter()
    .append("text")
    .attr("class", "stack-label")
    .text(function (d) {
      return groupXscale(d[1]) - groupXscale(d[0]) > 0
        ? d3.select(this.parentNode).datum().key
        : "";
    })
    .attr("x", (d) => groupXscale(d[0]) + 330)
    .attr("y", (d) => groupYscale(d.data.recipe) + 20)
    .attr("fill", "black")
    .attr("opacity", 0.9);
  groupStackBar
    .enter()
    .append("image")
    .attr("class", "stack-img")
    .attr("xlink:href", function (d) {
      return groupXscale(d[1]) - groupXscale(d[0]) > 0
        ? nodeImage[d3.select(this.parentNode).datum().key]
        : "";
    })
    .attr("height", 15)
    .attr("width", 15)
    .attr("x", (d) => groupXscale(d[0]) + 300)
    .attr("y", (d) => groupYscale(d.data.recipe) + 8)
    .attr("fill", "black")
    .attr("opacity", 0.9);

  svg
    .selectAll(".stack-bar-axis")
    .transition()
    .duration(1000)
    .attr("opacity", 1);
  svg.selectAll(".force-node").transition().duration(1000).attr("opacity", 0);

  svg.selectAll(".facet-bar").attr("visibility", "visible");
  svg.selectAll(".facet-text").attr("visibility", "visible");
  svg.selectAll(".facet-title").attr("visibility", "visible");

  svg.selectAll(".stack-chart").attr("visibility", "visible");
  svg.selectAll(".stack-bar-axis").attr("visibility", "visible");

  svg.selectAll(".selected-node-text").attr("visibility", "hidden");
  svg.selectAll(".node-text-path").attr("visibility", "visible");
  svg.selectAll(".node-text").attr("visibility", "hidden");
  svg.selectAll(".g-spider").attr("visibility", "hidden");

  svg.selectAll(".spider-axe").transition().duration(1000).attr("opacity", 0);
  svg
    .selectAll(".spider-circle")
    .transition()
    .duration(1000)
    .attr("opacity", 0);
  svg
    .selectAll(".spider-text-path")
    .transition()
    .duration(1000)
    .attr("opacity", 0);
  svg
    .selectAll(".spider-element")
    .transition()
    .duration(1000)
    .attr("opacity", 0)
    .attr("pointer-events", "none");
}

function vis8() {
  // Set up svg variable

  let svg = d3.select("#vis").select("svg");
  svg.selectAll(".selected-node-text").attr("visibility", "visible");
  svg.selectAll(".node-text-path").attr("visibility", "hidden");
  svg.selectAll(".node-text").attr("visibility", "visible");

  svg.selectAll(".facet-bar").attr("visibility", "hidden");
  svg.selectAll(".facet-text").attr("visibility", "hidden");
  svg.selectAll(".facet-title").attr("visibility", "hidden");

  svg.selectAll(".stack-chart").attr("visibility", "hidden");
  svg.selectAll(".stack-bar-axis").attr("visibility", "hidden");
  svg.selectAll(".g-spider").attr("visibility", "visible");

  svg.selectAll(".stack-bar").transition().duration(1000).attr("opacity", 0);

  svg
    .selectAll(".force-node")
    .transition()
    .duration(1000)
    .attr("opacity", 1)
    .attr("pointer-events", "all");

  svg
    .selectAll(".node-circle")
    .transition()
    .duration(50)
    .attr("r", (d) => (d.centrality > 0 ? 10 : 0))
    .attr("opacity", (d) => (d.centrality > 0 ? 1 : 0));

  svg
    .selectAll(".node-text")
    .text((d) => (d.centrality > 0 ? d.name : ""))
    .attr("dx", 20)
    .attr("dy", 5)
    .attr("font-size", "8px")
    .attr("opacity", (d) => (d.centrality > 0 ? 1 : 0));
  svg
    .selectAll(".node-img")
    .attr("height", 10)
    .attr("width", 10)
    .attr("x", -5)
    .attr("y", -5);

  forceLayout
    .force("charge", d3.forceManyBody().strength(0))
    .force(
      "forceX",
      d3.forceX().x((d) => verticalNodeSelector[d.name][0]),
    )
    .force(
      "forceY",
      d3.forceY().y((d) => verticalNodeSelector[d.name][1]),
    )
    .force("center", d3.forceCenter().x(600).y(0))
    .force("collision", d3.forceCollide().radius(0));

  forceLayout.alpha(1).restart();

  d3.selectAll(".spider-element").remove();
  drawSpider();

  svg
    .selectAll(".spider-outline")
    .on("mouseover", function (event, d) {
      d3.selectAll(".spider-path")
        .transition()
        .duration(200)
        .style("fill-opacity", 0.1);

      d3.selectAll(".spider-outline")
        .transition()
        .duration(200)
        .style("stroke-opacity", 0.5);

      d3.select(this.parentNode)
        .select(".spider-path")
        .transition()
        .duration(200)
        .style("fill-opacity", 0.7);

      // Get mouse position
      var xPosition = event.x + 10 + "px";
      var yPosition = event.y - 10 + "px";
      // Show tooltip
      d3.select("#tooltip")
        .html(
          "<b>" +
            this.__data__.recipe +
            "</b><br>" +
            "score: " +
            this.__data__.score_info +
            "<br>" +
            "no. positive rating: " +
            this.__data__.rating_info +
            "<br>" +
            "calories: " +
            this.__data__.calories_info +
            "<br>" +
            "no. ingredients: " +
            this.__data__.num_ingedient_info +
            "<br>" +
            "cook time: " +
            this.__data__.cooktime_info +
            " mins",
        )
        .style("display", "inline-block")
        .style("left", xPosition)
        .style("top", yPosition);
    })
    .on("mouseout", function (event, d) {
      d3.selectAll(".spider-path")
        .transition()
        .duration(200)
        .style("fill-opacity", 0.5);
      d3.selectAll(".spider-outline")
        .transition()
        .duration(200)
        .style("stroke-opacity", 1);
      d3.select("#tooltip").style("display", "none");
    });
  svg.selectAll(".g-spider").attr("visibility", "visible");

  svg.selectAll(".spider-axe").transition().duration(1000).attr("opacity", 1);
  svg
    .selectAll(".spider-circle")
    .transition()
    .duration(1000)
    .attr("opacity", 1);
  svg
    .selectAll(".spider-text-path")
    .transition()
    .duration(1000)
    .attr("opacity", 1);
  svg
    .selectAll(".spider-element")
    .transition()
    .duration(1000)
    .attr("opacity", 1)
    .attr("pointer-events", "all");

  svg
    .selectAll(".spider-path")
    .transition()
    .duration(1000)
    .attr("fill-opacity", 0.5);
  svg
    .selectAll(".spider-outline")
    .transition()
    .duration(1000)
    .attr("stroke-opacity", 1);
}

// Store function to show, hide, generate visualtion in an array
let activationFunctions = [vis1, vis2, vis3, vis4, vis5, vis6, vis7, vis8];

/* Build scroller based on how to build a scoller by Chow, 2020 and Vallandingham, 2015
 scoller source code: https://github.com/cuthchow/college-majors-visualisation/blob/master/scroller.js
 */
// Set up variables and call function
let scroll = scroller().container(d3.select("#graphic"));

scroll();

let lastIndex,
  activeIndex = 0;

scroll.on("active", function (index) {
  // Select step element to change opacity based on position
  d3.selectAll(".step")
    .transition()
    .duration(500)
    .style("opacity", function (d, i) {
      return i === index ? 1 : 0.1;
    });

  activeIndex = index;
  let sign = activeIndex - lastIndex < 0 ? -1 : 1;
  let scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);

  // Call generating visualisation in list based on sectionIndex
  scrolledSections.forEach((i) => {
    activationFunctions[i]();
  });
  lastIndex = activeIndex;
});

scroll.on("progress", function (index, progress) {
  if ((index == 2) & (progress > 0.7)) {
  }
});

// Scroller function
function scroller() {
  // Set up element variables
  let container = d3.select("body");
  let dispatch = d3.dispatch("active", "progress");
  let sections = d3.selectAll(".step");
  let sectionPositions;

  let currentIndex = -1;
  let containerStart = 0;

  function scroll() {
    d3.select(window)
      .on("scroll.scroller", position)
      .on("resize.scroller", resize);

    resize();

    let timer = d3.timer(function () {
      position();
      timer.stop();
    });
  }

  function resize() {
    sectionPositions = [];
    let startPos;

    sections.each(function (d, i) {
      let top = this.getBoundingClientRect().top;

      if (i === 0) {
        startPos = top;
      }
      sectionPositions.push(top - startPos);
    });
  }

  function position() {
    // Get page position to get sectionIndex
    let pos = window.pageYOffset - 100 - containerStart;
    sectionIndex = d3.bisect(sectionPositions, pos);
    sectionIndex = Math.min(sections.size() - 1, sectionIndex);
    console.log(sectionIndex);

    if (currentIndex !== sectionIndex) {
      dispatch.call("active", this, sectionIndex);
      currentIndex = sectionIndex;
    }

    let prevIndex = Math.max(sectionIndex - 1, 0);
    let prevTop = sectionPositions[prevIndex];
    let progress = (pos - prevTop) / (sectionPositions[sectionIndex] - prevTop);
    dispatch.call("progress", this, currentIndex, progress);
  }

  scroll.container = function (value) {
    if (arguments.legth === 0) {
      return container;
    }
    container = value;
    return scroll;
  };

  scroll.on = function (action, callback) {
    dispatch.on(action, callback);
  };

  return scroll;
}

// Transform group object to stack to generating stack bar chart by Gómez, 2020
// https://observablehq.com/@john-guerra/d3-stack-with-d3-group
function groupToStack(data, groupBy, colorBy, reducer = (v) => v.length) {
  const groupedMap = d3.group(
    data,
    (d) => d[groupBy],
    (d) => d[colorBy],
  );

  const keys = Array.from(new Set(data.map((d) => d[colorBy])).values());

  return Array.from(groupedMap.entries()).map((g) => {
    const obj = {};
    obj[groupBy] = g[0];
    for (let col of keys) {
      const vals = g[1].get(col);
      obj[col] = !vals ? 0 : reducer(Array.from(vals.values()));
    }
    return obj;
  });
}

// Create function to toggle page to light and dark mode
function togglePageMode() {
  // Get checkbox element
  var checkBox = document.getElementById("toggle-mode");

  console.log(checkBox);
  // if checked then change page elements to dark mode
  if (checkBox.checked == true) {
    document.body.classList.add("dark-theme");
    document.getElementById("tooltip").classList.add("dark-theme");

    document
      .querySelectorAll("section")
      .forEach((item) =>
        item.setAttribute(
          "style",
          "background: linear-gradient(145deg, #292929, #303030); box-shadow:  5px 5px 10px #292929, -5px -5px 10px #323232;",
        ),
      );

    d3.selectAll(".vis-title").attr("fill", "#f6f9f9");
    d3.selectAll(".vis-intro").attr("fill", "#f6f9f9");
    d3.selectAll(".node-text").attr("fill", "#f6f9f9");
    d3.selectAll(".facet-title").attr("fill", "#f6f9f9");
    d3.selectAll(".stack-label").attr("fill", "#f6f9f9");
    d3.selectAll(".spider-text-path").attr("fill", "#f6f9f9");
    d3.selectAll(".selected-node-text").attr("fill", "#f6f9f9");
    d3.selectAll(".node-text-path").attr("fill", "#f6f9f9");
    d3.selectAll(".node-legend").attr("filter", "invert(1)");
    d3.selectAll(".facet-img").attr("filter", "invert(1)");
    for (let element of document.querySelectorAll(".app"))
      element.style.filter = "invert(1)";
    for (let element of document.querySelectorAll(".app"))
      element.style.color = "#232323";
  } else {
    // change page mode to default (light mode)
    document.body.classList.remove("dark-theme");
    document.getElementById("tooltip").classList.remove("dark-theme");

    document
      .querySelectorAll("section")
      .forEach((item) =>
        item.setAttribute(
          "style",
          "background: linear-gradient(145deg, #e3e6e6, #ffffff); box-shadow:  5px 5px 10px #e3e6e6, -5px -5px 10px #ffffff;",
        ),
      );

    d3.selectAll(".vis-title").attr("fill", "#232323");
    d3.selectAll(".vis-intro").attr("fill", "#232323");
    d3.selectAll(".node-text").attr("fill", "#232323");
    d3.selectAll(".facet-title").attr("fill", "#232323");
    d3.selectAll(".stack-label").attr("fill", "#232323");
    d3.selectAll(".spider-text-path").attr("fill", "#232323");
    d3.selectAll(".selected-node-text").attr("fill", "#232323");
    d3.selectAll(".node-text-path").attr("fill", "#232323");
    d3.selectAll(".node-legend").attr("filter", "invert(0)");
    d3.selectAll(".facet-img").attr("filter", "invert(0)");

    for (let element of document.querySelectorAll(".app"))
      element.style.filter = "invert(0)";
  }
}

//https://codepen.io/alvarotrigo/pen/LYzpemz
const scrollline = document.querySelector(".scroll-line");

function fillscrollline() {
  const windowHeight = window.innerHeight;
  const fullHeight = document.body.clientHeight;
  const scrolled = window.scrollY;
  percentScrolled = (scrolled / (fullHeight - windowHeight)) * 100;

  scrollline.style.width = percentScrolled + "%";

  console.log(percentScrolled);

  if (percentScrolled > 95) {
    for (let element of document.querySelectorAll(".mouse_scroll"))
      element.style.visibility = "hidden";
  } else {
    for (let element of document.querySelectorAll(".mouse_scroll"))
      element.style.visibility = "visible";
  }
}

window.addEventListener("scroll", fillscrollline);

// BUTTON
// target the button and the nested icon
const button = document.querySelector("button");
const svg = button.querySelector("svg");
// number of milliseconds in which to animate the button
const duration = 100;
// number of seconds to delay the animation of the icon
const delay = 50;

// specify a transition for both elements
// ! transition uses seconds instead of milliseconds
button.style.transition = `transform ${duration / 1000}s ease-in`;
svg.style.transition = `transform ${duration / 1000}s ${delay / 1000}s ease-in`;

// boolean used to toggle between question and exclamation mark
let isQuestion = true;

// on click animate the button to move vertically before changint the appearance of the nested icon
// ! update the boolean used as the toggle
// remove the click event listener before the animation is complete
function handleClick() {
  isQuestion = !isQuestion;
  button.removeEventListener("click", handleClick);

  // animate the button upwards (and the icon slightly more upwards)
  button.style.transform = "translate(50%, calc(50% - 5px))";
  svg.style.transform = "translateY(-3px)";

  // animate the button downwards, whilst updating the nested icon
  // once the translation is complete re-position the svg to its original y coordinate
  // ! open/close every details element in accordance with the isQuestion boolean
  const timeoutID = setTimeout(() => {
    svg
      .querySelector("use")
      .setAttribute("href", `#${isQuestion ? "question" : "exclamation"}-mark`);
    button.style.transform = "translate(50%, 50%)";
    svg.style.transform = "translateY(0%)";
    // reattach the event listener
    button.addEventListener("click", handleClick);
    // update the details element to either open or close them all
    const details = document.querySelectorAll("details");
    details.forEach((detail) => {
      isQuestion
        ? detail.removeAttribute("open", true)
        : detail.setAttribute("open", true);
    });
    clearTimeout(timeoutID);
  }, duration + delay);
}
button.addEventListener("click", handleClick);

// DETAILS & SUMMARY
// data describing the questions and answers
const faq = [
  {
    question: "About this project",
    answer:
      "This project focus on providing easy digest analysis about ingredient pairs and recipe selection for cooking enthusiasts and professionals in order to answer these following questions <ul><li>Which pairs of ingredients are likely to generate high recipes' score?</li><li>What are common ingredients that are important in the top recipes?</li></ul>Created by: Jirathip Kunkanjanathorn",
  },
  {
    question: "User guide",
    answer:
      "<ul><li>This narrative visualisation is mainly based on scrolling down the webpage to move on to the next visualisation</li><li>The project is mainly implemented for desktop browsers with mouse interaction such as hovering</li><li>It is highly recommended to open the webpage in mozilla firefox as it provides smoother animation</li><li>Toggle button on the top right is for switching page theme between light and dark mode</li></ul>",
  },
  {
    question: "Dataset sources",
    answer:
      '<ul><li><a href="https://www.kaggle.com/datasets/zeeenb/recipes-from-tasty">Tasty recipes and ingredients</a></li><li><a href="https://www.fao.org/faostat/en/#data/QV">FAO Food production</a></li><li>Text descriptions for important ingredients from <a href="https://www.wikipedia.org">wikipedia</a></li><li>Icons for important ingredients from <a href="https://www.flaticon.com">flaticon</a></li></ul>',
  },
  {
    question: "Acknowledgements",
    answer:
      '<ul><li>This project scroll events was adapted from <a href="https://towardsdatascience.com/how-i-created-an-interactive-scrolling-visualisation-with-d3-js-and-how-you-can-too-e116372e2c73">How I Created an Interactive, Scrolling Visualisation with D3.js, and how you can too</a> and <a href="https://vallandingham.me/scroller.html">So You Want to Build A Scroller</a> written by Cuthbert Chow and Jim Vallandingham</li><li>Toggle button for switching between light mode and dark mode is also added using a CSS button styling adapted from Voxybun from <a href="https://uiverse.io/detail/Voxybuns/horrible-shrimp-47">universe.io</a></li><li>The progress bar was added and adapted from the progress bar made by Álvaro from <a href="https://codepen.io/alvarotrigo/pen/LYzpemz">codepen.io</a></li><li>This details and summary elements was adapted from <a href="https://codepen.io/borntofrappe/pen/NZPRRE">codepen.io</a> by Gabriele Corti</li><li>Mouse arrows animation was apapted from  animation from <a href="https://codepen.io/rightblog/pen/EagNMN/">codepen.io</a> by Yurij</li></ul>',
  },
];

// detail summary by https://codepen.io/borntofrappe/pen/NZPRRE
// target the app container
const app = document.querySelector(".app");
// create a wrapping element in which to add the details & summaries
const appFaq = document.createElement("div");
appFaq.classList.add("app__faq");

// map through the faq array and add details element using the question in a summary element
// ! in the summary element include an svg icon to highlight the open/close toggle
const markup = faq
  .map(
    ({ question, answer }) => `
<details>
  <summary>
    ${question}
    <svg width="18" height="18">
      <use href="#arrow"></use>
    </svg>
  </summary>
  ${answer}
</details>
`,
  )
  .join("");

appFaq.innerHTML = markup;

// append the element
app.appendChild(appFaq);

/*
References
Álvaro. (n.d.). Progress Bar on Scroll made with CSS/HTML/JavaScript. Codepen. Retrieved October 27, 2022, from https://codepen.io/alvarotrigo/pen/LYzpemz
Bostock, M. (2020, June 11). Labeled Force Layout. Bl.ocks.org. https://bl.ocks.org/mbostock/950642
Bremer, N. (2022, August 20). Radar Chart Redesign. Bl.ocks.org. http://bl.ocks.org/nbremer/21746a9668ffdf6d8242
Chow, C. (2020, March 10). How I Created an Interactive, Scrolling Visualisation with D3.js, and how you can too. Medium. https://towardsdatascience.com/how-i-created-an-interactive-scrolling-visualisation-with-d3-js-and-how-you-can-too-e116372e2c73
Cook, P. (2021, May 15). Force layout. D3 in Depth. https://www.d3indepth.com/force-layout/
Corti, G. (n.d.). UI Blocky Accordian. Codepen. Retrieved October 27, 2022, from https://codepen.io/borntofrappe/pen/NZPRRE
Gómez, J. A. G. (2020, August 10). d3.stack with d3.group. Observable. https://observablehq.com/@john-guerra/d3-stack-with-d3-group
Holtz, Y. (n.d.-a). Basic stacked barplot in d3.js. D3-Graph-Gallery.com. https://d3-graph-gallery.com/graph/barplot_stacked_basicWide.html
Holtz, Y. (n.d.-b). Stacked barplot with tooltip in d3.js. D3-Graph-Gallery.com. Retrieved October 21, 2022, from https://d3-graph-gallery.com/graph/barplot_stacked_hover.html
Reid, A. (2020, December 29). javascript - How to create a “facetplot” in d3.js? Stack Overflow. https://stackoverflow.com/questions/65499073/how-to-create-a-facetplot-in-d3-js
Rosenberg, K. (2019, March 5). D3 “force” layout with nodes situated around a circle. Bl.ocks.org. http://bl.ocks.org/krosenberg/989204175f68f40dfe3b
Vallandingham, J. (2015, April 6). So You Want to Build A Scroller. Vallandingham.me. https://vallandingham.me/scroller.html
Voxybuns. (n.d.). Universe of UI elements made with HTML & CSS. Uiverse.io. Retrieved October 27, 2022, from https://uiverse.io/detail/Voxybuns/horrible-shrimp-47
Yang, D. (2019, March 1). D3 Spider Chart Tutorial. Yangdanny97.Github.io. https://yangdanny97.github.io/blog/2019/03/01/D3-Spider-Chart
*/
