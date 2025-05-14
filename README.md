# EKG-WildBehavior
[![Paper](https://img.shields.io/badge/Paper-ESWA%202025-brightgreen)](https://link-to-paper.com)

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](./LICENSE) 

📢 *We will release the full code, dataset, and system demo upon paper acceptance.*

## 📖 Background

Biodiversity protection increasingly relies on intelligent wildlife monitoring. While current deep learning methods excel at species classification, they fall short in interpreting **complex animal behaviors**, especially from large-scale, unstructured camera trap data. In addition, non-computer-expert zoologists face difficulties using and interpreting outputs from these black-box models.

To bridge this gap, we propose **EKG-WildBehavior**, a novel ecological knowledge-guided pipeline for **end-to-end wildlife behavior understanding** from raw monitoring images to interpretable natural language descriptions, providing an intuitive and explainable toolkit for field ecologists.

---

## 🔑 Key Features

Our approach integrates **multi-modal information extraction**, **knowledge graph construction**, and **natural language generation** in a unified framework:

1. **Entity Detection**  
   Accurate detection of animal and environmental entities using advanced vision-language fusion techniques, achieving **99.57% identification rate**.

2. **Behavioral Relation Extraction**  
   Construct interaction-centric knowledge graphs representing behaviors, addressing long-tail and low-frequency behavior challenges.

3. **Textual Behavior Description**  
   Generate natural language summaries from the knowledge graph using LLMs to support zoologist-friendly interpretation.

4. **System Design**
   A user-friendly web system will be developed supporting image upload, KG visualization, and auto report generation.
   The link of our system is as follow:

---

## 📊 Performance Highlights

| Task                        | Metric            | Our Model | Improvement Over Baselines |
|----------------------------|-------------------|-----------|-----------------------------|
| Entity Identification      | Accuracy          | 99.57%    | +6.87%                      |
| Relationship Prediction    | F1 Score          | ↑10.22%   | Compared to SOTA methods   |
| Behavior Retrieval         | R@4 / mR@4        | 0.939 / 0.9706 | Top-tier performance |

---

## 📂 Project Structure

```
EKG-WildBehavior/
├── docs/           # Paper, architecture diagrams
├── configs/        # Model configuration files
├── dataset/        # Data parsing & annotation tools (TBA)
├── models/         # Model definitions
├── kg_module/      # Knowledge graph construction & query
├── generation/     # Text generation module
├── system/         # System frontend/backend (TBA)
└── README.md       # Project documentation
```



---

## 🔓 License

This project will be released under the [Apache 2.0 License](./LICENSE) after paper acceptance.

---

## 📬 Contact

For academic collaboration or questions, please reach out to:  
📧 chao_m@bjfu.edu.cn

