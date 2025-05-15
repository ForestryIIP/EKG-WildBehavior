/**
 * main-updated.js - Main JavaScript file for EKG-WildBehavior
 * Handles core functionality, animations, and interactions
 */

/**
 * Initialize innovation section visuals
 */
function initInnovationVisuals() {
    // 初始化分割视觉效果
    initSegmentationVisual();
    
    // 初始化DABPM视觉效果
    initDABPMVisual();
    
    // 初始化LLM视觉效果
    initLLMVisual();
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components with staggered timing
    initNavigation();
    initScrollAnimations();
    
    setTimeout(() => initMethodDiagram(), 100);
    setTimeout(() => initFusionDiagram(), 200);
    setTimeout(() => initInnovationVisuals(), 300);
    setTimeout(() => initCaseStudyKnowledgeGraph(), 400);
    setTimeout(() => initApplicationsModule(), 500);
    
    setupModalInteractions();
});



/**
 * Initialize the segmentation visualization in the innovations section
 */
function initSegmentationVisual() {
    const container = document.getElementById('segmentation-visual');
    if (!container) return;
    
    // 简单实现，如果需要更复杂的效果可以后续添加
}

/**
 * Initialize the LLM visualization in the innovations section
 */
function initLLMVisual() {
    const container = document.getElementById('llm-visual');
    if (!container) return;
    
    // 简单实现，如果需要更复杂的效果可以后续添加
}

/**
 * Initialize navigation functionality
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('nav ul li a');
    
    // Update active nav link on click
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Smooth scroll to target section
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Update active nav link on scroll
    window.addEventListener('scroll', function() {
        let currentSection = '';
        const sections = document.querySelectorAll('section');
        const scrollPosition = window.scrollY + 200;
        
        sections.forEach(section => {
            if (scrollPosition >= section.offsetTop) {
                currentSection = '#' + section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentSection) {
                link.classList.add('active');
            }
        });
    });
}

/**
 * Initialize scroll-based animations using Intersection Observer
 */
function initScrollAnimations() {
    // Initialize reveal animations
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };
    
    const revealObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
    
    // Add floating animation to certain elements
    const floatElements = document.querySelectorAll('.stage-icon, .innovation-icon, .contact-icon');
    floatElements.forEach(element => {
        element.classList.add('float-sm');
    });
}

/**
 * Initialize the method workflow diagram
 */
function initMethodDiagram() {
    const workflowContainer = document.getElementById('workflow-diagram');
    if (!workflowContainer) return;
    
    // The actual workflow diagram is initialized in workflow-updated.js
    // This just adds a loading effect until it's ready
    workflowContainer.innerHTML = `
        <div class="loading-indicator">
            <div class="loader"></div>
            <p>Initializing workflow diagram...</p>
        </div>
    `;
}

/**
 * Initialize the fusion mechanism diagram
 */
function initFusionDiagram() {
    const fusionContainer = document.getElementById('fusion-diagram');
    if (!fusionContainer) return;
    
    // The actual fusion diagram is initialized in fusion-diagram.js
    // This just adds a loading effect until it's ready
    fusionContainer.innerHTML = `
        <div class="loading-indicator">
            <div class="loader"></div>
            <p>Loading fusion mechanism visualization...</p>
        </div>
    `;
    
    // 确保此函数被调用
    createFusionDiagram();
}

/**
 * Initialize innovation section visuals
 */
// function initInnovationVisuals() {
//     // Initialize segmentation visual
//     initSegmentationVisual();
    
//     // Initialize DABPM visual
//     initDABPMVisual();
    
//     // Initialize LLM visual
//     initLLMVisual();
// }

/**
 * Initialize the segmentation visualization in the innovations section
 */
// function initSegmentationVisual() {
//     const container = document.getElementById('segmentation-visual');
//     if (!container) return;
    
//     container.innerHTML = `
//         <div class="segmentation-demo">
//             <div class="original-image">
//                 <img src="/api/placeholder/200/150" alt="Original animal image">
//                 <div class="label">Original</div>
//             </div>
//             <div class="segmentation-arrow">
//                 <i class="fas fa-long-arrow-alt-right arrow-flash"></i>
//             </div>
//             <div class="segmented-image">
//                 <div class="segmentation-outline"></div>
//                 <img src="/api/placeholder/200/150" alt="Segmented animal image">
//                 <div class="label">Segmented</div>
//             </div>
//         </div>
//     `;
    
//     // Add animation to the segmentation outline
//     const outlineElement = container.querySelector('.segmentation-outline');
//     if (outlineElement) {
//         setTimeout(() => {
//             outlineElement.classList.add('active');
//         }, 1000);
//     }
// }

/**
 * Initialize the DABPM visualization in the innovations section
 */
function initDABPMVisual() {
    const container = document.getElementById('dabpm-visual');
    if (!container) return;
    
    container.innerHTML = `
        <div class="dabpm-diagram">
            <div class="branch vision-branch">
                <div class="branch-icon"><i class="fas fa-eye"></i></div>
                <div class="branch-label">Vision</div>
                <div class="data-flow"></div>
            </div>
            <div class="branch text-branch">
                <div class="branch-icon"><i class="fas fa-file-alt"></i></div>
                <div class="branch-label">Text</div>
                <div class="data-flow"></div>
            </div>
            <div class="fusion-point pulse"></div>
            <div class="output-arrow arrow-flash">
                <i class="fas fa-arrow-right"></i>
            </div>
            <div class="prediction">
                <div class="prediction-icon"><i class="fas fa-lightbulb"></i></div>
                <div class="prediction-label">Behavior</div>
            </div>
        </div>
    `;
    
    // Animate data flow
    animateDataFlow();
}

/**
 * Animate the data flow in the DABPM diagram
 */
function animateDataFlow() {
    const visionFlow = document.querySelector('.vision-branch .data-flow');
    const textFlow = document.querySelector('.text-branch .data-flow');
    
    if (!visionFlow || !textFlow) return;
    
    // Create data particles
    for (let i = 0; i < 3; i++) {
        createDataParticle(visionFlow, 'vision-data-particle', i * 1000);
        createDataParticle(textFlow, 'text-data-particle', i * 1000 + 500);
    }
}

/**
 * Create an animated data particle for the DABPM diagram
 * @param {HTMLElement} container - The container element
 * @param {string} className - CSS class for styling
 * @param {number} delay - Animation delay in ms
 */
function createDataParticle(container, className, delay) {
    const particle = document.createElement('div');
    particle.className = `data-particle ${className}`;
    
    container.appendChild(particle);
    
    setTimeout(() => {
        particle.classList.add('active');
        
        // Remove particle after animation completes
        setTimeout(() => {
            particle.remove();
            // Create a new particle to replace it (continuous animation)
            createDataParticle(container, className, 0);
        }, 2000);
    }, delay);
}

/**
 * Initialize the LLM visualization in the innovations section
 */
// function initLLMVisual() {
//     const container = document.getElementById('llm-visual');
//     if (!container) return;
    
//     container.innerHTML = `
//         <div class="llm-terminal">
//             <div class="terminal-header">
//                 <div class="terminal-buttons">
//                     <span class="terminal-button"></span>
//                     <span class="terminal-button"></span>
//                     <span class="terminal-button"></span>
//                 </div>
//                 <div class="terminal-title">Knowledge Graph LLM Integration</div>
//             </div>
//             <div class="terminal-body">
//                 <div class="terminal-line command">> Generate behavior description</div>
//                 <div class="terminal-line response typing-text-container">
//                     <span class="typing-text" data-text="analyzing input..."></span>
//                 </div>
//                 <div class="terminal-line response typing-text-container delay-1">
//                     <span class="typing-text" data-text="integrating with knowledge graph..."></span>
//                 </div>
//                 <div class="terminal-line response typing-text-container delay-2">
//                     <span class="typing-text" data-text="generating natural language description..."></span>
//                 </div>
//                 <div class="terminal-line response description typing-text-container delay-3">
//                     <span class="typing-text" data-text="The Amur tiger is patrolling through the dense forest, exhibiting a steady walking gait with alert posture and periodic scanning of surroundings."></span>
//                 </div>
//                 <div class="terminal-line cursor">> _</div>
//             </div>
//         </div>
//     `;
    
//     // Initialize typing animations with delays
//     const typingElements = container.querySelectorAll('.typing-text');
//     typingElements.forEach((element, index) => {
//         setTimeout(() => {
//             initiateTypingAnimation(element);
//         }, index * 1500);
//     });
// }

/**
 * Start typing animation for an element
 * @param {HTMLElement} element - The element to animate
 */
function initiateTypingAnimation(element) {
    const text = element.getAttribute('data-text');
    
    // Clear the element
    element.textContent = '';
    element.style.width = '0';
    element.classList.add('typing-text');
    
    // Set animation duration based on text length
    const duration = Math.max(1, text.length * 0.03); // 30ms per character, minimum 1s
    element.style.animationDuration = `${duration}s, 0.5s`;
    
    // Set the text for animation
    setTimeout(() => {
        element.textContent = text;
    }, 100);
}

/**
 * Initialize the knowledge graph for the case study section
 */
function initCaseStudyKnowledgeGraph() {
    const graphContainer = document.getElementById('case-knowledge-graph');
    if (!graphContainer) return;
    
    // Loading animation first
    graphContainer.innerHTML = `
        <div class="loading-indicator">
            <div class="loader"></div>
            <p>Initializing knowledge graph...</p>
        </div>
    `;
    
    // The actual graph will be initialized by knowledge-graph-updated.js
}

/**
 * Initialize the applications module
 */
function initApplicationsModule() {
    setupSpeciesSelection();
    setupAnalysisButtons();
}

/**
 * Set up species selection functionality
 */
function setupSpeciesSelection() {
    const speciesItems = document.querySelectorAll('.species-item');
    const uploadButton = document.getElementById('upload-button');
    
    speciesItems.forEach(item => {
        item.addEventListener('click', function() {
            // Toggle active class on species items
            speciesItems.forEach(si => si.classList.remove('active'));
            this.classList.add('active');
            
            // Get selected species
            const species = this.getAttribute('data-species');
            
            // Load species images
            loadSpeciesImages(species);
            
            // Enable upload button
            if (uploadButton) {
                uploadButton.disabled = false;
            }
        });
    });
    
    // Handle upload button click
    if (uploadButton) {
        uploadButton.addEventListener('click', function() {
            // Get selected images
            const selectedImages = document.querySelectorAll('.image-item.selected');
            
            if (selectedImages.length === 0) {
                alert('Please select at least one image');
                return;
            }
            
            // Simulate upload process
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i> Upload Complete';
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-upload"></i> Upload Selected Images';
                    this.disabled = false;
                }, 2000);
            }, 2000);
        });
    }
}

/**
 * Load images for the selected species
 * @param {string} species - Selected species name
 */
function loadSpeciesImages(species) {
    const imagesContainer = document.getElementById('species-images');
    if (!imagesContainer) return;
    
    // 移除no-selection消息如果存在
    const noSelectionMsg = imagesContainer.querySelector('.no-selection-message');
    if (noSelectionMsg) {
        noSelectionMsg.remove();
    }
    
    // 显示加载动画
    imagesContainer.innerHTML = `
        <div class="loading-indicator">
            <div class="loader"></div>
            <p>Loading images for ${species}...</p>
        </div>
    `;
    
    // 从本地Flask后端获取图片
    console.log(`Fetching images for species: ${species}`);
    fetch(`https://120.53.14.250:5000/api/species/${species}/images`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // 输出API响应数据以便调试
            console.log(`API Response for ${species}:`, data);
            
            // 清除加载指示器
            imagesContainer.innerHTML = '';
            
            // 添加图片到容器
            if (data.images && data.images.length > 0) {
                console.log(`Found ${data.images.length} images for ${species}`);
                data.images.forEach(imageInfo => {
                    console.log(`Adding image: ${imageInfo.url}`);
                    // 创建图片容器
                    const imageItem = document.createElement('div');
                    imageItem.className = 'image-item';
                    imageItem.setAttribute('data-image-id', imageInfo.id);
                    
                    // 添加图片和复选框
                    imageItem.innerHTML = `
                        <img src="https://120.53.14.250:5000${imageInfo.url}" alt="${species} ${imageInfo.id}">
                        <div class="image-checkbox">
                            <i class="fas fa-check"></i>
                        </div>
                    `;
                    
                    // 添加点击处理程序以切换选择
                    imageItem.addEventListener('click', function() {
                        this.classList.toggle('selected');
                        updateUploadButtonState();
                    });
                    
                    // 添加图片到容器
                    imagesContainer.appendChild(imageItem);
                });
            } else {
                console.log(`No images found for ${species}`);
                imagesContainer.innerHTML = `
                    <div class="no-images-message">
                        <p>No images available for ${species}</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error loading images:', error);
            imagesContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error loading images: ${error.message}</p>
                </div>
            `;
        });
}

/**
 * Set up analysis button functionality
 */
function setupAnalysisButtons() {
    const analysisButtons = document.querySelectorAll('.analysis-button');
    const resultsContainer = document.getElementById('results-container');
    
    if (!analysisButtons.length || !resultsContainer) return;
    
    analysisButtons.forEach(button => {
        button.addEventListener('click', function() {
            const analysisType = this.getAttribute('data-analysis');
            
            // Check if species is selected
            const selectedSpecies = document.querySelector('.species-item.active');
            if (!selectedSpecies) {
                alert('Please select a species first');
                return;
            }
            
            // Check if images are selected
            const selectedImages = document.querySelectorAll('.image-item.selected');
            if (selectedImages.length === 0) {
                alert('Please select at least one image');
                return;
            }
            
            // Highlight active button
            analysisButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show loading state
            resultsContainer.innerHTML = `
                <div class="loading-indicator">
                    <div class="loader"></div>
                    <p>Running ${analysisType.replace('-', ' ')} analysis...</p>
                </div>
            `;
            
            // Simulate analysis with delay
            setTimeout(() => {
                displayAnalysisResults(analysisType, selectedSpecies.getAttribute('data-species'));
            }, 2000);
        });
    });
}

/**
 * Display analysis results based on the selected type
 * @param {string} analysisType - Type of analysis to display
 * @param {string} species - The selected species
 */
function displayAnalysisResults(analysisType, species) {
    const resultsContainer = document.getElementById('results-container');
    if (!resultsContainer) return;
    
    switch (analysisType) {
        case 'detection':
            resultsContainer.innerHTML = `
                <div class="analysis-result detection-result">
                    <div class="result-image">
                        <img src="/api/placeholder/200/150" alt="${species} detection">
                        <div class="detection-box" style="top: 20%; left: 30%; width: 45%; height: 60%;">
                            <div class="detection-label">${species} (96%)</div>
                        </div>
                    </div>
                    <div class="result-description">
                        <h4>Detection Results</h4>
                        <p>Object detection successfully identified ${species} with 96% confidence. The bounding box highlights the area where the animal was detected in the image.</p>
                        <div class="metrics">
                            <div class="metric">
                                <span class="metric-name">Confidence:</span>
                                <span class="metric-value">96%</span>
                            </div>
                            <div class="metric">
                                <span class="metric-name">Detection Time:</span>
                                <span class="metric-value">0.24s</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'segmentation':
            resultsContainer.innerHTML = `
                <div class="analysis-result segmentation-result">
                    <div class="result-image">
                        <img src="/api/placeholder/200/150" alt="${species} segmentation">
                        <svg class="segmentation-mask" viewBox="0 0 500 300">
                            <path class="mask-path" d="M150,100 C170,50 250,30 300,80 C350,130 400,150 380,200 C360,250 300,280 250,260 C200,240 130,150 150,100 Z" fill="rgba(52, 152, 219, 0.4)" stroke="rgba(52, 152, 219, 0.8)" stroke-width="2"></path>
                        </svg>
                    </div>
                    <div class="result-description">
                        <h4>Segmentation Results</h4>
                        <p>CWA-SAM model precisely segmented the ${species} from the background with high accuracy. The segmentation mask highlights the exact shape of the animal in the image.</p>
                        <div class="metrics">
                            <div class="metric">
                                <span class="metric-name">IoU Score:</span>
                                <span class="metric-value">0.92</span>
                            </div>
                            <div class="metric">
                                <span class="metric-name">Segmentation Time:</span>
                                <span class="metric-value">0.42s</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Animate the segmentation mask
            const maskPath = resultsContainer.querySelector('.mask-path');
            if (maskPath) {
                maskPath.classList.add('draw-line');
            }
            break;
            
        case 'knowledge-graph':
            resultsContainer.innerHTML = `
                <div class="analysis-result knowledge-graph-result">
                    <div class="result-graph" id="result-knowledge-graph"></div>
                    <div class="result-description">
                        <h4>Knowledge Graph Results</h4>
                        <p>The knowledge graph shows relationships between the ${species}, its behaviors, and environmental context. Nodes represent entities, while edges represent relationships between them.</p>
                        <div class="graph-legend">
                            <div class="legend-item">
                                <span class="legend-color" style="background-color: #3498db;"></span>
                                <span class="legend-label">Animal</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color" style="background-color: #e74c3c;"></span>
                                <span class="legend-label">Behavior</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color" style="background-color: #f39c12;"></span>
                                <span class="legend-label">Environment</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Initialize a small knowledge graph for the result
            setTimeout(() => {
                initResultKnowledgeGraph(species);
            }, 100);
            break;
            
        case 'description':
            resultsContainer.innerHTML = `
                <div class="analysis-result description-result">
                    <div class="result-terminal">
                        <div class="terminal-header">
                            <div class="terminal-buttons">
                                <span class="terminal-button"></span>
                                <span class="terminal-button"></span>
                                <span class="terminal-button"></span>
                            </div>
                            <div class="terminal-title">Behavior Description</div>
                        </div>
                        <div class="terminal-body">
                            <div class="terminal-line command">> Generate description for ${species}</div>
                            <div class="terminal-line response typing-text-container">
                                <span class="typing-text" data-text="Analyzing visual features..."></span>
                            </div>
                            <div class="terminal-line response typing-text-container delay-1">
                                <span class="typing-text" data-text="Integrating with knowledge graph..."></span>
                            </div>
                            <div class="terminal-line response description typing-text-container delay-2">
                                <span class="typing-text" data-text="In this image, the ${species} exhibits a characteristic walking behavior through a densely vegetated area. The posture indicates a relaxed state, with typical gait patterns for this species. The animal is likely engaged in a routine patrolling or foraging activity, consistent with its natural behavior in this environmental context."></span>
                            </div>
                            <div class="terminal-line response typing-text-container delay-3">
                                <span class="typing-text" data-text="Description confidence: 92.4%"></span>
                            </div>
                            <div class="terminal-line cursor">> _</div>
                        </div>
                    </div>
                </div>
            `;
            
            // Initialize typing animations
            const typingElements = resultsContainer.querySelectorAll('.typing-text');
            typingElements.forEach((element, index) => {
                setTimeout(() => {
                    initiateTypingAnimation(element);
                }, index * 1500);
            });
            break;
            
        default:
            resultsContainer.innerHTML = `
                <div class="results-placeholder">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Unknown analysis type selected</p>
                </div>
            `;
    }
}

/**
 * Initialize a simple knowledge graph for analysis results
 * @param {string} species - The selected species
 */
function initResultKnowledgeGraph(species) {
    const graphContainer = document.getElementById('result-knowledge-graph');
    if (!graphContainer) return;
    
    // Create a simple force-directed graph
    const width = graphContainer.clientWidth;
    const height = 300;
    
    // Create SVG element
    const svg = d3.select(graphContainer)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
        
    // Sample data for graph
    const nodes = [
        { id: "animal", name: species, group: 1 },
        { id: "behavior1", name: "Walking", group: 2 },
        { id: "behavior2", name: "Foraging", group: 2 },
        { id: "behavior3", name: "Resting", group: 2 },
        { id: "env1", name: "Forest", group: 3 },
        { id: "env2", name: "Meadow", group: 3 }
    ];
    
    const links = [
        { source: "animal", target: "behavior1", value: 1 },
        { source: "animal", target: "behavior2", value: 1 },
        { source: "animal", target: "behavior3", value: 1 },
        { source: "env1", target: "animal", value: 1 },
        { source: "env2", target: "animal", value: 1 },
        { source: "behavior1", target: "behavior2", value: 1 }
    ];
    
    // Define color scale for node groups
    const color = d3.scaleOrdinal()
        .domain([1, 2, 3])
        .range(["#3498db", "#e74c3c", "#f39c12"]);
    
    // Create a force simulation
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));
    
    // Add links
    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", d => Math.sqrt(d.value));
    
    // Add nodes
    const node = svg.append("g")
        .selectAll("g")
        .data(nodes)
        .enter()
        .append("g")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    
    // Add circles to nodes
    node.append("circle")
        .attr("r", d => d.group === 1 ? 20 : 15)
        .attr("fill", d => color(d.group))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5);
    
    // Add labels to nodes
    node.append("text")
        .attr("dx", 0)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(d => d.name)
        .attr("fill", "#fff")
        .attr("font-size", "10px");
    
    // Add title for hover effect
    node.append("title")
        .text(d => d.name);
    
    // Update positions on simulation tick
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        
        node
            .attr("transform", d => `translate(${d.x},${d.y})`);
    });
    
    // Drag functions
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
    
    // Add node glow effect
    svg.selectAll("circle")
        .filter((d, i) => i === 0) // Apply only to first node (animal)
        .classed("node-glow", true);
}

/**
 * Set up image modal interactions
 */
function setupModalInteractions() {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    const captionText = document.getElementById('modal-caption');
    const closeBtn = document.querySelector('.close-modal');
    
    // Add click handlers to case study images
    const caseImages = document.querySelectorAll('.case-image');
    
    caseImages.forEach(image => {
        image.addEventListener('click', function() {
            const img = this.querySelector('img');
            const description = this.closest('.case-study-item').querySelector('.case-description p').textContent;
            
            modal.style.display = "block";
            modalImg.src = img.src;
            captionText.innerHTML = description;
        });
    });
    
    // Close modal when clicking the close button
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = "none";
        });
    }
    
    // Close modal when clicking outside the content
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
}