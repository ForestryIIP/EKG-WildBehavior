/**
 * knowledge-graph-updated.js - Creates and manages knowledge graph visualizations
 * Interactive knowledge graph for the case study section
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize case study knowledge graph after a short delay
    setTimeout(() => {
        createCaseKnowledgeGraph();
    }, 2000);
});

/**
 * Create the knowledge graph for the case study section
 */
function createCaseKnowledgeGraph() {
    const graphContainer = document.getElementById('case-knowledge-graph');
    if (!graphContainer) return;
    
    // 清除加载指示器
    graphContainer.innerHTML = '';
    
    // 创建SVG
    const width = graphContainer.clientWidth;
    const height = graphContainer.clientHeight;
    
    // 创建SVG元素
    const svg = d3.select(graphContainer)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "knowledge-graph-svg");
    
    // 定义节点
    const nodes = [
        { id: "wasteland1", group: 3, label: "Wasteland1", size: 30 },
        { id: "wasteland2", group: 3, label: "Wasteland2", size: 30 },
        { id: "amur_tiger1", group: 1, label: "Amur Tiger1", size: 40 },
        { id: "amur_tiger2", group: 1, label: "Amur Tiger2", size: 40 },
        { id: "tree", group: 3, label: "Tree", size: 25 },
        { id: "grass", group: 3, label: "Grass", size: 25 }
    ];
    
    // 定义连接
    const links = [
        { source: "wasteland1", target: "amur_tiger1", type: "lie", value: 1 },
        { source: "amur_tiger1", target: "grass", type: "sniff", value: 1 },
        { source: "amur_tiger1", target: "amur_tiger2", type: "near", value: 1 },
        { source: "amur_tiger2", target: "tree", type: "near", value: 1 },
        { source: "amur_tiger2", target: "wasteland2", type: "walk", value: 1 }
    ];
    
    // 创建节点渐变
    createNodeGradients(svg);
    
    // 创建力导向布局
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => d.size + 10));
    
    // 不再创建箭头标记
    // createArrowMarkers(svg);
    
    // 创建连接
    const link = svg.append("g")
        .selectAll(".graph-link")
        .data(links)
        .enter()
        .append("path")
        .attr("class", "graph-link")
        // 移除箭头
        // .attr("marker-end", d => `url(#arrow-${getLinkColor(d.type)})`)
        .attr("stroke", d => getLinkColor(d.type))
        .attr("stroke-width", 2)
        .attr("opacity", 0.7)
        .attr("fill", "none");
    
    // 创建连接标签 - 直接在边上显示
    const linkLabel = svg.append("g")
        .selectAll(".link-label")
        .data(links)
        .enter()
        .append("text")
        .attr("class", "link-label")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("dy", -5)
        .attr("fill", d => getLinkColor(d.type))
        .text(d => d.type);
    
    // 创建节点
    const node = svg.append("g")
        .selectAll(".graph-node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "graph-node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    
    // 添加节点圆形
    node.append("circle")
        .attr("r", d => d.size)
        .attr("fill", d => `url(#gradient-${d.group})`)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("opacity", 0.85);
    
    // 添加节点标签
    node.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.3em")
        .attr("fill", "white")
        .attr("font-weight", "bold")
        .attr("font-size", d => d.size > 30 ? "14px" : "12px")
        .text(d => d.label);
    
    // 添加节点悬停效果
    // ...保持原有代码不变...
    
    // 更新模拟的tick函数
    simulation.on("tick", () => {
        // 约束节点在边界内
        nodes.forEach(d => {
            d.x = Math.max(d.size, Math.min(width - d.size, d.x));
            d.y = Math.max(d.size, Math.min(height - d.size, d.y));
        });
        
        // 更新连接路径 - 使用曲线路径
        link.attr("d", d => {
            // 创建曲线连接
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
            
            // 计算考虑节点大小的源和目标点
            const sourceSize = nodes.find(n => n.id === d.source.id).size;
            const targetSize = nodes.find(n => n.id === d.target.id).size;
            
            const angle = Math.atan2(dy, dx);
            const sourceX = d.source.x + Math.cos(angle) * sourceSize;
            const sourceY = d.source.y + Math.sin(angle) * sourceSize;
            // 移除箭头额外的偏移
            const targetX = d.target.x - Math.cos(angle) * targetSize;
            const targetY = d.target.y - Math.sin(angle) * targetSize;
            
            return `M${sourceX},${sourceY} A${dr},${dr} 0 0,1 ${targetX},${targetY}`;
        });
        
        // 更新连接标签位置 - 确保标签始终在边的中间
        linkLabel.attr("transform", d => {
            // 获取路径中点 - 使用getPointAtLength和getTotalLength
            const path = d3.select(`path[d*="M${d.source.x},${d.source.y}"]`).node();
            if (!path) return "";
            
            const midpoint = path.getPointAtLength(path.getTotalLength() / 2);
            return `translate(${midpoint.x}, ${midpoint.y})`;
        });
        
        // 更新节点位置
        node.attr("transform", d => `translate(${d.x}, ${d.y})`);
    });
    
    // 添加图例
    addGraphLegend(svg, width, height);
    
    // 最初隐藏加载指示器并在短延迟后显示图表
    const graphElements = svg.selectAll("g");
    graphElements.attr("opacity", 0);
    
    setTimeout(() => {
        graphElements.transition()
            .duration(1000)
            .attr("opacity", 1);
    }, 500);
    
    // 拖动函数
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

/**
 * Create gradient definitions for node groups
 * @param {Selection} svg - D3 selection for SVG
 */
function createNodeGradients(svg) {
    const defs = svg.append("defs");
    
    // Group 1: Animals (blue)
    const gradient1 = defs.append("radialGradient")
        .attr("id", "gradient-1")
        .attr("cx", "30%")
        .attr("cy", "30%")
        .attr("r", "70%");
        
    gradient1.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#3498db");
        
    gradient1.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#2980b9");
    
    // Group 2: Behaviors (orange)
    const gradient2 = defs.append("radialGradient")
        .attr("id", "gradient-2")
        .attr("cx", "30%")
        .attr("cy", "30%")
        .attr("r", "70%");
        
    gradient2.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#e74c3c");
        
    gradient2.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#c0392b");
    
    // Group 3: Environment (green)
    const gradient3 = defs.append("radialGradient")
        .attr("id", "gradient-3")
        .attr("cx", "30%")
        .attr("cy", "30%")
        .attr("r", "70%");
        
    gradient3.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#2ecc71");
        
    gradient3.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#27ae60");
    
    // Group 4: Relations (purple)
    const gradient4 = defs.append("radialGradient")
        .attr("id", "gradient-4")
        .attr("cx", "30%")
        .attr("cy", "30%")
        .attr("r", "70%");
        
    gradient4.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#9b59b6");
        
    gradient4.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#8e44ad");
}

function createArrowMarkers(svg) {
    const defs = svg.select("defs");
    
    // Define colors for different relationship types
    const colors = {
        blue: "#3498db",
        red: "#e74c3c",
        green: "#2ecc71",
        purple: "#9b59b6",
        yellow: "#f39c12"
    };
}

/**
 * Get color for a link based on relationship type
 * @param {string} type - Relationship type
 * @returns {string} Color identifier
 */
function getLinkColor(type) {
    const typeMap = {
        "lie": "green",
        "sniff": "red",
        "near": "purple",
        "walk": "red"
    };
    
    return typeMap[type] || "blue";
}

/**
 * Add elegant legend to knowledge graph
 * @param {Selection} svg - D3 selection for SVG
 * @param {number} width - Width of the SVG
 * @param {number} height - Height of the SVG
 */
function addGraphLegend(svg, width, height) {
    // Create main legend group
    const legend = svg.append("g")
        .attr("class", "graph-legend")
        .attr("transform", `translate(${width - 200}, 50)`);
    
    // Add legend background panel for better visual separation
    legend.append("rect")
        .attr("x", -10)
        .attr("y", -40)
        .attr("width", 195)
        .attr("height", 260)
        .attr("rx", 8)
        .attr("ry", 8)
        .attr("fill", "rgba(255, 255, 255, 0.9)")
        .attr("stroke", "#ddd")
        .attr("stroke-width", 1)
        .attr("filter", "drop-shadow(0px 2px 3px rgba(0,0,0,0.1))");
    
    // Add legend title with elegant styling
    legend.append("text")
        .attr("x", 82.5) // Center of panel
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("fill", "#2c3e50")
        .text("Knowledge Graph Legend");
    
    // Separator line
    legend.append("line")
        .attr("x1", 0)
        .attr("y1", -5)
        .attr("x2", 165)
        .attr("y2", -5)
        .attr("stroke", "#ddd")
        .attr("stroke-width", 1);
    
    // Create category headers
    legend.append("text")
        .attr("x", 0)
        .attr("y", 15)
        .attr("font-size", "13px")
        .attr("font-weight", "bold")
        .attr("fill", "#3498db")
        .text("Node Types");
    
    legend.append("text")
        .attr("x", 0)
        .attr("y", 105)
        .attr("font-size", "13px")
        .attr("font-weight", "bold")
        .attr("fill", "#e74c3c")
        .text("Relationships");
    
    // Node legend data with improved visual hierarchy
    const nodeLegendData = [
        { label: "Animal (Tiger)", group: 1, description: "Wildlife subject" },
        { label: "Environment", group: 3, description: "Habitat features" }
    ];
    
    // Create elegant node legend items
    nodeLegendData.forEach((item, i) => {
        const y = 35 + i * 30;
        
        // Node type indicator
        legend.append("circle")
            .attr("cx", 10)
            .attr("cy", y)
            .attr("r", 8)
            .attr("fill", `url(#gradient-${item.group})`)
            .attr("stroke", "white")
            .attr("stroke-width", 1.5);
        
        // Node label
        legend.append("text")
            .attr("x", 25)
            .attr("y", y + 4)
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .attr("fill", "#2c3e50")
            .text(item.label);
        
        // Node description
        legend.append("text")
            .attr("x", 28)
            .attr("y", y + 19)
            .attr("font-size", "10px")
            .attr("fill", "#7f8c8d")
            .text(item.description);
    });
    
    // Link legend data with more descriptive context
    const linkTypes = [
        { type: "lie", description: "Position relationship" },
        { type: "sniff", description: "Interaction behavior" },
        { type: "near", description: "Proximity relationship" },
        { type: "walk", description: "Movement behavior" }
    ];
    
    // Create elegant relationship legend items
    linkTypes.forEach((item, i) => {
        const y = 125 + i * 25;
        
        // Relationship line example
        legend.append("line")
            .attr("x1", 5)
            .attr("y1", y)
            .attr("x2", 25)
            .attr("y2", y)
            .attr("stroke", getLinkColor(item.type))
            .attr("stroke-width", 2.5)
            .attr("stroke-linecap", "round");
        
        // Relationship name
        legend.append("text")
            .attr("x", 30)
            .attr("y", y + 4)
            .attr("font-size", "12px")
            .attr("font-weight", "500")
            .attr("fill", getLinkColor(item.type))
            .text(item.type);
        
        // Relationship description
        legend.append("text")
            .attr("x", 65)
            .attr("y", y + 4)
            .attr("font-size", "10px")
            .attr("fill", "#7f8c8d")
            .text(`- ${item.description}`);
    });
    
    // Add discreet instruction text
    svg.append("g")
        .attr("transform", `translate(${width/2}, ${height - 20})`)
        .append("text")
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("fill", "#95a5a6")
        .attr("class", "instruction-text")
        .text("Drag nodes to explore relational networks");
}

/**
 * Show tooltip with node information
 * @param {Object} node - Node data
 * @param {number} x - X position
 * @param {number} y - Y position
 */
function showNodeTooltip(node, x, y) {
    // Check if tooltip already exists
    let tooltip = d3.select('body').select('.graph-tooltip');
    
    // Create tooltip if it doesn't exist
    if (tooltip.empty()) {
        tooltip = d3.select('body')
            .append('div')
            .attr('class', 'graph-tooltip')
            .style('position', 'absolute')
            .style('background', 'white')
            .style('padding', '10px')
            .style('border-radius', '5px')
            .style('box-shadow', '0 2px 10px rgba(0, 0, 0, 0.2)')
            .style('font-size', '14px')
            .style('z-index', 1000)
            .style('opacity', 0);
    }
    
    // Set tooltip content based on node type
    let content = `<strong>${node.label}</strong><br>`;
    
    switch (node.group) {
        case 1: // Animal
            content += `Type: Amur Tiger<br>`;
            content += `Role: Wildlife Subject`;
            break;
        case 2: // Behavior
            content += `Type: Action<br>`;
            content += `Category: Movement/Interaction`;
            break;
        case 3: // Environment
            content += `Type: Environmental Element<br>`;
            content += `Category: Natural Feature`;
            break;
        case 4: // Relation
            content += `Type: Spatial Relation<br>`;
            content += `Category: Proximity Indicator`;
            break;
    }
    
    // Set tooltip content and position
    tooltip
        .html(content)
        .style('left', `${x + 15}px`)
        .style('top', `${y - 30}px`)
        .transition()
        .duration(300)
        .style('opacity', 1);
}

/**
 * Hide the node tooltip
 */
function hideNodeTooltip() {
    d3.select('.graph-tooltip')
        .transition()
        .duration(300)
        .style('opacity', 0)
        .remove();
}

/**
 * Create a specific knowledge graph for analysis results
 * @param {string} containerId - ID of the container element
 * @param {Object} data - Graph data with nodes and links
 */
function createResultKnowledgeGraph(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Create SVG for knowledge graph
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Create SVG element
    const svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Add nodes and links visualization...
    // (Implementation would be similar to createCaseKnowledgeGraph but simplified)
}