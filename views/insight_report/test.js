
var width = 300,
    height = 250,
    maxRadius = Math.min(width, height) / 2;

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	var data =  [{
	    "nodeData": {
	        "age": "<5",
	        "population": 60
	    },
	    "subData": [{
	        "nodeData": {
	            "age": "<5",
	            "population": 60
	        },
	        "subData": [{
	            "nodeData": {
	                "age": "<5",
	                "population": 60
	            }
	        }]
	    }]
	}, {
	    "nodeData": {
	        "age": "5-35",
	        "population": 100
	    },
	    "subData": [{
	        "nodeData": {
	            "age": "5-15",
	            "population": 60
	        },
	        "subData": [{
	            "nodeData": {
	                "age": "5-10",
	                "population": 30
	            }
	        }, {
	            "nodeData": {
	                "age": "10-15",
	                "population": 30
	            }
	        }]
	    }, {
	        "nodeData": {
	            "age": "15-35",
	            "population": 40
	        },
	        "subData": [{
	            "nodeData": {
	                "age": "15-25",
	                "population": 25
	            }
	        }, {
	            "nodeData": {
	                "age": "25-35",
	                "population": 15
	            }
	        }]
	    }]
	}, {
	    "nodeData": {
	        "age": "35-65",
	        "population": 100
	    },
	    "subData": [{
	        "nodeData": {
	            "age": "35-50",
	            "population": 75
	        },
	        "subData": [{
	            "nodeData": {
	                "age": "35-50",
	                "population": 75
	            }
	        }]
	    }, {
	        "nodeData": {
	            "age": "50-65",
	            "population": 25
	        },
	        "subData": [{
	            "nodeData": {
	                "age": "50-65",
	                "population": 25
	            }
	        }]
	    }]
	}, {
	    "nodeData": {
	        "age": ">65",
	        "population": 100
	    },
	    "subData": [{
	        "nodeData": {
	            "age": "65-75",
	            "population": 60
	        },
	        "subData": [{
	            "nodeData": {
	                "age": "65-75",
	                "population": 60
	            }
	        }]
	    }, {
	        "nodeData": {
	            "age": ">75",
	            "population": 40
	        },
	        "subData": [{
	            "nodeData": {
	                "age": ">75",
	                "population": 40
	            }
	        }]
	    }]
	}];




var multiLevelData = [];
var setMultiLevelData = function(data) {
    if (data == null)
        return;
    var level = data.length,
        counter = 0,
        index = 0,
        currentLevelData = [],
        queue = [];
    for (var i = 0; i < data.length; i++) {
        queue.push(data[i]);
    };

    while (!queue.length == 0) {
        var node = queue.shift();
        currentLevelData.push(node);
        level--;

        if (node.subData) {
            for (var i = 0; i < node.subData.length; i++) {
                queue.push(node.subData[i]);
                counter++;
            };
        }
        if (level == 0) {
            level = counter;
            counter = 0;            multiLevelData.push(currentLevelData);
            currentLevelData = [];
        }
    }
}

var drawPieChart = function(_data, index) {
    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
            return d.nodeData.population;
        });
    var arc = d3.svg.arc()
        .outerRadius((index + 1) * pieWidth - 1)
        .innerRadius(index * pieWidth);

    var g = svg.selectAll(".arc" + index).data(pie(_data)).enter().append("g")
        .attr("class", "arc" + index);

    g.append("path").attr("d", arc)
        .style("fill", function(d) {
            return color(d.data.nodeData.age);
        });

    g.append("text").attr("transform", function(d) {
            return "translate(" + arc.centroid(d) + ")";
        })
        .attr("dy", ".35em").style("text-anchor", "middle")
        .text(function(d) {
            return d.data.nodeData.age;
        });
}


setMultiLevelData(data);

var pieWidth = parseInt(maxRadius / multiLevelData.length) - multiLevelData.length;

var color = d3.scale.category20();

for (var i = 0; i < multiLevelData.length; i++) {
    var _cData = multiLevelData[i];
    drawPieChart(_cData, i);
}
