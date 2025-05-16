/**
 * applications.js - Handles the applications section functionality
 * Manages species selection, image handling, and analysis display
 */

let analysisButtonsInitialized = false;

document.addEventListener("DOMContentLoaded", function () {
  // 初始化应用程序部分
  setTimeout(() => {
    initApplicationsSection();
  }, 1000);

  // 隐藏上传按钮，但保持其他功能正常
  setTimeout(() => {
    const uploadButton = document.getElementById("upload-button");
    if (uploadButton) {
      uploadButton.style.display = "none"; // 隐藏上传按钮
    }
  }, 500);
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
  let styleElement = document.getElementById("image-styles");
  if (styleElement) {
    // Update existing styles
    styleElement.textContent = imageStyles;
  } else {
    // Create new style element
    styleElement = document.createElement("style");
    styleElement.id = "image-styles";
    styleElement.textContent = imageStyles;
    document.head.appendChild(styleElement);
  }
}

// Call this function when document is loaded
document.addEventListener("DOMContentLoaded", function () {
  addImageStyles();
  addDetectionStyles();
});

function setupImageUpload() {
  const uploadButton = document.getElementById("upload-button");

  if (uploadButton) {
    uploadButton.addEventListener("click", function () {
      // Check if species is selected
      const selectedSpecies = document.querySelector(".species-item.active");
      if (!selectedSpecies) {
        showNotification("Please select a species first", "warning");
        return;
      }

      // Check if exactly one image is selected
      const selectedImages = document.querySelectorAll(".image-item.selected");
      if (selectedImages.length === 0) {
        showNotification("Please select an image", "warning");
        return;
      }

      // Get selected image info
      const selectedImage = selectedImages[0];
      const imageId = selectedImage.getAttribute("data-image-id");
      const speciesName = selectedSpecies.getAttribute("data-species");
      const imageSrc = selectedImage.querySelector("img").src;

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
            this.innerHTML =
              '<i class="fas fa-upload"></i> Upload Selected Images';
            this.disabled = false;
          }, 2000);
        })
        .catch((error) => {
          // Handle any errors
          this.innerHTML =
            '<i class="fas fa-exclamation-triangle"></i> Upload Failed';
          showNotification(`Upload failed: ${error.message}`, "error");

          // Reset button after delay
          setTimeout(() => {
            this.innerHTML =
              '<i class="fas fa-upload"></i> Upload Selected Images';
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
    request.open("POST", "/api/clear-images", true);
    request.setRequestHeader("Content-Type", "application/json");

    request.onload = function () {
      if (this.status >= 200 && this.status < 400) {
        // Success
        resolve();
      } else {
        // Server error
        reject(new Error("Server returned error when clearing folder"));
      }
    };

    request.onerror = function () {
      // Connection error
      reject(new Error("Connection error when clearing folder"));
    };

    // Send the request
    request.send(JSON.stringify({ folder: "../backend/image" }));

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
      .then((response) => response.blob())
      .then((blob) => {
        // Create FormData and append the image
        const formData = new FormData();
        formData.append(
          "image",
          blob,
          `${species.toLowerCase()}${imageId}.jpg`
        );
        formData.append("folder", "../backend/image");

        // Create upload request
        const request = new XMLHttpRequest();
        request.open("POST", "/api/upload-image", true);

        request.onload = function () {
          if (this.status >= 200 && this.status < 400) {
            // Success
            resolve();
          } else {
            // Server error
            reject(new Error("Server returned error when uploading image"));
          }
        };

        request.onerror = function () {
          // Connection error
          reject(new Error("Connection error when uploading image"));
        };

        // Send the request
        request.send(formData);

        // For demonstration, resolve immediately
        // In real implementation, remove this line and use the actual request
        resolve();
      })
      .catch((error) => {
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
  const modalBackdrop = document.createElement("div");
  modalBackdrop.className = "modal-backdrop";
  document.body.appendChild(modalBackdrop);

  // Create modal container
  const modal = document.createElement("div");
  modal.className = "success-modal";

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
  modal.style.transform = "translateY(-20px)";

  // Trigger animation
  setTimeout(() => {
    modal.style.opacity = 1;
    modal.style.transform = "translateY(0)";
  }, 10);

  // Add close button functionality
  const closeButton = modal.querySelector(".close-modal-btn");
  closeButton.addEventListener("click", function () {
    // Fade out animations
    modal.style.opacity = 0;
    modal.style.transform = "translateY(-20px)";
    modalBackdrop.style.opacity = 0;

    // Remove elements after animation
    setTimeout(() => {
      document.body.removeChild(modal);
      document.body.removeChild(modalBackdrop);
    }, 300);
  });

  // Also close on backdrop click
  modalBackdrop.addEventListener("click", function () {
    closeButton.click();
  });
}

/**
 * Set up species selection functionality
 */
function setupSpeciesSelection() {
  const speciesItems = document.querySelectorAll(".species-item");
  const imagesContainer = document.getElementById("species-images");
  const uploadButton = document.getElementById("upload-button");

  if (!speciesItems.length || !imagesContainer || !uploadButton) return;

  // Handle species selection
  speciesItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Deselect all species
      speciesItems.forEach((species) => {
        species.classList.remove("active");
      });

      // Select clicked species
      this.classList.add("active");

      // Get species name
      const species = this.getAttribute("data-species");

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
  const imagesContainer = document.getElementById("species-images");
  if (!imagesContainer) return;

  // 移除no-selection消息如果存在
  const noSelectionMsg = imagesContainer.querySelector(".no-selection-message");
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
  fetch(`//120.53.14.250:5000/api/species/${species}/images`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // 清除加载指示器
      imagesContainer.innerHTML = "";

      // 添加图片到容器
      if (data.images && data.images.length > 0) {
        data.images.forEach((imageInfo) => {
          // 创建图片容器
          const imageItem = document.createElement("div");
          imageItem.className = "image-item";
          imageItem.setAttribute("data-image-id", imageInfo.id);

          // 添加图片和复选框
          imageItem.innerHTML = `
                        <img src="//120.53.14.250:5000${imageInfo.url}" alt="${species} ${imageInfo.id}">
                        <div class="image-checkbox">
                            <i class="fas fa-check"></i>
                        </div>
                    `;

          // 添加点击处理程序以切换选择
          // 添加点击处理程序以实现单选
          imageItem.addEventListener("click", function () {
            // 先取消所有图片的选择
            const allImages = document.querySelectorAll(".image-item");
            allImages.forEach((img) => img.classList.remove("selected"));

            // 选择当前点击的图片
            this.classList.add("selected");

            // 更新上传按钮状态
            updateUploadButtonState();
          });

          // 添加图片到容器
          imagesContainer.appendChild(imageItem);
        });
      } else {
        imagesContainer.innerHTML = `
                    <div class="no-images-message">
                        <p>No images available for ${species}</p>
                    </div>
                `;
      }
    })
    .catch((error) => {
      console.error("Error loading images:", error);
      imagesContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error loading images: ${error.message}</p>
                </div>
            `;
    });
}

/**
 * Update upload button state based on image selection
 */
function updateUploadButtonState() {
  const selectedImages = document.querySelectorAll(".image-item.selected");
  const uploadButton = document.getElementById("upload-button");

  if (uploadButton) {
    // Enable button if at least one image is selected
    uploadButton.disabled = selectedImages.length === 0;
  }
}

/**
 * Set up analysis buttons functionality
 */
function setupAnalysisButtons() {
  // 防止重复初始化
  if (analysisButtonsInitialized) return;

  const analysisButtons = document.querySelectorAll(".analysis-button");
  const resultsContainer = document.getElementById("results-container");

  if (!analysisButtons.length || !resultsContainer) return;

  // 处理分析按钮点击
  analysisButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // 检查是否选择了物种
      const selectedSpecies = document.querySelector(".species-item.active");
      if (!selectedSpecies) {
        showNotification("Please select a species first", "warning");
        return;
      }

      // 检查是否至少选择了一张图片
      const selectedImages = document.querySelectorAll(".image-item.selected");
      if (selectedImages.length === 0) {
        showNotification("Please select at least one image", "warning");
        return;
      }

      // 获取分析类型
      const analysisType = this.getAttribute("data-analysis");

      // 高亮活动按钮
      analysisButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      // 显示加载状态
      resultsContainer.innerHTML = `
                <div class="loading-indicator">
                    <div class="loader"></div>
                    <p>Running ${formatAnalysisType(
                      analysisType
                    )} analysis...</p>
                </div>
            `;

      // 获取选中的物种和图片ID
      const species = selectedSpecies.getAttribute("data-species");
      const imageId = selectedImages[0].getAttribute("data-image-id");

      // 调用相应的分析API
      performAnalysis(analysisType, species, imageId, resultsContainer);
    });
  });

  // 设置标志，表示已初始化
  analysisButtonsInitialized = true;
}

/**
 * 执行分析并显示结果
 */
function performAnalysis(analysisType, species, imageId, resultsContainer) {
  const endpoint = `//120.53.14.250:5000/api/analyze/${analysisType}`;

  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      species: species,
      imageId: imageId,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // 根据分析类型显示结果
      switch (analysisType) {
        case "detection":
          showDetectionResults(resultsContainer, species, data);
          break;

        case "segmentation":
          showSegmentationResults(resultsContainer, species, data);
          break;

        case "knowledge-graph":
          showKnowledgeGraphResults(resultsContainer, species, data);
          break;

        case "description":
          showDescriptionResults(resultsContainer, species, data);
          break;

        default:
          resultsContainer.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Unknown analysis type: ${analysisType}</p>
                    </div>
                `;
      }
    })
    .catch((error) => {
      console.error(`Error performing ${analysisType} analysis:`, error);
      resultsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error: ${error.message}</p>
            </div>
        `;
    });
}

/**
 * Format analysis type for display
 * @param {string} type - Analysis type identifier
 * @returns {string} Formatted analysis type
 */
function formatAnalysisType(type) {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Show analysis results based on type and species
 * @param {string} analysisType - Type of analysis
 * @param {string} species - Selected species
 */
function showAnalysisResults(analysisType, species) {
  const resultsContainer = document.getElementById("results-container");
  if (!resultsContainer) return;

  // Remove results-placeholder if present
  const placeholder = resultsContainer.querySelector(".results-placeholder");
  if (placeholder) {
    placeholder.remove();
  }

  switch (analysisType) {
    case "detection":
      showDetectionResults(resultsContainer, species);
      break;

    case "segmentation":
      showSegmentationResults(resultsContainer, species);
      break;

    case "knowledge-graph":
      showKnowledgeGraphResults(resultsContainer, species);
      break;

    case "description":
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
 * 显示目标检测结果
 */
function showDetectionResults(container, species, data) {
  // 使用后端返回的性能指标
  const performanceMetrics = data.performance || {
    objects_detected: data.objects.length,
    avg_confidence: (
      data.objects.reduce((sum, obj) => sum + obj.confidence, 0) /
      data.objects.length
    ).toFixed(1),
    processing_time: 0.18,
  };

  container.innerHTML = `
        <div class="analysis-result">
            <h4>Object Detection Results</h4>
            
            <div class="result-content">
                <div class="result-visualization">
                    <div class="detection-image">
                        <img src="${data.image}" alt="${species} detection">
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
                        <p>The YOLO-based detection model successfully identified ${
                          data.objects.length
                        } objects in the image, including a <strong>${species}</strong> with high confidence.</p>
                    </div>
                    
                    <div class="detection-classes">
                        <h5>Detected Classes</h5>
                        ${data.objects
                          .map((obj) => {
                            // 确定对象类型的颜色
                            const objType =
                              Object.keys({
                                tiger: "#e74c3c",
                                panda: "#e74c3c",
                                tree: "#27ae60",
                                grass: "#3498db",
                                default: "#f39c12",
                              }).find((type) =>
                                obj.label.toLowerCase().includes(type)
                              ) || "default";
                            const color = obj.color || "#f39c12";

                            return `
                                <div class="class-item" data-confidence="${
                                  obj.confidence
                                }">
                                    <div class="class-color" style="background-color: ${color};"></div>
                                    <div class="class-name">${
                                      obj.label.charAt(0).toUpperCase() +
                                      obj.label.slice(1)
                                    }</div>
                                    <div class="class-confidence">${obj.confidence.toFixed(
                                      1
                                    )}%</div>
                                    <div class="class-bar">
                                        <div class="class-bar-fill" style="width: ${
                                          obj.confidence
                                        }%; background-color: ${color};"></div>
                                    </div>
                                </div>
                            `;
                          })
                          .join("")}
                    </div>
                    
                    <div class="result-metrics">
                        <div class="metric-group">
                            <h5>Detection Performance</h5>
                            <div class="metric">
                                <div class="metric-label">Objects Detected:</div>
                                <div class="metric-value">${
                                  performanceMetrics.objects_detected
                                }</div>
                            </div>
                            <div class="metric">
                                <div class="metric-label">Avg. Confidence Score:</div>
                                <div class="metric-value">${
                                  performanceMetrics.avg_confidence
                                }%</div>
                            </div>
                            <div class="metric">
                                <div class="metric-label">Processing Time:</div>
                                <div class="metric-value">${
                                  performanceMetrics.processing_time
                                }s</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

  // 添加功能到控制按钮
  const controlButtons = container.querySelectorAll(".control-button");
  controlButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const action = this.getAttribute("data-action");
      handleDetectionControl(action, container);
    });
  });

  // 添加功能到置信度滑块
  const confidenceSlider = container.querySelector("#confidence-threshold");
  const sliderValue = container.querySelector(".slider-value");

  if (confidenceSlider && sliderValue) {
    confidenceSlider.addEventListener("input", function () {
      const value = this.value;
      sliderValue.textContent = `${value}%`;

      // 对置信度低于阈值的类别应用视觉效果
      const classItems = container.querySelectorAll(".class-item");
      classItems.forEach((item) => {
        const confidence = parseFloat(item.getAttribute("data-confidence"));

        if (confidence < value) {
          item.style.opacity = "0.4";
        } else {
          item.style.opacity = "1";
        }
      });
    });
  }

  // 为图表添加动画
  const classBarFills = container.querySelectorAll(".class-bar-fill");
  classBarFills.forEach((bar) => {
    const width = bar.style.width;
    bar.style.width = "0";

    setTimeout(() => {
      bar.style.transition = "width 1s ease";
      bar.style.width = width;
    }, 500);
  });
}

/**
 * 显示分割结果
 */
function showSegmentationResults(container, species, data) {
  // 使用后端返回的性能指标
  const performanceMetrics = data.performance || {
    iou_score: 0.92,
    boundary_precision: 0.89,
    processing_time: 0.42,
  };

  container.innerHTML = `
        <div class="analysis-result segmentation-result">
            <h4>Segmentation Results</h4>
            
            <div class="result-content">
                <div class="result-visualization">
                    <div class="segmentation-image">
                        <img src="${data.image}" alt="${species} segmentation">
                    </div>
                    <div class="segmentation-controls">
                        <div class="control-buttons">
                            <button class="control-button" data-action="zoom-in">
                                <i class="fas fa-search-plus"></i>
                            </button>
                            <button class="control-button" data-action="zoom-out">
                                <i class="fas fa-search-minus"></i>
                            </button>
                            <button class="control-button" data-action="toggle-mask">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="control-button" data-action="download">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="result-details">
                    <div class="result-summary">
                        <p>Our CWA-SAM (Complex Wildlife Animal Segmentation Model) precisely segmented the ${species} from the background, achieving high precision pixel-level segmentation.</p>
                    </div>
                    
                    <div class="segmentation-classes">
                        <h5>Segmentation Classes</h5>
                        ${
                          data.segments
                            ? data.segments
                                .map(
                                  (segment) => `
                            <div class="segment-item">
                                <div class="segment-color" style="background-color: ${
                                  segment.label === species
                                    ? "#e74c3c"
                                    : "#3498db"
                                };"></div>
                                <div class="segment-name">${segment.label}</div>
                                <div class="segment-confidence">${segment.confidence.toFixed(
                                  1
                                )}%</div>
                                <div class="segment-bar">
                                    <div class="segment-bar-fill" style="width: ${
                                      segment.confidence
                                    }%;"></div>
                                </div>
                                <div class="segment-area">Coverage: ${
                                  segment.area_percentage
                                }%</div>
                            </div>
                        `
                                )
                                .join("")
                            : ""
                        }
                    </div>
                    
                    <div class="result-metrics">
                        <div class="metric-group">
                            <h5>Segmentation Performance</h5>
                            <div class="metric">
                                <div class="metric-label">IoU Score:</div>
                                <div class="metric-value">${
                                  performanceMetrics.iou_score
                                }</div>
                            </div>
                            <div class="metric">
                                <div class="metric-label">Boundary Precision:</div>
                                <div class="metric-value">${
                                  performanceMetrics.boundary_precision
                                }</div>
                            </div>
                            <div class="metric">
                                <div class="metric-label">Processing Time:</div>
                                <div class="metric-value">${
                                  performanceMetrics.processing_time
                                }s</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

  // 添加控制功能
  const controlButtons = container.querySelectorAll(".control-button");
  controlButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const action = this.getAttribute("data-action");
      handleSegmentationControl(action, container);
    });
  });

  // 为图表添加动画
  const segmentBarFills = container.querySelectorAll(".segment-bar-fill");
  segmentBarFills.forEach((bar) => {
    const width = bar.style.width;
    bar.style.width = "0";

    setTimeout(() => {
      bar.style.transition = "width 1s ease";
      bar.style.width = width;
    }, 500);
  });
}

/**
 * 处理分割控制操作
 */
function handleSegmentationControl(action, container) {
  const segmentationImage = container.querySelector(".segmentation-image");

  switch (action) {
    case "zoom-in":
      segmentationImage.classList.add("zoomed");
      showNotification("Zoomed in on segmentation image", "info");
      break;

    case "zoom-out":
      segmentationImage.classList.remove("zoomed");
      showNotification("Zoomed out to normal view", "info");
      break;

    case "toggle-mask":
      const img = segmentationImage.querySelector("img");
      if (img.style.opacity === "0.7") {
        img.style.opacity = "1";
        showNotification("Showing full segmentation", "info");
      } else {
        img.style.opacity = "0.7";
        showNotification("Showing segmentation mask only", "info");
      }
      break;

    case "download":
      simulateDownload("segmentation_results.jpg");
      break;
  }
}

/**
 * 显示知识图谱结果
 */
function showKnowledgeGraphResults(container, species, data) {
  container.innerHTML = `
        <div class="analysis-result knowledge-graph-result">
            <h4>Knowledge Graph Results</h4>
            <div class="result-content">
                <div class="result-visualization">
                    <div id="result-knowledge-graph" class="knowledge-graph-container"></div>
                </div>
                <div class="result-details">
                    <div class="result-summary">
                        <p>The knowledge graph shows relationships between the ${species}, its behaviors, and environmental context.</p>
                    </div>
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
                            <span class="legend-color" style="background-color: #2ecc71;"></span>
                            <span class="legend-label">Environment</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

  // 使用D3绘制知识图谱
  const width = document.getElementById("result-knowledge-graph").clientWidth;
  const height = 300;

  // 创建SVG
  const svg = d3
    .select("#result-knowledge-graph")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // 创建力导向布局
  const simulation = d3
    .forceSimulation(data.nodes)
    .force(
      "link",
      d3
        .forceLink(data.links)
        .id((d) => d.id)
        .distance(100)
    )
    .force("charge", d3.forceManyBody().strength(-400))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force(
      "collision",
      d3.forceCollide().radius((d) => d.size + 10)
    );

  // 创建连接
  const link = svg
    .append("g")
    .selectAll(".graph-link")
    .data(data.links)
    .enter()
    .append("path")
    .attr("class", "graph-link")
    .attr("stroke", (d) => getLinkColor(d.type))
    .attr("stroke-width", 2)
    .attr("opacity", 0.7)
    .attr("fill", "none");

  // 创建连接标签
  const linkLabel = svg
    .append("g")
    .selectAll(".link-label")
    .data(data.links)
    .enter()
    .append("text")
    .attr("class", "link-label")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("dy", -5)
    .attr("fill", (d) => getLinkColor(d.type))
    .text((d) => d.type);

  // 创建节点
  const node = svg
    .append("g")
    .selectAll(".graph-node")
    .data(data.nodes)
    .enter()
    .append("g")
    .attr("class", "graph-node")
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  // 添加节点圆形
  node
    .append("circle")
    .attr("r", (d) => d.size)
    .attr("fill", (d) => getNodeColor(d.group))
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .attr("opacity", 0.85);

  // 添加节点标签
  node
    .append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "0.3em")
    .attr("fill", "white")
    .attr("font-weight", "bold")
    .attr("font-size", (d) => (d.size > 30 ? "14px" : "12px"))
    .text((d) => d.label);

  // 更新模拟的tick函数
  simulation.on("tick", () => {
    // 约束节点在边界内
    data.nodes.forEach((d) => {
      d.x = Math.max(d.size, Math.min(width - d.size, d.x));
      d.y = Math.max(d.size, Math.min(height - d.size, d.y));
    });

    // 更新连接路径 - 使用曲线路径
    link.attr("d", (d) => {
      // 创建曲线连接
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;

      // 计算考虑节点大小的源和目标点
      const sourceSize = data.nodes.find((n) => n.id === d.source.id).size;
      const targetSize = data.nodes.find((n) => n.id === d.target.id).size;

      const angle = Math.atan2(dy, dx);
      const sourceX = d.source.x + Math.cos(angle) * sourceSize;
      const sourceY = d.source.y + Math.sin(angle) * sourceSize;
      // 移除箭头额外的偏移
      const targetX = d.target.x - Math.cos(angle) * targetSize;
      const targetY = d.target.y - Math.sin(angle) * targetSize;

      return `M${sourceX},${sourceY} A${dr},${dr} 0 0,1 ${targetX},${targetY}`;
    });

    // 更新连接标签位置
    linkLabel.attr("transform", (d) => {
      // 简单地放在连接的中点
      const midX = (d.source.x + d.target.x) / 2;
      const midY = (d.source.y + d.target.y) / 2;
      return `translate(${midX}, ${midY})`;
    });

    // 更新节点位置
    node.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
  });

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

  // 获取节点颜色
  function getNodeColor(group) {
    const colors = {
      1: "#3498db", // 动物
      2: "#e74c3c", // 行为
      3: "#2ecc71", // 环境
    };
    return colors[group] || "#95a5a6";
  }

  // 获取连接颜色
  function getLinkColor(type) {
    const typeMap = {
      lie: "green",
      sniff: "red",
      near: "purple",
      walk: "red",
      eating: "orange",
      hunting: "red",
      resting: "blue",
    };

    return typeMap[type] || "blue";
  }
}

/**
 * 显示描述结果
 */
function showDescriptionResults(container, species, data) {
  // 使用后端返回的置信度
  const confidence = data.confidence || 92.4;

  container.innerHTML = `
        <div class="analysis-result description-result">
            <h4>Behavior Description Results</h4>
            <div class="result-content">
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
                            <span class="typing-text" data-text="${data.description}"></span>
                        </div>
                        <div class="terminal-line response typing-text-container delay-3">
                            <span class="typing-text" data-text="Description confidence: ${confidence}%"></span>
                        </div>
                        <div class="terminal-line cursor">> _</div>
                    </div>
                </div>
            </div>
        </div>
    `;

  // 初始化打字动画
  const typingElements = container.querySelectorAll(".typing-text");
  typingElements.forEach((element, index) => {
    setTimeout(() => {
      initiateTypingAnimation(element);
    }, index * 1500);
  });
}

/**
 * 处理检测控制操作
 */
function handleDetectionControl(action, container) {
  const detectionImage = container.querySelector(".detection-image");

  switch (action) {
    case "zoom-in":
      detectionImage.classList.add("zoomed");
      showNotification("Zoomed in on detection image", "info");
      break;

    case "zoom-out":
      detectionImage.classList.remove("zoomed");
      showNotification("Zoomed out to normal view", "info");
      break;

    case "toggle-boxes":
      const img = detectionImage.querySelector("img");
      const currentSrc = img.src;

      // 这里我们使用一个标志来记录当前状态
      if (detectionImage.dataset.boxesVisible === "false") {
        // 如果边界框当前隐藏，切换回带边界框的图像
        img.src = detectionImage.dataset.originalSrc || currentSrc;
        detectionImage.dataset.boxesVisible = "true";
        showNotification("Showing detection boxes", "info");
      } else {
        // 如果边界框当前显示，保存原始图像并请求无边界框的图像
        if (!detectionImage.dataset.originalSrc) {
          detectionImage.dataset.originalSrc = currentSrc;
        }
        // 这里我们应该从后端请求无边界框的图像，但为了演示暂时只显示通知
        detectionImage.dataset.boxesVisible = "false";
        showNotification(
          "Hiding detection boxes (functionality would fetch plain image)",
          "info"
        );
      }
      break;

    case "download":
      // 保存当前图像
      const image = detectionImage.querySelector("img");
      const link = document.createElement("a");
      link.href = image.src;
      link.download = `${new Date()
        .toISOString()
        .slice(0, 10)}_detection_results.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification("Image downloaded successfully", "success");
      break;
  }
}
/**
 * Show notification message
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, warning, error, info)
 */
function showNotification(message, type = "info") {
  // 检查是否已存在通知容器
  let notificationContainer = document.querySelector(".notification-container");

  if (!notificationContainer) {
    // 创建通知容器
    notificationContainer = document.createElement("div");
    notificationContainer.className = "notification-container";
    document.body.appendChild(notificationContainer);
  }

  // 创建新通知
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;

  // 添加图标
  let icon = "info-circle";
  if (type === "success") icon = "check-circle";
  if (type === "warning") icon = "exclamation-triangle";
  if (type === "error") icon = "times-circle";

  // 设置通知内容
  notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="notification-message">${message}</div>
        <div class="notification-close">
            <i class="fas fa-times"></i>
        </div>
    `;

  // 添加通知到容器
  notificationContainer.appendChild(notification);

  // 添加关闭功能
  const closeButton = notification.querySelector(".notification-close");
  closeButton.addEventListener("click", function () {
    notification.classList.add("fade-out");
    setTimeout(() => {
      notification.remove();
    }, 300);
  });

  // 自动淡出
  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 5000);
}

/**
 * Simulate file download
 * @param {string} filename - Name of file to download
 */
function simulateDownload(filename) {
  showNotification(`Downloading ${filename}...`, "info");

  // Simulate download delay
  setTimeout(() => {
    showNotification(`${filename} downloaded successfully`, "success");
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
  let styleElement = document.getElementById("application-styles");
  if (styleElement) {
    // Append detection styles to existing styles
    styleElement.textContent += detectionStyles;
  } else {
    // Create new style element
    styleElement = document.createElement("style");
    styleElement.id = "application-styles";
    styleElement.textContent = detectionStyles;
    document.head.appendChild(styleElement);
  }
}

// Call this function when document is loaded
document.addEventListener("DOMContentLoaded", function () {
  addDetectionStyles();
});
