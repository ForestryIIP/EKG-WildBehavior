/**
 * applications.js - Handles the applications section functionality
 * Manages species selection, image handling, and analysis display
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize applications section after a short delay
    setTimeout(() => {
        initApplicationsSection();
    }, 1000);
});

/**
 * Initialize the applications section
 */
function initApplicationsSection() {
    // Add image styles first
    addImageStyles();
    
    // Then setup functionality
    setupSpeciesSelection();
    setupAnalysisButtons();
    setupImageUpload();
}

// CSS styles for image items to ensure proper sizing and 2x2 grid layout
const imageStyles = `
    /* Images container - fixed 2x2 grid */
    #species-images {
        display: grid;
        grid-template-columns: repeat(2, 1fr);  /* Always 2 columns */
        grid-template-rows: repeat(2, 1fr);     /* Always 2 rows */
        gap: 15px;
        margin: 1.5rem 0;
        width: 100%;
        height: 320px;  /* Fixed height container */
    }
    
    /* Image item styling */
    .image-item {
        position: relative;
        width: 100%;
        height: 100%;  /* Fill the grid cell completely */
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .image-item:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 12px rgba(0,0,0,0.15);
    }
    
    /* Image sizing to match container exactly */
    .image-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;  /* Maintain aspect ratio while filling container */
        display: block;
        transition: transform 0.5s ease;
    }
    
    .image-item:hover img {
        transform: scale(1.05);
    }
    
    /* Checkbox styling */
    .image-checkbox {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 24px;
        height: 24px;
        background-color: rgba(255, 255, 255, 0.85);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: transparent;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
    }
    
    .image-item.selected .image-checkbox {
        background-color: #e74c3c;
        color: white;
    }
    
    /* Loading indicator styling */
    .loading-indicator {
        grid-column: span 2;  /* Span across both columns */
        grid-row: span 2;     /* Span across both rows */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    
    /* Ensure all media queries maintain the 2x2 grid */
    @media (max-width: 767px) {
        #species-images {
            height: 280px;  /* Slightly smaller on mobile */
        }
    }
`;

// Add image styles to the document
function addImageStyles() {
    // Check if image-styles element exists
    let styleElement = document.getElementById('image-styles');
    if (styleElement) {
        // Update existing styles
        styleElement.textContent = imageStyles;
    } else {
        // Create new style element
        styleElement = document.createElement('style');
        styleElement.id = 'image-styles';
        styleElement.textContent = imageStyles;
        document.head.appendChild(styleElement);
    }
}

// Call this function when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    addImageStyles();
    addDetectionStyles();
});

function setupImageUpload() {
    const uploadButton = document.getElementById('upload-button');
    
    if (uploadButton) {
        uploadButton.addEventListener('click', function() {
            // Check if species is selected
            const selectedSpecies = document.querySelector('.species-item.active');
            if (!selectedSpecies) {
                showNotification('Please select a species first', 'warning');
                return;
            }
            
            // Check if exactly one image is selected
            const selectedImages = document.querySelectorAll('.image-item.selected');
            if (selectedImages.length === 0) {
                showNotification('Please select an image', 'warning');
                return;
            }
            
            // Get selected image info
            const selectedImage = selectedImages[0];
            const imageId = selectedImage.getAttribute('data-image-id');
            const speciesName = selectedSpecies.getAttribute('data-species');
            const imageSrc = selectedImage.querySelector('img').src;
            
            // Simulate upload process
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
            
            // First clear the backend/image folder
            clearImageFolder()
                .then(() => {
                    // Then upload the selected image
                    return uploadImageToBackend(imageSrc, speciesName, imageId);
                })
                .then(() => {
                    this.innerHTML = '<i class="fas fa-check"></i> Upload Complete';
                    
                    // Show success modal
                    showSuccessModal(speciesName, imageId);
                    
                    // Reset button after delay
                    setTimeout(() => {
                        this.innerHTML = '<i class="fas fa-upload"></i> Upload Selected Images';
                        this.disabled = false;
                    }, 2000);
                })
                .catch(error => {
                    // Handle any errors
                    this.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Upload Failed';
                    showNotification(`Upload failed: ${error.message}`, 'error');
                    
                    // Reset button after delay
                    setTimeout(() => {
                        this.innerHTML = '<i class="fas fa-upload"></i> Upload Selected Images';
                        this.disabled = false;
                    }, 2000);
                });
        });
    }
}

/**
 * Clear the backend/image folder
 * @returns {Promise} Promise that resolves when folder is cleared
 */
function clearImageFolder() {
    return new Promise((resolve, reject) => {
        // Create a request to clear the folder
        const request = new XMLHttpRequest();
        request.open('POST', '/api/clear-images', true);
        request.setRequestHeader('Content-Type', 'application/json');
        
        request.onload = function() {
            if (this.status >= 200 && this.status < 400) {
                // Success
                resolve();
            } else {
                // Server error
                reject(new Error('Server returned error when clearing folder'));
            }
        };
        
        request.onerror = function() {
            // Connection error
            reject(new Error('Connection error when clearing folder'));
        };
        
        // Send the request
        request.send(JSON.stringify({ folder: '../backend/image' }));
        
        // For demonstration, resolve immediately 
        // In real implementation, remove this line and use the actual request
        resolve();
    });
}

/**
 * Upload image to backend/image folder
 * @param {string} imageSrc - Source of the image
 * @param {string} species - Species name
 * @param {string} imageId - Image ID
 * @returns {Promise} Promise that resolves when image is uploaded
 */
function uploadImageToBackend(imageSrc, species, imageId) {
    return new Promise((resolve, reject) => {
        // For client-side image, we need to first fetch it as blob
        fetch(imageSrc)
            .then(response => response.blob())
            .then(blob => {
                // Create FormData and append the image
                const formData = new FormData();
                formData.append('image', blob, `${species.toLowerCase()}${imageId}.jpg`);
                formData.append('folder', '../backend/image');
                
                // Create upload request
                const request = new XMLHttpRequest();
                request.open('POST', '/api/upload-image', true);
                
                request.onload = function() {
                    if (this.status >= 200 && this.status < 400) {
                        // Success
                        resolve();
                    } else {
                        // Server error
                        reject(new Error('Server returned error when uploading image'));
                    }
                };
                
                request.onerror = function() {
                    // Connection error
                    reject(new Error('Connection error when uploading image'));
                };
                
                // Send the request
                request.send(formData);
                
                // For demonstration, resolve immediately
                // In real implementation, remove this line and use the actual request
                resolve();
            })
            .catch(error => {
                reject(new Error(`Failed to process image: ${error.message}`));
            });
    });
}

/**
 * Show success modal for upload completion
 * @param {string} species - Selected species
 * @param {string} imageId - Selected image ID
 */
function showSuccessModal(species, imageId) {
    // Create modal backdrop
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop';
    document.body.appendChild(modalBackdrop);
    
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    
    // Set modal content
    modal.innerHTML = `
        <div class="success-modal-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>Upload Successful!</h3>
            <p>Your ${species} image (ID: ${imageId}) has been successfully uploaded for analysis.</p>
            <div class="modal-details">
                <div class="detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">Processing</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Estimated time:</span>
                    <span class="detail-value">1-2 minutes</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Queue position:</span>
                    <span class="detail-value">#1</span>
                </div>
            </div>
            <button class="close-modal-btn">Close</button>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Add modal CSS for smooth animation
    modal.style.opacity = 0;
    modal.style.transform = 'translateY(-20px)';
    
    // Trigger animation
    setTimeout(() => {
        modal.style.opacity = 1;
        modal.style.transform = 'translateY(0)';
    }, 10);
    
    // Add close button functionality
    const closeButton = modal.querySelector('.close-modal-btn');
    closeButton.addEventListener('click', function() {
        // Fade out animations
        modal.style.opacity = 0;
        modal.style.transform = 'translateY(-20px)';
        modalBackdrop.style.opacity = 0;
        
        // Remove elements after animation
        setTimeout(() => {
            document.body.removeChild(modal);
            document.body.removeChild(modalBackdrop);
        }, 300);
    });
    
    // Also close on backdrop click
    modalBackdrop.addEventListener('click', function() {
        closeButton.click();
    });
}

/**
 * Set up species selection functionality
 */
function setupSpeciesSelection() {
    const speciesItems = document.querySelectorAll('.species-item');
    const imagesContainer = document.getElementById('species-images');
    const uploadButton = document.getElementById('upload-button');
    
    if (!speciesItems.length || !imagesContainer || !uploadButton) return;
    
    // Handle species selection
    speciesItems.forEach(item => {
        item.addEventListener('click', function() {
            // Deselect all species
            speciesItems.forEach(species => {
                species.classList.remove('active');
            });
            
            // Select clicked species
            this.classList.add('active');
            
            // Get species name
            const species = this.getAttribute('data-species');
            
            // Load images for the selected species
            loadSpeciesImages(species);
            
            // Enable upload button
            uploadButton.disabled = false;
        });
    });
}

/**
 * Load images for the selected species
 * @param {string} species - Selected species name
 */
function loadSpeciesImages(species) {
    const imagesContainer = document.getElementById('species-images');
    if (!imagesContainer) return;
    
    // Remove no-selection message if present
    const noSelectionMsg = imagesContainer.querySelector('.no-selection-message');
    if (noSelectionMsg) {
        noSelectionMsg.remove();
    }
    
    // Show loading animation
    imagesContainer.innerHTML = `
        <div class="loading-indicator">
            <div class="loader"></div>
            <p>Loading images for ${species}...</p>
        </div>
    `;
    
    // Simulate loading delay
    setTimeout(() => {
        // Clear container
        imagesContainer.innerHTML = '';
        
        // Generate sample images for the species
        const numImages = 4;
        
        for (let i = 1; i <= numImages; i++) {
            // Create image container
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';
            
            // Add image and checkbox
            imageItem.innerHTML = `
            <img src="./data/${species.toLowerCase()}${i}.jpg" alt="${species} ${i}">
            <div class="image-checkbox">
                <i class="fas fa-check"></i>
            </div>
            `;
            
            // Add click handler to toggle selection
            imageItem.addEventListener('click', function() {
                this.classList.toggle('selected');
                updateUploadButtonState();
            });
            
            // Add the image to the container
            imagesContainer.appendChild(imageItem);
        }
    }, 1500);
}

/**
 * Update upload button state based on image selection
 */
function updateUploadButtonState() {
    const selectedImages = document.querySelectorAll('.image-item.selected');
    const uploadButton = document.getElementById('upload-button');
    
    if (uploadButton) {
        // Enable button if at least one image is selected
        uploadButton.disabled = selectedImages.length === 0;
    }
}

/**
 * Set up analysis buttons functionality
 */
function setupAnalysisButtons() {
    const analysisButtons = document.querySelectorAll('.analysis-button');
    const resultsContainer = document.getElementById('results-container');
    
    if (!analysisButtons.length || !resultsContainer) return;
    
    // Handle analysis button clicks
    analysisButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Check if species is selected
            const selectedSpecies = document.querySelector('.species-item.active');
            if (!selectedSpecies) {
                showNotification('Please select a species first', 'warning');
                return;
            }
            
            // Check if at least one image is selected
            const selectedImages = document.querySelectorAll('.image-item.selected');
            if (selectedImages.length === 0) {
                showNotification('Please select at least one image', 'warning');
                return;
            }
            
            // Get analysis type
            const analysisType = this.getAttribute('data-analysis');
            
            // Highlight active button
            analysisButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show loading state
            resultsContainer.innerHTML = `
                <div class="loading-indicator">
                    <div class="loader"></div>
                    <p>Running ${formatAnalysisType(analysisType)} analysis...</p>
                </div>
            `;
            
            // Simulate analysis process
            setTimeout(() => {
                showAnalysisResults(analysisType, selectedSpecies.getAttribute('data-species'));
            }, 2000);
        });
    });
}

/**
 * Format analysis type for display
 * @param {string} type - Analysis type identifier
 * @returns {string} Formatted analysis type
 */
function formatAnalysisType(type) {
    return type.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

/**
 * Show analysis results based on type and species
 * @param {string} analysisType - Type of analysis
 * @param {string} species - Selected species
 */
function showAnalysisResults(analysisType, species) {
    const resultsContainer = document.getElementById('results-container');
    if (!resultsContainer) return;
    
    // Remove results-placeholder if present
    const placeholder = resultsContainer.querySelector('.results-placeholder');
    if (placeholder) {
        placeholder.remove();
    }
    
    switch (analysisType) {
        case 'detection':
            showDetectionResults(resultsContainer, species);
            break;
            
        case 'segmentation':
            showSegmentationResults(resultsContainer, species);
            break;
            
        case 'knowledge-graph':
            showKnowledgeGraphResults(resultsContainer, species);
            break;
            
        case 'description':
            showDescriptionResults(resultsContainer, species);
            break;
            
        default:
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Unknown analysis type: ${analysisType}</p>
                </div>
            `;
    }
}

/**
 * Show object detection results
 * @param {HTMLElement} container - Results container
 * @param {string} species - Selected species
 */
function showDetectionResults(container, species) {
    container.innerHTML = `
        <div class="analysis-result">
            <h4>Object Detection Results</h4>
            
            <div class="result-content">
                <div class="result-visualization">
                    <div class="detection-image">
                        <img src="/api/placeholder/200/150" alt="${species} detection">
                        <div class="detection-box" style="top: 20%; left: 15%; width: 70%; height: 60%;">
                            <div class="detection-label">${species} (95.8%)</div>
                        </div>
                        <div class="detection-box detection-box-secondary" style="top: 60%; left: 65%; width: 25%; height: 30%;">
                            <div class="detection-label">Tree (87.3%)</div>
                        </div>
                    </div>
                    <div class="detection-controls">
                        <div class="control-buttons">
                            <button class="control-button" data-action="zoom-in">
                                <i class="fas fa-search-plus"></i>
                            </button>
                            <button class="control-button" data-action="zoom-out">
                                <i class="fas fa-search-minus"></i>
                            </button>
                            <button class="control-button" data-action="toggle-boxes">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="control-button" data-action="download">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                        <div class="confidence-slider">
                            <label for="confidence-threshold">Confidence Threshold:</label>
                            <input type="range" id="confidence-threshold" min="0" max="100" value="70" class="slider">
                            <span class="slider-value">70%</span>
                        </div>
                    </div>
                </div>
                
                <div class="result-details">
                    <div class="result-summary">
                        <p>The YOLO-based detection model successfully identified a <strong>${species}</strong> in the image with high confidence. The bounding box indicates the precise location of the animal within the frame.</p>
                    </div>
                    
                    <div class="detection-classes">
                        <h5>Detected Classes</h5>
                        <div class="class-item">
                            <div class="class-color" style="background-color: #e74c3c;"></div>
                            <div class="class-name">${species}</div>
                            <div class="class-confidence">95.8%</div>
                            <div class="class-bar">
                                <div class="class-bar-fill" style="width: 95.8%;"></div>
                            </div>
                        </div>
                        <div class="class-item">
                            <div class="class-color" style="background-color: #27ae60;"></div>
                            <div class="class-name">Tree</div>
                            <div class="class-confidence">87.3%</div>
                            <div class="class-bar">
                                <div class="class-bar-fill" style="width: 87.3%;"></div>
                            </div>
                        </div>
                        <div class="class-item">
                            <div class="class-color" style="background-color: #3498db;"></div>
                            <div class="class-name">Grass</div>
                            <div class="class-confidence">82.1%</div>
                            <div class="class-bar">
                                <div class="class-bar-fill" style="width: 82.1%;"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="result-metrics">
                        <div class="metric-group">
                            <h5>Detection Performance</h5>
                            <div class="metric">
                                <div class="metric-label">Confidence Score:</div>
                                <div class="metric-value">95.8%</div>
                            </div>
                            <div class="metric">
                                <div class="metric-label">IoU Score:</div>
                                <div class="metric-value">0.89</div>
                            </div>
                            <div class="metric">
                                <div class="metric-label">Processing Time:</div>
                                <div class="metric-value">0.18s</div>
                            </div>
                        </div>
                        
                        <div class="metric-group">
                            <h5>Model Information</h5>
                            <div class="metric">
                                <div class="metric-label">Model:</div>
                                <div class="metric-value">YOLO v5</div>
                            </div>
                            <div class="metric">
                                <div class="metric-label">Resolution:</div>
                                <div class="metric-value">640x640</div>
                            </div>
                            <div class="metric">
                                <div class="metric-label">Optimization:</div>
                                <div class="metric-value">TensorRT</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detection-history">
                        <h5>Detection History</h5>
                        <div class="history-timeline">
                            <div class="timeline-item">
                                <div class="timeline-marker active"></div>
                                <div class="timeline-content">
                                    <div class="timeline-time">Now</div>
                                    <div class="timeline-detail">
                                        <strong>${species}</strong> detected (95.8%)
                                    </div>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-marker"></div>
                                <div class="timeline-content">
                                    <div class="timeline-time">10:23 AM</div>
                                    <div class="timeline-detail">
                                        <strong>${species}</strong> detected (92.3%)
                                    </div>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-marker"></div>
                                <div class="timeline-content">
                                    <div class="timeline-time">09:15 AM</div>
                                    <div class="timeline-detail">
                                        <strong>Detection initialized</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add animation to detection boxes
    setTimeout(() => {
        const detectionBoxes = container.querySelectorAll('.detection-box');
        detectionBoxes.forEach(box => {
            box.classList.add('active');
        });
    }, 300);
    
    // Add functionality to control buttons
    const controlButtons = container.querySelectorAll('.control-button');
    controlButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handleDetectionControl(action, container);
        });
    });
    
    // Add functionality to confidence slider
    const confidenceSlider = container.querySelector('#confidence-threshold');
    const sliderValue = container.querySelector('.slider-value');
    
    if (confidenceSlider && sliderValue) {
        confidenceSlider.addEventListener('input', function() {
            const value = this.value;
            sliderValue.textContent = `${value}%`;
            
            // Apply threshold effect - hide detections below threshold
            const detectionBoxes = container.querySelectorAll('.detection-box');
            detectionBoxes.forEach(box => {
                const labelElement = box.querySelector('.detection-label');
                if (labelElement) {
                    const confidenceText = labelElement.textContent;
                    const confidenceMatch = confidenceText.match(/\((\d+\.\d+)%\)/);
                    
                    if (confidenceMatch) {
                        const confidence = parseFloat(confidenceMatch[1]);
                        
                        if (confidence < value) {
                            box.style.opacity = '0.2';
                            box.style.borderStyle = 'dashed';
                        } else {
                            box.style.opacity = '1';
                            box.style.borderStyle = 'solid';
                        }
                    }
                }
            });
            
            // Apply threshold to class items
            const classItems = container.querySelectorAll('.class-item');
            classItems.forEach(item => {
                const confidenceElement = item.querySelector('.class-confidence');
                if (confidenceElement) {
                    const confidence = parseFloat(confidenceElement.textContent);
                    
                    if (confidence < value) {
                        item.style.opacity = '0.4';
                    } else {
                        item.style.opacity = '1';
                    }
                }
            });
        });
    }
    
    // Add animation to bars
    const classBarFills = container.querySelectorAll('.class-bar-fill');
    classBarFills.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        
        setTimeout(() => {
            bar.style.transition = 'width 1s ease';
            bar.style.width = width;
        }, 500);
    });
    
    // Add interactivity to timeline
    const timelineItems = container.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            timelineItems.forEach(i => {
                i.querySelector('.timeline-marker').classList.remove('active');
            });
            
            // Add active class to clicked item
            this.querySelector('.timeline-marker').classList.add('active');
            
            // Show notification about timeline item
            const timeText = this.querySelector('.timeline-time').textContent;
            const detailText = this.querySelector('.timeline-detail').textContent.trim();
            
            showNotification(`Selected detection from ${timeText}: ${detailText}`, 'info');
        });
    });
}

/**
 * Handle detection control actions
 * @param {string} action - Action to perform
 * @param {HTMLElement} container - Results container
 */
function handleDetectionControl(action, container) {
    const detectionImage = container.querySelector('.detection-image');
    
    switch (action) {
        case 'zoom-in':
            detectionImage.classList.add('zoomed');
            showNotification('Zoomed in on detection image', 'info');
            break;
            
        case 'zoom-out':
            detectionImage.classList.remove('zoomed');
            showNotification('Zoomed out to normal view', 'info');
            break;
            
        case 'toggle-boxes':
            const boxes = container.querySelectorAll('.detection-box');
            const areVisible = boxes[0].style.display !== 'none';
            
            boxes.forEach(box => {
                box.style.display = areVisible ? 'none' : 'block';
            });
            
            showNotification(
                areVisible ? 'Detection boxes hidden' : 'Detection boxes shown', 
                'info'
            );
            break;
            
        case 'download':
            simulateDownload('detection_results.jpg');
            break;
    }
}

/**
 * Simulate file download
 * @param {string} filename - Name of file to download
 */
function simulateDownload(filename) {
    showNotification(`Downloading ${filename}...`, 'info');
    
    // Simulate download delay
    setTimeout(() => {
        showNotification(`${filename} downloaded successfully`, 'success');
    }, 1500);
}

// CSS styles to add for the detection functionality
const detectionStyles = `
    /* Detection Box Animation */
    @keyframes boxHighlight {
        0% { box-shadow: 0 0 0 rgba(231, 76, 60, 0.5); }
        50% { box-shadow: 0 0 15px rgba(231, 76, 60, 0.8); }
        100% { box-shadow: 0 0 0 rgba(231, 76, 60, 0.5); }
    }
    
    .detection-box {
        position: absolute;
        border: 3px solid;
        border-radius: 5px;
        opacity: 0;
        transition: all 0.5s ease;
    }
    
    .detection-box.active {
        opacity: 1;
        animation: boxHighlight 2.5s ease infinite;
    }
    
    .detection-box-secondary {
        border-color: #27ae60;
    }
    
    .detection-box-secondary.active {
        animation: none;
        box-shadow: 0 0 8px rgba(39, 174, 96, 0.6);
    }
    
    .detection-label {
        position: absolute;
        top: -30px;
        left: 0;
        background-color: #e74c3c;
        color: white;
        font-size: 12px;
        font-weight: bold;
        padding: 5px 10px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .detection-box-secondary .detection-label {
        background-color: #27ae60;
    }
    
    /* Detection Controls */
    .detection-controls {
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .control-buttons {
        display: flex;
        gap: 0.5rem;
    }
    
    .control-button {
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .control-button:hover {
        background-color: #3498db;
        color: white;
        border-color: #3498db;
    }
    
    /* Confidence slider */
    .confidence-slider {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background-color: #f9f9f9;
        border-radius: 4px;
        border: 1px solid #ddd;
    }
    
    .confidence-slider label {
        font-size: 0.8rem;
        color: #7f8c8d;
    }
    
    .slider {
        flex: 1;
        -webkit-appearance: none;
        appearance: none;
        height: 5px;
        background: #ddd;
        border-radius: 5px;
        outline: none;
    }
    
    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 15px;
        height: 15px;
        background: #3498db;
        border-radius: 50%;
        cursor: pointer;
    }
    
    .slider-value {
        font-size: 0.8rem;
        font-weight: bold;
        color: #3498db;
        width: 40px;
        text-align: right;
    }
    
    /* Detected Classes */
    .detection-classes {
        margin-top: 1.5rem;
    }
    
    .detection-classes h5 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: #2c3e50;
        font-size: 1rem;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.5rem;
    }
    
    .class-item {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
        background-color: white;
        padding: 0.5rem;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    }
    
    .class-color {
        width: 12px;
        height: 12px;
        border-radius: 3px;
        margin-right: 0.5rem;
    }
    
    .class-name {
        flex: 1;
        font-size: 0.9rem;
    }
    
    .class-confidence {
        font-weight: bold;
        font-size: 0.9rem;
        color: #2c3e50;
        margin-right: 0.5rem;
    }
    
    .class-bar {
        width: 100px;
        height: 6px;
        background-color: #ecf0f1;
        border-radius: 3px;
        overflow: hidden;
    }
    
    .class-bar-fill {
        height: 100%;
        background-color: #3498db;
        border-radius: 3px;
        width: 0; /* Initially 0, will be animated */
    }
    
    /* Detection History Timeline */
    .detection-history {
        margin-top: 1.5rem;
    }
    
    .detection-history h5 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: #2c3e50;
        font-size: 1rem;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.5rem;
    }
    
    .history-timeline {
        position: relative;
        padding-left: 20px;
    }
    
    .history-timeline::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 9px;
        width: 2px;
        background-color: #ddd;
    }
    
    .timeline-item {
        position: relative;
        margin-bottom: 1rem;
        cursor: pointer;
    }
    
    .timeline-marker {
        position: absolute;
        left: -20px;
        top: 0;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background-color: white;
        border: 2px solid #ddd;
        transition: all 0.3s ease;
    }
    
    .timeline-marker.active {
        background-color: #3498db;
        border-color: #3498db;
        box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.25);
    }
    
    .timeline-content {
        padding-left: 0.5rem;
    }
    
    .timeline-time {
        font-size: 0.8rem;
        color: #7f8c8d;
        margin-bottom: 0.2rem;
    }
    
    .timeline-detail {
        font-size: 0.9rem;
        color: #2c3e50;
    }
    
    /* Zoom functionality */
    .detection-image {
        transition: transform 0.5s ease;
    }
    
    .detection-image.zoomed {
        transform: scale(1.5);
        transform-origin: center center;
    }
`;

// Add these styles to the application styles section
function addDetectionStyles() {
    // Check if application-styles element exists
    let styleElement = document.getElementById('application-styles');
    if (styleElement) {
        // Append detection styles to existing styles
        styleElement.textContent += detectionStyles;
    } else {
        // Create new style element
        styleElement = document.createElement('style');
        styleElement.id = 'application-styles';
        styleElement.textContent = detectionStyles;
        document.head.appendChild(styleElement);
    }
}

// Call this function when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    addDetectionStyles();
});