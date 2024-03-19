//1.

chart = {
    const width = 960, height = 600;
const projection = d3.geoAlbersUsa().scale(4 / 3 * width).translate([width / 2, height / 2]);
const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]).attr("style", "max-width: 100%; height: auto;");

svg.append("path").datum(stateMesh).attr("fill", "none").attr("stroke", "#777").attr("stroke-width", 0.5).attr("stroke-linejoin", "round").attr("d", d3.geoPath(projection));

const bubbles = svg.append("g").attr("class", "bubbles");

function findBubbleRadius(date) {
    const ageInYears = (new Date() - new Date(date)) / (1000 * 60 * 60 * 24 * 365);
    return Math.sqrt(ageInYears) * 0.75; 
}

bubbles.selectAll("circle").data(walmarts).join("circle")
    .attr("cx", d => projection([d.longitude, d.latitude])[0])
    .attr("cy", d => projection([d.longitude, d.latitude])[1])
    .attr("r", d => findBubbleRadius(d.date))
    .attr("fill", d => d3.interpolateViridis(new Date().getFullYear() - new Date(d.date).getFullYear()))
    .attr("opacity", 0.7)
    .append("title")
    .text(d => `Location: ${d.latitude}, ${d.longitude}\nEstablished: ${d.date}`);

const legend = svg.append("g").attr("class", "legend").attr("transform", "translate(580, 20)");
const defs = legend.append("defs");
const linearGradient = defs.append("linearGradient").attr("id", "color-gradient").attr("x1", "0%").attr("x2", "100%");

linearGradient.selectAll("stop").data(d3.ticks(0, new Date().getFullYear() - d3.max(walmarts, d => new Date(d.date).getFullYear()), 10)).join("stop")
    .attr("offset", (d, i, nodes) => `${100 * i / (nodes.length - 1)}%`)
    .attr("stop-color", d => d3.interpolateViridis(d))
    .attr("stop-opacity", 1);

legend.append("rect").attr("width", 200).attr("height", 20).style("fill", "url(#color-gradient)");
legend.append("text").attr("x", 90).attr("y", 35).attr("text-anchor", "middle").text("Age of Walmart Locations");

return svg.node();

}



//2.

chart = {
   const width = 960, height = 600;
const projection = d3.geoAlbersUsa().scale(4 / 3 * width).translate([width / 2, height / 2]);
const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]).attr("style", "max-width: 100%; height: auto;");

svg.append("path").datum(stateMesh).attr("fill", "none").attr("stroke", "#777").attr("stroke-width", 0.5).attr("stroke-linejoin", "round").attr("d", d3.geoPath(projection));

const diameter = 19;
const bubbles = svg.append("g").attr("class", "bubbles");
const aggregatedAgesCluster = [];

walmarts.forEach(location => {
    const [x, y] = projection([location.longitude, location.latitude]);
    const existingAggregation = aggregatedAgesCluster.find(a => Math.hypot(x - a.x, y - a.y) < diameter);
    
    if (existingAggregation) {
        existingAggregation.count++;
        existingAggregation.totalAge += new Date().getFullYear() - new Date(location.date).getFullYear();
    } else {
        aggregatedAgesCluster.push({ x, y, count: 1, totalAge: new Date().getFullYear() - new Date(location.date).getFullYear() });
    }
});

aggregatedAgesCluster.forEach(aggregation => {
    aggregation.averageAge = aggregation.totalAge / aggregation.count;
});

const radiusScale = d3.scaleSqrt().domain([0, d3.max(aggregatedAgesCluster, d => d.averageAge)]).range([0, diameter / 2]);
const colorScale = d3.scaleSequential(d3.interpolateMagma).domain(d3.extent(aggregatedAgesCluster, d => d.averageAge).reverse());

bubbles.selectAll("circle").data(aggregatedAgesCluster).join("circle")
    .attr("cx", d => d.x).attr("cy", d => d.y)
    .attr("r", d => radiusScale(d.averageAge))
    .attr("fill", d => colorScale(d.averageAge))
    .attr("opacity", 0.7)
    .append("title").text(d => `Average Age: ${d.averageAge.toFixed(1)} years\nLocations Aggregated: ${d.count}`);

const legend = svg.append("g").attr("class", "legend").attr("transform", "translate(580, 20)");
const legendWidth = 200, legendHeight = 20;
const defs = legend.append("defs");
const linearGradient = defs.append("linearGradient").attr("id", "color-gradient").attr("x1", "0%").attr("x2", "100%");

linearGradient.selectAll("stop").data(colorScale.ticks().map((tick, i, nodes) => ({ offset: `${100 * i / (nodes.length - 1)}%`, color: colorScale(tick), value: tick.toFixed(0) }))).join("stop")
    .attr("offset", d => d.offset).attr("stop-color", d => d.color);

legend.append("rect").attr("width", legendWidth).attr("height", legendHeight).style("fill", "url(#color-gradient)");

legend.append("text").attr("x", legendWidth / 2).attr("y", legendHeight + 10).attr("text-anchor", "middle").text("Age of Walmart Locations (Clustered)");

return svg.node();

}



//3.
chart = {
const [mapWidth, mapHeight] = [960, 600];
const mapProjection = d3.geoAlbersUsa().scale(4 / 3 * mapWidth).translate([mapWidth / 2, mapHeight / 2]);
const visualizationSvg = d3.create("svg").attr("viewBox", [0, 0, mapWidth, mapHeight]).attr("width", mapWidth).attr("height", mapHeight).attr("style", "max-width: 100%; height: auto;");

visualizationSvg.append("path").datum(stateMesh).attr("fill", "none").attr("stroke", "#777").attr("stroke-width", 0.5).attr("stroke-linejoin", "round").attr("d", d3.geoPath(mapProjection));
const proximityDiameter = 19;
const locationBubbles = visualizationSvg.append("g").attr("class", "locationBubbles");
const locationClusters = [];

walmarts.forEach(store => {
    const [projectedX, projectedY] = mapProjection([store.longitude, store.latitude]);
    const existingCluster = locationClusters.find(cluster => Math.hypot(projectedX - cluster.centerX, projectedY - cluster.centerY) < proximityDiameter);
    if (existingCluster) {
        existingCluster.storeCount++;
        existingCluster.cumulativeAge += new Date().getFullYear() - new Date(store.date).getFullYear();
    } else {
        locationClusters.push({ centerX: projectedX, centerY: projectedY, storeCount: 1, cumulativeAge: new Date().getFullYear() - new Date(store.date).getFullYear() });
    }
});

locationClusters.forEach(cluster => {
    cluster.averageAge = cluster.cumulativeAge / cluster.storeCount;
});

const ageBasedRadiusScale = d3.scaleLinear().domain([0, d3.max(locationClusters, cluster => cluster.cumulativeAge)]).range([0, proximityDiameter / 2]);
const ageBasedColorScale = d3.scaleSequential(d3.interpolateInferno).domain([d3.max(locationClusters, cluster => cluster.cumulativeAge), 0]);

locationBubbles.selectAll("circle").data(locationClusters).join("circle").attr("cx", cluster => cluster.centerX).attr("cy", cluster => cluster.centerY).attr("r", cluster => ageBasedRadiusScale(cluster.cumulativeAge)).attr("fill", cluster => ageBasedColorScale(cluster.cumulativeAge)).attr("opacity", 0.7).append("title").text(cluster => `Average Age: ${cluster.averageAge.toFixed(1)} years\nCount: ${cluster.storeCount}`);

const legend = visualizationSvg.append("g").attr("class", "ageLegend").attr("transform", "translate(580, 20)");
const legendWidth = 200, legendHeight = 20;
const gradientDefinition = legend.append("defs").append("linearGradient").attr("id", "ageGradient").attr("x1", "0%").attr("x2", "100%");

gradientDefinition.selectAll("stop").data(ageBasedColorScale.ticks().map((tick, i, nodes) => ({ offset: `${100 * i / (nodes.length - 1)}%`, color: ageBasedColorScale(tick), value: tick.toFixed(0) }))).join("stop").attr("offset", d => d.offset).attr("stop-color", d => d.color);

legend.append("rect").attr("width", legendWidth).attr("height", legendHeight).style("fill", "url(#ageGradient)");

legend.append("text").attr("x", legendWidth / 2).attr("y", legendHeight + 10).attr("text-anchor", "middle").text("Age of Walmart Locations :: Darker for older ones");

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
