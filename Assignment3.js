//1.
chart = {
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, 960, 600]);

  svg.append("path")
      .datum(topojson.merge(us, us.objects.lower48.geometries))
      .attr("fill", "#ddd")
      .attr("d", d3.geoPath());

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.lower48, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", d3.geoPath());

  const g = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "green");

  const dot = g.selectAll("circle")
    .data(data)
    .join("circle")
      .attr("transform", d => `translate(${d})`);

  svg.append("circle")
      .attr("fill", "blue")
      .attr("transform", `translate(${data[0]})`)
      .attr("r", 3);

  let previousDate = -Infinity;

  return Object.assign(svg.node(), {
    update(date) {
      dot // enter
        .filter(d => d.date > previousDate && d.date <= date)
        .transition().attr("r", 3);
      dot // exit
        .filter(d => d.date <= previousDate && d.date > date)
        .transition().attr("r", 0);
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
