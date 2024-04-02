//1.
chart = {
 // Create an SVG container for the map visualization.
const svg = d3.create("svg")
      .attr("viewBox", [0, 0, 960, 600]);

// Add a path element to draw the merged states of the US. This forms the main landmass.
// `topojson.merge` combines geometries from a TopoJSON object into a single geometry, which is useful for creating a unified map background.
svg.append("path")
      .datum(topojson.merge(us, us.objects.lower48.geometries))
      .attr("fill", "#ddd") // Set the fill color for the merged states.
      .attr("d", d3.geoPath()); // Use the geographic path generator to convert GeoJSON to SVG path data.

// Add another path element to outline the states. This differentiates the states visually.
// `topojson.mesh` creates a mesh for the borders between states, with a predicate function to exclude borders shared by the same state (a !== b).
svg.append("path")
      .datum(topojson.mesh(us, us.objects.lower48, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "white") // Set the stroke color for state borders.
      .attr("stroke-linejoin", "round") // Smooths the corners where path segments meet.
      .attr("d", d3.geoPath()); // Convert geographic paths to SVG paths.

// Prepare a group element (`<g>`) to contain dynamically added circles (dots) representing data points.
const g = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "green"); // Set the stroke color for the circles to green.

// Bind data to circle elements within the group, setting their initial position based on data.
const dot = g.selectAll("circle")
    .data(data)
    .join("circle")
      .attr("transform", d => `translate(${d})`); // Position each circle according to its data.

// Add an individual blue circle for a specific data point, likely to highlight it or for testing.
svg.append("circle")
      .attr("fill", "blue")
      .attr("transform", `translate(${data[0]})`) // Position it according to the first item in the data array.
      .attr("r", 3); // Set the radius of the circle.

// Initialize a variable to keep track of the previous date in the dataset.
let previousDate = -Infinity;

// Augment the SVG node with an `update` method to change the visualization based on a new date.
return Object.assign(svg.node(), {
    update(date) {
      // Enter selection: Update circles representing data points that have become relevant between the previous and new dates.
      dot.filter(d => d.date > previousDate && d.date <= date)
        .transition().attr("r", 3); // Increase radius to make these points visible.

      // Exit selection: Hide circles representing data points that are no longer relevant.
      dot.filter(d => d.date <= previousDate && d.date > date)
        .transition().attr("r", 0); // Decrease radius to hide these points.

      // Update the `previousDate` to the new date after changes have been applied.
      previousDate = date;
    }
});
}

//2.
chart={
const svg = d3.create("svg").attr("viewBox", [0, 0, 960, 600]);

svg.append("path").datum(topojson.merge(us, us.objects.lower48.geometries)).attr("fill", "#ddd").attr("d", d3.geoPath());

svg.append("path").datum(topojson.mesh(us, us.objects.lower48, (a, b) => a !== b)).attr("fill", "none").attr("stroke", "#666").attr("stroke-linejoin", "round").attr("d", d3.geoPath());

const adjustedData = data.map(d => ({coordinates: [d[0], d[1]], date: new Date(d.date)}));

const midpointGroup = svg.append("g");

function findNearestOutlet(filteredData, targetOutlet) {
  let nearestOutlet = null, shortestDistance = Infinity;
  filteredData.forEach(outlet => {if (outlet === targetOutlet) return; const distance = Math.sqrt(Math.pow(outlet.coordinates[0] - targetOutlet.coordinates[0], 2) + Math.pow(outlet.coordinates[1] - targetOutlet.coordinates[1], 2)); if (distance < shortestDistance) {shortestDistance = distance; nearestOutlet = outlet;}});
  return nearestOutlet;
}

function calculateMidpoints(filteredData) {
  return filteredData.map(outlet => {const nearestOutlet = findNearestOutlet(filteredData, outlet); if (!nearestOutlet) return null; const midpoint = [(outlet.coordinates[0] + nearestOutlet.coordinates[0]) / 2, (outlet.coordinates[1] + nearestOutlet.coordinates[1]) / 2]; return { midpoint };}).filter(d => d !== null);
}

function update(selectedDate) {
  const parsedSelectedDate = new Date(selectedDate);
  const filteredData = adjustedData.filter(d => d.date <= parsedSelectedDate);
  const midpointsData = calculateMidpoints(filteredData);

  const midpoints = midpointGroup.selectAll("circle").data(midpointsData, d => d.midpoint.join(","));

  midpoints.enter().append("circle").attr("transform", d => `translate(${d.midpoint})`).attr("r", 0).attr("fill", "teal").transition().duration(300).attr("r", 3);
  midpoints.exit().transition().duration(500).attr("r", 0).remove();
}

const latestDate = d3.max(adjustedData, d => d.date);
update(latestDate.toISOString());

return Object.assign(svg.node(), { update });
}


//3.
chart = {
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, 960, 600]);

  svg.append("path")
      .datum(topojson.merge(us, us.objects.lower48.geometries))
      .attr("fill", "#aaa") // Change fill color for the map
      .attr("d", d3.geoPath());

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.lower48, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "#666") // Change stroke color for map borders
      .attr("stroke-width", 0.5) // Adjust stroke width for map borders
      .attr("stroke-linejoin", "round")
      .attr("d", d3.geoPath());

  const g = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "black");

  const dot = g.selectAll("circle")
    .data(processedData)
     .join("circle")
      .attr("transform", d => `translate(${projection([d.longitude, d.latitude])})`)
      .attr("r", d=>Math.pow(d.cases,1/6)) // Reduce bubble size
      .attr("fill", "#006400") // Change fill color for circles to dark green
      .attr("stroke", "#fff") // Change stroke color for circles
      .attr("stroke-width", 1); // Adjust stroke width for circles

  let previousDate = 2000;

  return Object.assign(svg.node(), {
    update(date) {
      dot // enter
        .filter(d => d.year > previousDate && d.year <= date)
        .transition().attr("r", d=>Math.pow(d.cases,1/6)) // Adjust size transition for circles
        .attr("fill", "#006400") // Change fill color transition for circles to dark green
        .attr("stroke", "#fff"); // Change stroke color transition for circles
      dot // exit
        .filter(d => d.year <= previousDate && d.year > date)
        .transition().attr("r", 0);
      previousDate = date;
    }
  });
}

//4.
Chart =  {
  const width = 928;
  const height = 581;
  const projection = d3.geoAlbersUsa().scale(4 / 3 * width).translate([width / 2, height / 2]);
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto;");

  svg.append("path")
    .datum(stateMesh)
    .attr("fill", "none")
    .attr("stroke", "#777")
    .attr("stroke-width", 0.5)
    .attr("stroke-linejoin", "round")
    .attr("d", d3.geoPath(projection));

  let stateYearlyCases = {};
  aggregatedArray.forEach(item => {
    Object.entries(item).forEach(([yearState, data]) => {
      if (!stateYearlyCases[yearState]) {
        stateYearlyCases[yearState] = {
          year: data.year,
          state: data.state,
          cases: 0,
          latitude: data.latitude,
          longitude: data.longitude
        };
      }
      stateYearlyCases[yearState].cases += data.cases;
    });
  });

  let flatData = Object.values(stateYearlyCases);

  const maxCases = d3.max(flatData, d => d.cases);
  const radiusScale = d3.scaleSqrt().domain([d3.min(flatData, d => d.cases), maxCases]).range([0, 25]);

  const circles = svg.selectAll("circle")
    .data(flatData, d => `${d.year}-${d.state}`)
    .enter().append("circle")
      .attr("transform", d => {
        const coords = projection([d.longitude, d.latitude]);
        return coords ? `translate(${coords})` : null;
      })
      .attr("r", d => radiusScale(d.cases))
      .attr("fill", d => d.cases > 5000 ? "#008080" : "#4682B4") // Change color scheme to blue/green
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .append("title")
      .text(d => `${d.year}-${d.state}: ${d.cases} total cases`);

  const update = (year) => {
    const yearData = flatData.filter(d => d.year === String(year));
    svg.selectAll("circle")
      .data(yearData, d => `${d.year}-${d.state}`)
      .attr("r", d => radiusScale(d.cases))
      .attr("fill", d => d.cases > 5000 ? "#008080" : "#4682B4");
  }

  const initialYear = d3.min(flatData, d => d.year);
  update(initialYear);

  return Object.assign(svg.node(), { update });
};


//5.
Chart =  {
  const width = 928;
  const height = 581;
  const projection = d3.geoAlbersUsa().scale(4 / 3 * width).translate([width / 2, height / 2]);

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto;");

  svg.append("path")
    .datum(stateMesh)
    .attr("fill", "#f0f0f0")
    .attr("stroke", "#888")
    .attr("stroke-width", 1)
    .attr("stroke-linejoin", "round")
    .attr("d", d3.geoPath(projection));

  let stateYearlyGenderCases = {};

  Object.entries(processedData3).forEach(([disease, diseaseData]) => {
    Object.entries(diseaseData).forEach(([yearStateGender, data]) => {
      const [year, state, gender] = yearStateGender.split("-");
      const key = `${year}-${state}-${gender}`;

      if (!stateYearlyGenderCases[key]) {
        stateYearlyGenderCases[key] = {
          year,
          state,
          gender,
          cases: 0,
          latitude: data.latitude,
          longitude: data.longitude,
        };
      }

      stateYearlyGenderCases[key].cases += data.cases;
    });
  });

  let flatData = Object.values(stateYearlyGenderCases);

  const maxCases = d3.max(flatData, d => d.cases);
  const radiusScale = d3.scaleSqrt().domain([d3.min(flatData, d => d.cases), maxCases]).range([0, 20]);

  const colorScale = d3.scaleOrdinal()
    .domain(["Male", "Female"])
    .range(["#4CAF50", "#2196F3"]);

  const circles = svg.selectAll("circle")
    .data(flatData, d => `${d.year}-${d.state}-${d.gender}`)
    .enter().append("circle")
    .attr("transform", d => {
      const coords = projection([d.longitude, d.latitude]);
      return coords ? `translate(${coords})` : null;
    })
    .attr("r", d => radiusScale(d.cases))
    .attr("fill", d => colorScale(d.gender))
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .append("title")
    .text(d => `${d.year}-${d.state}-${d.gender}: ${d.cases} total cases`);

  const legend = svg.selectAll(".legend")
    .data(colorScale.domain())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(0,${i * 20})`);

  legend.append("rect")
    .attr("x", width - 180)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", colorScale);

  legend.append("text")
    .attr("x", width - 156)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(d => d);

  function update(year) {
    const yearData = flatData.filter(d => d.year === String(year));

    svg.selectAll("circle")
      .data(yearData, d => `${d.year}-${d.state}-${d.gender}`)
      .attr("r", d => radiusScale(d.cases));
  }

  const initialYear = d3.min(flatData, d => d.year);
  update(initialYear);

  return Object.assign(svg.node(), { update });
};
