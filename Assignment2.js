//1.

chart = {
   // Set the dimensions for the map.
const mapWidth = 960;
const mapHeight = 600;
// Define the map projection to be used, setting its scale and center.
const mapProjection = d3.geoAlbersUsa().scale(4 / 3 * mapWidth).translate([mapWidth / 2, mapHeight / 2]);

// Initialize a color scale for the visualization. The scale is sequential,
// meaning it represents data along a gradient. The interpolator defines the color scheme,
// and the domain is set based on the age of Walmart locations.
const colorGradient = d3.scaleSequential()
    .interpolator(d3.interpolateViridis) // This can be changed to use a different color palette.
    .domain([d3.max(walmarts, d => new Date().getFullYear() - new Date(d.date).getFullYear()), 0]);

// Create the SVG container for the visualization. The viewBox and dimensions are set,
// and styling is applied to ensure responsiveness.
const svgContainer = d3.create("svg")
    .attr("viewBox", `0 0 ${mapWidth} ${mapHeight}`)
    .attr("width", mapWidth)
    .attr("height", mapHeight)
    .attr("style", "max-width: 100%; height: auto;");

// Draw state borders on the map. This uses the stateMesh data to draw paths.
// The stroke and fill styles define the appearance of these borders.
svgContainer.append("path")
    .datum(stateMesh)
    .attr("fill", "none")
    .attr("stroke", "#777")
    .attr("stroke-width", 0.5)
    .attr("stroke-linejoin", "round")
    .attr("d", d3.geoPath(mapProjection));

// Create a group element to contain the bubbles that represent Walmart locations.
// Each bubble's size and position are determined by Walmart location data.
const locationBubbles = svgContainer.append("g")
    .attr("class", "locationBubbles");

// Define a function to calculate the radius of each bubble. The radius is
// proportional to the age of the Walmart location, providing a visual representation
// of how long each location has been established.
function calculateRadius(date) {
    const currentDate = new Date();
    const startDate = new Date(date);
    const ageYears = (currentDate - startDate) / (1000 * 60 * 60 * 24 * 365); // Convert milliseconds to years
    
    const scalingFactor = 0.75; // Adjusts the scale of the bubble sizes.
    return Math.sqrt(ageYears) * scalingFactor; // Square root scaling for a visually appealing distribution.
}

// Create the bubbles for each Walmart location. The bubbles are positioned
// based on geographical coordinates and colored according to their age.
locationBubbles.selectAll("circle")
    .data(walmarts)
    .join("circle")
        .attr("cx", d => mapProjection([d.longitude, d.latitude])[0])
        .attr("cy", d => mapProjection([d.longitude, d.latitude])[1])
        .attr("r", d => calculateRadius(d.date)) // Set radius based on location age.
        .attr("fill", d => colorGradient(new Date().getFullYear() - new Date(d.date).getFullYear()))
        .attr("opacity", 0.7)
        .append("title") // Tooltip showing latitude, longitude, and establishment date.
            .text(d => `Location: ${d.latitude}, ${d.longitude}\nOpened: ${d.date}`);

// Create a legend for the color gradient, helping users interpret the color scheme.
const scaleLegend = svgContainer.append("g")
    .attr("class", "scaleLegend")
    .attr("transform", "translate(580, 20)");

// Define dimensions for the legend.
const legendDims = { width: 200, height: 20 };

// Define a linear gradient for the color scale. This gradient is used in the legend
// to represent the range of values (age of locations) visually.
const gradientDef = scaleLegend.append("defs");
const gradient = gradientDef.append("linearGradient")
    .attr("id", "gradientColors")
    .attr("x1", "0%")
    .attr("x2", "100%");

// Populate the gradient with color stops, matching the color scale.
gradient.selectAll("stop")
    .data(colorGradient.ticks().map((tick, index, nodes) => ({
        offset: `${100 * index / (nodes.length - 1)}%`,
        color: colorGradient(tick),
        value: tick.toFixed(0)
    })))
    .join("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

// Add a rectangle filled with the linear gradient to the legend,
// and label it to indicate what the colors represent.
scaleLegend.append("rect")
    .attr("width", legendDims.width)
    .attr("height", legendDims.height)
    .style("fill", "url(#gradientColors)");

// Add explanatory text below the legend.
scaleLegend.append("text")
    .attr("x", legendDims.width / 2)
    .attr("y", legendDims.height + 11)
    .attr("text-anchor", "middle")
    .text("Age of Walmart Locations (Darker indicates older)");

// The svgContainer with all elements is returned for display.
return svgContainer.node();

}



//2.

chart = {
   // Define the dimensions for the map.
const width = 960, height = 600;

// Configure the map's projection as Albers USA, setting scale and center based on the dimensions.
const projection = d3.geoAlbersUsa().scale(4 / 3 * width).translate([width / 2, height / 2]);

// Initialize an SVG container for the map with a responsive style.
const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

// Draw state borders using a provided 'stateMesh' object. This outlines states with a specific stroke style.
svg.append("path")
    .datum(stateMesh)
    .attr("fill", "none")
    .attr("stroke", "#777")
    .attr("stroke-width", 0.5)
    .attr("stroke-linejoin", "round")
    .attr("d", d3.geoPath(projection));

// Define a fixed diameter for bubbles used in clustering.
const diameter = 19;

// Create a group to hold all bubble elements.
const bubbles = svg.append("g")
    .attr("class", "bubbles");

// Initialize an array to hold data about clusters of Walmart locations.
const aggregatedAgesCluster = [];

// Iterate over each Walmart location to project its coordinates and aggregate it into clusters based on proximity.
walmarts.forEach(location => {
    const [x, y] = projection([location.longitude, location.latitude]);
    // Find an existing cluster within the defined diameter from this location.
    const existingAggregation = aggregatedAgesCluster.find(a => Math.hypot(x - a.x, y - a.y) < diameter);
    
    // If a cluster exists, update its count and total age. Otherwise, create a new cluster.
    if (existingAggregation) {
        existingAggregation.count++;
        existingAggregation.totalAge += new Date().getFullYear() - new Date(location.date).getFullYear();
    } else {
        aggregatedAgesCluster.push({
            x, y,
            count: 1,
            totalAge: new Date().getFullYear() - new Date(location.date).getFullYear()
        });
    }
});

// Calculate the average age for each cluster.
aggregatedAgesCluster.forEach(aggregation => {
    aggregation.averageAge = aggregation.totalAge / aggregation.count;
});

// Set up a radius scale for bubbles based on the average age of clusters, adjusting bubble size accordingly.
const radiusScale = d3.scaleSqrt().domain([0, d3.max(aggregatedAgesCluster, d => d.averageAge)]).range([0, diameter / 2]);

// Define a color scale to visually differentiate clusters based on their average age, using a predefined color interpolator.
const colorScale = d3.scaleSequential(d3.interpolateMagma).domain(d3.extent(aggregatedAgesCluster, d => d.averageAge).reverse());

// Create bubbles for each cluster, setting their position, radius, and color based on the calculated scales.
bubbles.selectAll("circle").data(aggregatedAgesCluster).join("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", d => radiusScale(d.averageAge))
    .attr("fill", d => colorScale(d.averageAge))
    .attr("opacity", 0.7)
    .append("title")
    .text(d => `Average Age: ${d.averageAge.toFixed(1)} years\nLocations Aggregated: ${d.count}`);

// Set up a legend to help interpret the color scale of the clusters.
const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(580, 20)");

const legendWidth = 200, legendHeight = 20;

// Define a linear gradient for the legend based on the color scale.
const defs = legend.append("defs");
const linearGradient = defs.append("linearGradient")
    .attr("id", "color-gradient")
    .attr("x1", "0%")
    .attr("x2", "100%");

// Populate the gradient with color stops corresponding to the color scale ticks.
linearGradient.selectAll("stop")
    .data(colorScale.ticks().map((tick, i, nodes) => ({
        offset: `${100 * i / (nodes.length - 1)}%`,
        color: colorScale(tick),
        value: tick.toFixed(0)
    })))
    .join("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);

// Add a rectangle filled with the gradient to visually represent the legend.
legend.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#color-gradient)");

// Add descriptive text below the legend to indicate what it represents.
legend.append("text")
    .attr("x", legendWidth / 2)
    .attr("y", legendHeight + 10)
    .attr("text-anchor", "middle")
    .text("Age of Walmart Locations (Clustered)");

// Return the SVG node for insertion into the document.
return svg.node();

}



//3.
chart = {
// Set the dimensions for the visualization canvas.
const [mapWidth, mapHeight] = [960, 600];

// Configure the map projection to display the USA, adjusting scale and centering based on the canvas size.
const mapProjection = d3.geoAlbersUsa().scale(4 / 3 * mapWidth).translate([mapWidth / 2, mapHeight / 2]);

// Create the SVG element for the visualization, setting its dimensions and ensuring it's responsive.
const visualizationSvg = d3.create("svg")
    .attr("viewBox", [0, 0, mapWidth, mapHeight])
    .attr("width", mapWidth)
    .attr("height", mapHeight)
    .attr("style", "max-width: 100%; height: auto;");

// Draw the outlines of states on the map using a predefined 'stateMesh'. 
// This gives context for the store locations.
visualizationSvg.append("path")
    .datum(stateMesh)
    .attr("fill", "none")
    .attr("stroke", "#777")
    .attr("stroke-width", 0.5)
    .attr("stroke-linejoin", "round")
    .attr("d", d3.geoPath(mapProjection));

// Define a diameter for considering when stores are close enough to be in the same cluster.
const proximityDiameter = 19;

// Initialize a group element that will contain all the store location markers.
const locationBubbles = visualizationSvg.append("g")
    .attr("class", "locationBubbles");

// Prepare an array to hold clusters of stores based on their geographic proximity.
const locationClusters = [];

// Iterate through each store to determine its position on the map and cluster stores that are close together.
walmarts.forEach(store => {
    const [projectedX, projectedY] = mapProjection([store.longitude, store.latitude]);
    const existingCluster = locationClusters.find(cluster => Math.hypot(projectedX - cluster.centerX, projectedY - cluster.centerY) < proximityDiameter);
    
    // If the store is close to an existing cluster, add it to that cluster; otherwise, create a new cluster.
    if (existingCluster) {
        existingCluster.storeCount++;
        existingCluster.cumulativeAge += new Date().getFullYear() - new Date(store.date).getFullYear();
    } else {
        locationClusters.push({
            centerX: projectedX, 
            centerY: projectedY, 
            storeCount: 1, 
            cumulativeAge: new Date().getFullYear() - new Date(store.date).getFullYear()
        });
    }
});

// Calculate the average age of stores in each cluster.
locationClusters.forEach(cluster => {
    cluster.averageAge = cluster.cumulativeAge / cluster.storeCount;
});

// Define a scale for the radius of the location markers, based on the cumulative age of stores in a cluster.
const ageBasedRadiusScale = d3.scaleLinear()
    .domain([0, d3.max(locationClusters, cluster => cluster.cumulativeAge)])
    .range([2, proximityDiameter / 2]);

// Define a color scale for the location markers, where darker colors represent older store clusters.
const ageBasedColorScale = d3.scaleSequential(d3.interpolateInferno)
    .domain([d3.max(locationClusters, cluster => cluster.cumulativeAge), 0]);

// Create a marker for each cluster, setting its position, size, and color based on the cluster's characteristics.
locationBubbles.selectAll("circle")
    .data(locationClusters)
    .join("circle")
    .attr("cx", cluster => cluster.centerX)
    .attr("cy", cluster => cluster.centerY)
    .attr("r", cluster => ageBasedRadiusScale(cluster.cumulativeAge))
    .attr("fill", cluster => ageBasedColorScale(cluster.cumulativeAge))
    .attr("opacity", 0.7)
    .append("title")
    .text(cluster => `Average Age: ${cluster.averageAge.toFixed(1)} years\nCount: ${cluster.storeCount}`);

// Add a legend to the visualization to explain the color coding of the clusters.
const legend = visualizationSvg.append("g")
    .attr("class", "ageLegend")
    .attr("transform", "translate(580, 20)");

const legendWidth = 200, legendHeight = 20;

// Define a linear gradient that reflects the age-based color scale for use in the legend.
const gradientDefinition = legend.append("defs")
    .append("linearGradient")
    .attr("id", "ageGradient")
    .attr("x1", "0%")
    .attr("x2", "100%");

// Populate the gradient with color stops that match the age-based color scale.
gradientDefinition.selectAll("stop")
    .data(ageBasedColorScale.ticks().map((tick, i, nodes) => ({
        offset: `${100 * i / (nodes.length - 1)}%`, 
        color: ageBasedColorScale(tick), 
        value: tick.toFixed(0)
    })))
    .join("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);

// Use the defined gradient in a rectangle to visually represent the legend.
legend.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#ageGradient)");

// Add text to the legend to label what the gradient represents.
legend.append("text")
    .attr("x", legendWidth / 2)
    .attr("y", legendHeight + 10)
    .attr("text-anchor", "middle")
    .text("Age of Walmart Locations :: Darker for older ones");

// Return the SVG node so it can be added to the document.
return visualizationSvg.node();


}


//4.
chart ={
 const width = 928, height = 581;
const projection = d3.geoAlbersUsa().scale(4 / 3 * width).translate([width / 2, height / 2]);
const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]).attr("style", "max-width: 100%; height: auto;");

const covid_data = final_data.reduce((acc, row) => {
    const projectionResult = projection([row.long, row.lat]);
    if (!projectionResult) return acc;
    const { x, y } = projectionResult;
    const { cases, deaths, fips } = row;
    const existingData = acc.find(d => d.fips === fips);
    if (existingData) {
        existingData.cases = parseInt(cases);
        existingData.deaths = parseInt(deaths);
    } else {
        acc.push({ x, y, fips, cases: parseInt(cases), deaths: parseInt(deaths) });
    }
    return acc;
}, []);

const national_average = covid_data.reduce((total, row) => total + row.cases, 0) / covid_data.length;

svg.append("path").datum(stateMesh)
    .attr("fill", "none").attr("stroke", "#777").attr("stroke-width", 0.5)
    .attr("stroke-linejoin", "round").attr("d", d3.geoPath(projection));

const bubbles = svg.append("g").attr("class", "bubbles");

bubbles.selectAll("circle").data(covid_data).join("circle")
    .attr("cx", d => d.x).attr("cy", d => d.y)
    .attr("r", d => (cases, national_average) => {
        return cases >= national_average ? Math.SQRT2 * 6 : 6;
    }(d.cases, national_average))
    .attr("fill", d => (cases, national_average) => {
        return cases >= national_average ? "pink" : "none";
    }(d.cases, national_average))
    .attr("opacity", 0.57);

return svg.node();

}

//5.
function createMapChart(finalData, stateMesh) {
    const w = 928, h = 581, p = d3.geoAlbersUsa().scale(4 / 3 * w).translate([w / 2, h / 2]);
    const s = d3.create("svg").attr("viewBox", [0, 0, w, h]).attr("style", "max-width:100%;height:auto;");
    const d = [], c = [], r = d3.scaleLinear().domain([0, d3.max(d, d => d.deaths / d.cases)]).range([0, 30]);

    finalData.forEach(row => {
        const pr = p([row.long, row.lat]);
        if (pr) {
            const [x, y] = pr, cases = parseInt(row.cases), deaths = parseInt(row.deaths), f = row.fips;
            const e = d.find(e => e.fips === row.fips);
            e ? (e.cases = cases, e.deaths = deaths) : d.push({ x, y, fips: f, cases, deaths });
        }
    });

    let na = 0;
    d.forEach(row => { na += row.cases; });
    na /= d.length;
    console.log("National Average Cases:", na);

    d.forEach(e => { e.deathRatio = e.deaths / e.cases; });
    const getColor = deathRatio => deathRatio >= 0.05 ? "green" : "lightblue";

    s.append("path").datum(stateMesh).attr("fill", "none").attr("stroke", "#777").attr("stroke-width", 0.5).attr("stroke-linejoin", "round").attr("d", d3.geoPath(p));

    s.append("g").attr("class", "bubbles").selectAll("circle").data(d).join("circle").attr("cx", d => d.x).attr("cy", d => d.y).attr("r", d => r(d.deathRatio)).attr("fill", d => getColor(d.deathRatio)).attr("opacity", 0.56);

    return s.node();
}


//DATA LOADING (4-5):
corona_data = {

  const parseDate = d3.utcParse("%Y-%m-%d");
  return  d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv")
    .then(data => data.map((d) => ({
      fips: d.fips,
      deaths: d.deaths,
      cases: d.cases,
      date: parseDate(d.date)
    })));
}

filter_data = {
  const startDate = new Date("2021-02-01");
  const endDate = new Date("2021-03-01");
  const filteredData = corona_data.filter(d => d.date >= startDate && d.date <= endDate && d.fips);
  return filteredData;
}

county_coordinates = {
      return d3.csv("https://gist.githubusercontent.com/russellsamora/12be4f9f574e92413ea3f92ce1bc58e6/raw/3f18230058afd7431a5d394dab7eeb0aafd29d81/us_county_latlng.csv").then(data => data.map((d) => ({
        fips: d.fips_code,
        lat: d.lat,
        long: d.lng
      })));
}

filter_data.forEach(data => {
    data.lat = county_coordinates.find(row => row.fips === data.fips) ?county_coordinates.find(row => row.fips===data.fips).lat:0;
  data.long = county_coordinates.find(row => row.fips === data.fips) ?county_coordinates.find(row => row.fips===data.fips).long:0;
});

final_data = {
  return filter_data.filter(d => d.lat!=0 && d.long!=0);
}

final_data.forEach(data => {
    data.lat = parseFloat(data.lat);
    data.long = parseFloat(data.long);
});
