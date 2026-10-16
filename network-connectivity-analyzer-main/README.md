# Network Connectivity & Analyzer Simulator

Live Demo: https://network-connectivity-analyzer.onrender.com

GitHub Repository: https://github.com/Preesha600274/network-connectivity-analyzer.git



## Project Overview

The Network Connectivity & Analyzer Simulator is a web-based application designed to demonstrate fundamental Data Structures and Algorithms (DSA) concepts through a simulated computer network.

Users can add network devices, create connections between devices, and analyze network connectivity using graph traversal and related algorithms.

## Objectives

- Simulate a network of interconnected devices.
- Visualize network topology.
- Demonstrate BFS and DFS graph traversal.
- Calculate a Minimum Spanning Tree (MST).
- Analyze network connectivity.
- Provide an interactive interface for network operations.

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python, Flask
- **Algorithms:** Graph, BFS, DFS, Minimum Spanning Tree, Connectivity Analysis
- **Deployment:** Render
- **Version Control:** Git and GitHub

## Features

- Interactive network topology dashboard.
- Add and remove network devices.
- Create connections between devices.
- Run BFS and DFS traversal.
- Generate a Minimum Spanning Tree.
- Analyze network connectivity.
- View network statistics and device information.

## Project Structure

```text
Network-Connectivity-Analyzer/
├── app.py
├── requirements.txt
├── .gitignore
├── templates/
│   └── index.html
└── static/
    ├── css/
    │   └── style.css
    └── js/
        └── script.js
```

## Installation and Setup

### Prerequisites

- Python 3 installed
- Git installed (optional, for cloning the repository)

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/Preesha600274/network-connectivity-analyzer.git
   ```

2. Open the project directory:

   ```bash
   cd network-connectivity-analyzer
   ```

3. Create a virtual environment:

   ```bash
   python -m venv .venv
   ```

4. Activate it on Windows PowerShell:

   ```powershell
   .venv\Scripts\Activate.ps1
   ```

5. Install the dependencies:

   ```bash
   python -m pip install -r requirements.txt
   ```

6. Run the application:

   ```bash
   python app.py
   ```

7. Open the following address in your browser:

   `http://127.0.0.1:5000`

## Deployment

The application is deployed using Render. Open the live application using the deployment URL provided by Render.

## Future Enhancements

- Add a tree-based network hierarchy.
- Implement sorting, searching, and hashing for device IDs.
- Add a Trie-based device-name search.
- Demonstrate stack and queue operations explicitly.
- Improve data persistence and network visualization.

## License

This project is intended for educational purposes.
