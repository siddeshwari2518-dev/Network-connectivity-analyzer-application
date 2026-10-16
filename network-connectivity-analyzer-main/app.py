
from flask import Flask, render_template, request, jsonify
from collections import deque

app = Flask(__name__)

# Temporary network data
devices = [
    {"id": "PC1", "name": "Computer 1"},
    {"id": "PC2", "name": "Computer 2"},
    {"id": "PC3", "name": "Computer 3"},
    {"id": "PC4", "name": "Computer 4"}
]

connections = [
    {"source": "PC1", "target": "PC2", "weight": 4},
    {"source": "PC1", "target": "PC3", "weight": 2},
    {"source": "PC2", "target": "PC4", "weight": 3},
    {"source": "PC3", "target": "PC4", "weight": 5}
]


def build_graph():
    graph = {d["id"]: [] for d in devices}
    for edge in connections:
        a, b, w = edge["source"], edge["target"], edge["weight"]
        if a in graph and b in graph:
            graph[a].append((b, w))
            graph[b].append((a, w))
    return graph


def bfs(start):
    graph = build_graph()
    if start not in graph:
        return []
    visited = {start}
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor, _ in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order


def dfs(start):
    graph = build_graph()
    if start not in graph:
        return []
    visited = set()
    order = []

    def visit(node):
        visited.add(node)
        order.append(node)
        for neighbor, _ in graph[node]:
            if neighbor not in visited:
                visit(neighbor)

    visit(start)
    return order


def connected_components():
    graph = build_graph()
    visited = set()
    groups = []

    for node in graph:
        if node not in visited:
            group = bfs_component(node, graph, visited)
            groups.append(group)

    return groups


def bfs_component(start, graph, visited):
    queue = deque([start])
    visited.add(start)
    group = []

    while queue:
        node = queue.popleft()
        group.append(node)
        for neighbor, _ in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

    return group


def kruskal():
    parent = {d["id"]: d["id"] for d in devices}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    result = []
    total = 0

    for edge in sorted(connections, key=lambda e: e["weight"]):
        a, b = find(edge["source"]), find(edge["target"])
        if a != b:
            parent[a] = b
            result.append(edge)
            total += edge["weight"]

    return {"edges": result, "total": total}


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/network")
def network():
    return jsonify({
        "devices": devices,
        "connections": connections,
        "components": connected_components()
    })


@app.route("/api/device", methods=["POST"])
def add_device():
    data = request.get_json() or {}
    device_id = data.get("id", "").strip().upper()
    name = data.get("name", "").strip()

    if not device_id or not name:
        return jsonify({"error": "Device ID and name are required"}), 400
    if any(d["id"] == device_id for d in devices):
        return jsonify({"error": "Device ID already exists"}), 400

    devices.append({"id": device_id, "name": name})
    return jsonify({"message": "Device added successfully"}), 201


@app.route("/api/connection", methods=["POST"])
def add_connection():
    data = request.get_json() or {}
    source = data.get("source", "").strip().upper()
    target = data.get("target", "").strip().upper()

    try:
        weight = float(data.get("weight", 1))
    except (ValueError, TypeError):
        return jsonify({"error": "Weight must be a number"}), 400

    ids = {d["id"] for d in devices}
    if source not in ids or target not in ids:
        return jsonify({"error": "Select existing devices"}), 400
    if source == target:
        return jsonify({"error": "Connect two different devices"}), 400
    if weight < 0:
        return jsonify({"error": "Weight cannot be negative"}), 400
    if any(
        {e["source"], e["target"]} == {source, target}
        for e in connections
    ):
        return jsonify({"error": "Connection already exists"}), 400

    connections.append({
        "source": source,
        "target": target,
        "weight": weight
    })
    return jsonify({"message": "Connection added successfully"}), 201


@app.route("/api/device/<device_id>", methods=["DELETE"])
def delete_device(device_id):
    device_id = device_id.upper()
    global devices, connections

    if not any(d["id"] == device_id for d in devices):
        return jsonify({"error": "Device not found"}), 404

    devices = [d for d in devices if d["id"] != device_id]
    connections = [
        e for e in connections
        if e["source"] != device_id and e["target"] != device_id
    ]
    return jsonify({"message": "Device deleted"})


@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json() or {}
    start = data.get("start", "").strip().upper()
    algorithm = data.get("algorithm", "BFS").upper()

    if start not in {d["id"] for d in devices}:
        return jsonify({"error": "Select a valid starting device"}), 400

    if algorithm == "BFS":
        order = bfs(start)
        result = {"order": order}
    elif algorithm == "DFS":
        order = dfs(start)
        result = {"order": order}
    elif algorithm == "MST":
        result = kruskal()
    elif algorithm == "CONNECTIVITY":
        result = {"components": connected_components()}
    else:
        return jsonify({"error": "Unknown algorithm"}), 400

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)
