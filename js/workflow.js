/**
 * workflow-updated.js - Creates and manages the interactive workflow diagram
 * Advanced animation and interactivity for the methodological workflow
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize workflow diagram after a short delay to ensure container is ready
    setTimeout(() => {
        createMethodWorkflow();
    }, 1000);
});

/**
 * Create the interactive method workflow diagram
 */
function createMethodWorkflow() {
    const container = document.getElementById('workflow-diagram');
    if (!container) return;
    
    // Clear loading indicator
    container.innerHTML = '';
    
    // Create SVG for the workflow diagram
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Create SVG element with D3
    const svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "workflow-svg");
    
    // Define gradient for connections
    const defs = svg.append("defs");
    
    const gradient = defs.append("linearGradient")
        .attr("id", "connection-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");
        
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#3498db");
        
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#e74c3c");
    
    // Define workflow stages
    const stages = [
        {
            id: 'overview',
            name: 'System Overview',
            description: 'End-to-end automated identification of wildlife behavior',
            icon: 'project-diagram',
            x: width * 0.15,
            y: height * 0.5,
            color: '#3498db'
        },
        {
            id: 'identification',
            name: 'Entity Identification',
            description: 'YOLO + CWA-SAM for precise animal & environment segmentation',
            icon: 'camera',
            x: width * 0.38,
            y: height * 0.5,
            color: '#2ecc71'
        },
        {
            id: 'prediction',
            name: 'Behavior Prediction',
            description: 'Dual-branch processing with vision and text pathways',
            icon: 'code-branch',
            x: width * 0.62,
            y: height * 0.5,
            color: '#f39c12'
        },
        {
            id: 'description',
            name: 'Behavior Description',
            description: 'LLM-based natural language descriptions with knowledge graph',
            icon: 'comment-alt',
            x: width * 0.85,
            y: height * 0.5,
            color: '#e74c3c'
        }
    ];
    
    // Define connections between stages
    const connections = [
        { source: 'overview', target: 'identification' },
        { source: 'identification', target: 'prediction' },
        { source: 'prediction', target: 'description' }
    ];
    
    // Create a group for background elements
    const backgroundGroup = svg.append("g")
        .attr("class", "background-group");
    
    // Add decorative background elements
    addBackgroundElements(backgroundGroup, width, height);
    
    // Create a group for connections
    const connectionGroup = svg.append("g")
        .attr("class", "connection-group");
    
    // Create connections
    connections.forEach(connection => {
        const source = stages.find(stage => stage.id === connection.source);
        const target = stages.find(stage => stage.id === connection.target);
        
        if (!source || !target) return;
        
        // Calculate control points for curved path
        const controlX1 = source.x + (target.x - source.x) * 0.3;
        const controlY1 = source.y + (Math.random() * 40 - 20); // Add some randomness to Y
        const controlX2 = source.x + (target.x - source.x) * 0.7;
        const controlY2 = target.y + (Math.random() * 40 - 20); // Add some randomness to Y
        
        // Create path for connection
        const path = connectionGroup.append("path")
            .attr("d", `M${source.x},${source.y} C${controlX1},${controlY1} ${controlX2},${controlY2} ${target.x},${target.y}`)
            .attr("fill", "none")
            .attr("stroke", "url(#connection-gradient)")
            .attr("stroke-width", 3)
            .attr("opacity", 0)
            .attr("class", "connection-path");
        
        // Add animated markers along the path
        addAnimatedMarkers(svg, path, source.color, target.color);
    });
    
    // Create a group for stages
    const stageGroup = svg.append("g")
        .attr("class", "stage-group");
    
    // Create stages
    stages.forEach((stage, index) => {
        const group = stageGroup.append("g")
            .attr("class", "workflow-stage")
            .attr("id", `stage-${stage.id}`)
            .attr("transform", `translate(${stage.x}, ${stage.y})`)
            .attr("opacity", 0)
            .style("cursor", "pointer");
        
        // Create stage circle
        const circle = group.append("circle")
            .attr("r", 50)
            .attr("fill", "white")
            .attr("stroke", stage.color)
            .attr("stroke-width", 3)
            .attr("class", "stage-circle");
        
        // Create stage icon
        const icon = group.append("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("class", "fa")
            .attr("font-family", "FontAwesome")
            .attr("font-size", "24px")
            .attr("fill", stage.color)
            .text(getIconUnicode(stage.icon));
        
        // Create stage name text
        group.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 80)
            .attr("fill", "#2c3e50")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .text(stage.name);
        
        // Create stage popup info
        const infoBox = group.append("g")
            .attr("class", "stage-info")
            .attr("opacity", 0);
            
        // Add info background
        infoBox.append("rect")
            .attr("x", -120)
            .attr("y", -120)
            .attr("width", 240)
            .attr("height", 80)
            .attr("rx", 10)
            .attr("fill", stage.color)
            .attr("opacity", 0.9);
            
        // Add info text
        infoBox.append("text")
            .attr("x", 0)
            .attr("y", -90)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .text(stage.description)
            .call(wrapText, 220);
        
        // Add hover and click interactions
        group
            .on("mouseover", function() {
                // Highlight the stage
                circle.transition()
                    .duration(300)
                    .attr("r", 55)
                    .attr("stroke-width", 4);
                
                // Show info box
                infoBox.transition()
                    .duration(300)
                    .attr("opacity", 1);
                
                // Highlight connected paths
                connectionGroup.selectAll("path")
                    .filter(function() {
                        return this.getAttribute("d").includes(`${stage.x},${stage.y}`);
                    })
                    .transition()
                    .duration(300)
                    .attr("stroke-width", 5);
            })
            .on("mouseout", function() {
                // Reset the stage
                circle.transition()
                    .duration(300)
                    .attr("r", 50)
                    .attr("stroke-width", 3);
                
                // Hide info box
                infoBox.transition()
                    .duration(300)
                    .attr("opacity", 0);
                
                // Reset connected paths
                connectionGroup.selectAll("path")
                    .transition()
                    .duration(300)
                    .attr("stroke-width", 3);
            })
            .on("click", function() {
                // Pulse animation on click
                circle.transition()
                    .duration(200)
                    .attr("r", 60)
                    .transition()
                    .duration(200)
                    .attr("r", 50);
                
                // Scroll to corresponding section
                scrollToSection(stage.id);
            });
    });
    
    // Create a group for labels
    const labelGroup = svg.append("g")
        .attr("class", "label-group");
    
    // Add title
    labelGroup.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .attr("fill", "#2c3e50")
        .text("EKG-WildBehavior Methodology")
        .attr("opacity", 0)
        .transition()
        .delay(1000)
        .duration(1000)
        .attr("opacity", 1);
    
    // Add subtitle
    labelGroup.append("text")
        .attr("x", width / 2)
        .attr("y", 55)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#7f8c8d")
        .text("End-to-end Knowledge Graph-based automated identification of Wildlife Behavior")
        .attr("opacity", 0)
        .transition()
        .delay(1200)
        .duration(1000)
        .attr("opacity", 1);
    
    // Add instruction
    labelGroup.append("text")
        .attr("x", width / 2)
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#7f8c8d")
        .text("Hover over stages for details or click to navigate")
        .attr("opacity", 0)
        .transition()
        .delay(2000)
        .duration(1000)
        .attr("opacity", 1);
    
    // Animate the workflow diagram
    animateWorkflow(stageGroup, connectionGroup);
}

/**
 * Add decorative background elements to the workflow diagram
 * @param {Selection} group - D3 selection for the background group
 * @param {number} width - Width of the container
 * @param {number} height - Height of the container
 */
function addBackgroundElements(group, width, height) {
    // Add grid pattern
    for (let i = 0; i < width; i += 40) {
        group.append("line")
            .attr("x1", i)
            .attr("y1", 0)
            .attr("x2", i)
            .attr("y2", height)
            .attr("stroke", "#ecf0f1")
            .attr("stroke-width", 1);
    }
    
    for (let i = 0; i < height; i += 40) {
        group.append("line")
            .attr("x1", 0)
            .attr("y1", i)
            .attr("x2", width)
            .attr("y2", i)
            .attr("stroke", "#ecf0f1")
            .attr("stroke-width", 1);
    }
    
    // Add decorative circles
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 5 + 3;
        
        group.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", r)
            .attr("fill", "#ecf0f1")
            .attr("opacity", 0.5);
    }
}

/**
 * Add animated markers along a path
 * @param {Selection} svg - D3 selection for the SVG
 * @param {Selection} path - D3 selection for the path
 * @param {string} startColor - Starting color for gradient
 * @param {string} endColor - Ending color for gradient
 */
function addAnimatedMarkers(svg, path, startColor, endColor) {
    // Get path node
    const pathNode = path.node();
    const pathLength = pathNode.getTotalLength();
    
    // Create marker group
    const markerGroup = svg.append("g")
        .attr("class", "marker-group");
    
    // Create gradient for markers
    const color = d3.scaleLinear()
        .domain([0, 1])
        .range([startColor, endColor]);
    
    // Create markers along the path
    for (let i = 0; i < 3; i++) {
        const marker = markerGroup.append("circle")
            .attr("r", 4)
            .attr("fill", "white")
            .attr("stroke", d => color(0))
            .attr("stroke-width", 2)
            .attr("opacity", 0);
        
        // Animate the marker along the path
        animateMarker(marker, pathNode, pathLength, i * 1000, color);
    }
}

/**
 * Animate a marker along a path
 * @param {Selection} marker - D3 selection for the marker
 * @param {Node} pathNode - DOM node for the path
 * @param {number} pathLength - Total length of the path
 * @param {number} delay - Animation delay in milliseconds
 * @param {Function} colorScale - D3 color scale function
 */
function animateMarker(marker, pathNode, pathLength, delay, colorScale) {
    // Start animation after path is drawn
    setTimeout(() => {
        // Make marker visible
        marker
            .attr("opacity", 1)
            .attr("cx", 0)
            .attr("cy", 0);
        
        // Start animation
        (function repeat() {
            marker
                .attr("opacity", 0)
                .attr("transform", "translate(0, 0)");
            
            marker
                .transition()
                .duration(500)
                .attr("opacity", 1)
                .transition()
                .duration(3000)
                .ease(d3.easeLinear)
                .attrTween("transform", function() {
                    return function(t) {
                        // Get point at current position
                        const point = pathNode.getPointAtLength(t * pathLength);
                        
                        // Update marker color based on position
                        marker.attr("stroke", colorScale(t));
                        
                        // Return translation to current point
                        return `translate(${point.x}, ${point.y})`;
                    };
                })
                .transition()
                .duration(500)
                .attr("opacity", 0)
                .on("end", repeat);
        })();
    }, delay + 2000); // Delay after path is drawn
}

/**
 * Animate the entire workflow diagram
 * @param {Selection} stageGroup - D3 selection for the stage group
 * @param {Selection} connectionGroup - D3 selection for the connection group
 */
function animateWorkflow(stageGroup, connectionGroup) {
    // Animate connections with draw effect
    connectionGroup.selectAll("path")
        .transition()
        .delay((d, i) => 500 + i * 300)
        .duration(1500)
        .attr("opacity", 1)
        .attrTween("stroke-dasharray", function() {
            const length = this.getTotalLength();
            return function(t) {
                return `${t * length},${length}`;
            };
        });
    
    // Animate stages with fade in and scale effect
    stageGroup.selectAll(".workflow-stage")
        .transition()
        .delay((d, i) => 1000 + i * 300)
        .duration(800)
        .attr("opacity", 1)
        .each(function(d, i) {
            // Add floating animation to stage circles
            const circle = d3.select(this).select("circle");
            
            (function pulse() {
                circle
                    .transition()
                    .duration(2000)
                    .attr("r", 53)
                    .transition()
                    .duration(2000)
                    .attr("r", 50)
                    .on("end", pulse);
            })();
        });
}

/**
 * Get FontAwesome unicode for an icon name
 * @param {string} iconName - The name of the icon
 * @returns {string} Unicode character for the icon
 */
function getIconUnicode(iconName) {
    const iconMap = {
        'project-diagram': '\uf542',
        'camera': '\uf030',
        'code-branch': '\uf126',
        'comment-alt': '\uf27a'
    };
    
    return iconMap[iconName] || '\uf013'; // Default to gear icon
}

/**
 * Wrap text to fit within a given width
 * @param {Selection} text - D3 selection for text element
 * @param {number} width - Width to fit text within
 */
function wrapText(text, width) {
    text.each(function() {
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse();
        const lineHeight = 1.1; // em
        const y = text.attr("y");
        const dy = parseFloat(text.attr("dy") || 0);
        
        let line = [];
        let lineNumber = 0;
        let word = words.pop();
        let tspan = text.text(null).append("tspan")
            .attr("x", text.attr("x"))
            .attr("y", y)
            .attr("dy", dy + "em");
            
        while (word) {
            line.push(word);
            tspan.text(line.join(" "));
            
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                
                tspan = text.append("tspan")
                    .attr("x", text.attr("x"))
                    .attr("y", y)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .text(word);
            }
            
            word = words.pop();
        }
    });
}

/**
 * Scroll to a specific section based on stage ID
 * @param {string} stageId - ID of the clicked stage
 */
function scrollToSection(stageId) {
    // Map stage IDs to section IDs
    const sectionMap = {
        'overview': 'method',
        'identification': 'innovations',
        'prediction': 'fusion-mechanism',
        'description': 'case-study'
    };
    
    const sectionId = sectionMap[stageId] || 'method';
    const section = document.getElementById(sectionId);
    
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        
        // Highlight the section briefly
        section.classList.add('section-highlight');
        setTimeout(() => {
            section.classList.remove('section-highlight');
        }, 1000);
    }
}