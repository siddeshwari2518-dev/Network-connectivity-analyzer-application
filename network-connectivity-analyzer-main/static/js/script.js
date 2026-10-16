
const $ = (id) => document.getElementById(id);

async function api(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
    }

    return data;
}

function notify(message, error = false) {
    const box = $("message");
    box.textContent = message;
    box.style.background = error ? "#b42318" : "#202747";
    box.classList.add("show");
    setTimeout(() => box.classList.remove("show"), 3000);
}

function fillSelect(id, devices) {
    const select = $(id);
    const previous = select.value;

    select.innerHTML = "";

    devices.forEach(device => {
        const option = document.createElement("option");
        option.value = device.id;
        option.textContent = `${device.id} — ${device.name}`;
        select.appendChild(option);
    });

    if (devices.some(d => d.id === previous)) {
        select.value = previous;
    }
}

function drawNetwork(devices, connections) {
    const canvas = $("networkCanvas");

    if (!devices.length) {
        canvas.textContent = "No devices yet. Add a device to begin!";
        return;
    }

    const width = 700;
    const height = 320;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(115, 45 + devices.length * 8);

    const positions = {};

    devices.forEach((device, index) => {
        const angle = -Math.PI / 2 +
            (2 * Math.PI * index / devices.length);

        positions[device.id] = {
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle)
        };
    });

    let svg = `<svg viewBox="0 0 ${width} ${height}"
        xmlns="http://www.w3.org/2000/svg"
        role="img" aria-label="Network topology">`;

    connections.forEach(edge => {
        const a = positions[edge.source];
        const b = positions[edge.target];

        if (!a || !b) return;

        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;

        svg += `
            <line x1="${a.x}" y1="${a.y}"
                  x2="${b.x}" y2="${b.y}"
                  stroke="#b5b0ed" stroke-width="2.5"/>
            <rect x="${mx - 15}" y="${my - 11}"
                  width="30" height="21" rx="7" fill="white"/>
            <text x="${mx}" y="${my + 4}" text-anchor="middle"
                  font-size="11" fill="#6558d9">${edge.weight}</text>`;
    });

    devices.forEach(device => {
        const p = positions[device.id];

        svg += `
            <circle cx="${p.x}" cy="${p.y}" r="25"
                    fill="#e8e5ff" stroke="#6558d9" stroke-width="2"/>
            <text x="${p.x}" y="${p.y + 4}"
                  text-anchor="middle" font-size="12"
                  font-weight="700" fill="#40369f">
                  ${escapeXML(device.id)}</text>
            <text x="${p.x}" y="${p.y + 39}"
                  text-anchor="middle" font-size="11"
                  fill="#555d78">${escapeXML(device.name)}</text>`;
    });

    svg += "</svg>";
    canvas.innerHTML = svg;
}

function escapeXML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;"
    })[char]);
}

function renderDevices(devices) {
    const list = $("deviceList");

    if (!devices.length) {
        list.textContent = "No devices registered.";
        return;
    }

    const table = document.createElement("table");
    table.className = "device-table";

    const header = document.createElement("tr");

    ["Device ID", "Device Name", "Action"].forEach(title => {
        const th = document.createElement("th");
        th.textContent = title;
        header.appendChild(th);
    });

    const thead = document.createElement("thead");
    thead.appendChild(header);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    devices.forEach(device => {
        const row = document.createElement("tr");

        [device.id, device.name].forEach(value => {
            const td = document.createElement("td");
            td.textContent = value;
            row.appendChild(td);
        });

        const action = document.createElement("td");
        const button = document.createElement("button");

        button.className = "delete-btn";
        button.textContent = "Delete";

        button.addEventListener("click", async () => {
            if (!confirm(`Delete device ${device.id}?`)) return;

            try {
                await api(`/api/device/${encodeURIComponent(device.id)}`, {
                    method: "DELETE"
                });

                notify("Device deleted successfully");
                await loadNetwork();
            } catch (error) {
                notify(error.message, true);
            }
        });

        action.appendChild(button);
        row.appendChild(action);
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    list.replaceChildren(table);
}

async function loadNetwork() {
    try {
        const data = await api("/api/network");

        $("deviceCount").textContent = data.devices.length;
        $("linkCount").textContent = data.connections.length;
        $("groupCount").textContent = data.components.length;

        drawNetwork(data.devices, data.connections);
        renderDevices(data.devices);

        ["source", "target", "start"].forEach(id => {
            fillSelect(id, data.devices);
        });
    } catch (error) {
        $("networkCanvas").textContent =
            "Cannot load network. Check that the Flask server is running.";
        notify(error.message, true);
    }
}

$("deviceForm").addEventListener("submit", async event => {
    event.preventDefault();

    try {
        const data = await api("/api/device", {
            method: "POST",
            body: JSON.stringify({
                id: $("deviceId").value,
                name: $("deviceName").value
            })
        });

        $("deviceForm").reset();
        notify(data.message);
        await loadNetwork();
    } catch (error) {
        notify(error.message, true);
    }
});

$("connectionForm").addEventListener("submit", async event => {
    event.preventDefault();

    try {
        const data = await api("/api/connection", {
            method: "POST",
            body: JSON.stringify({
                source: $("source").value,
                target: $("target").value,
                weight: $("weight").value
            })
        });

        notify(data.message);
        await loadNetwork();
    } catch (error) {
        notify(error.message, true);
    }
});

$("runAlgorithm").addEventListener("click", async () => {
    try {
        const algorithm = $("algorithm").value;

        const data = await api("/api/analyze", {
            method: "POST",
            body: JSON.stringify({
                algorithm,
                start: $("start").value
            })
        });

        const result = $("algorithmResult");
        result.classList.remove("error");
        result.replaceChildren();

        function addLine(label, value) {
            const p = document.createElement("p");
            const strong = document.createElement("strong");
            strong.textContent = label + ": ";
            p.append(strong, document.createTextNode(value));
            result.appendChild(p);
        }

        if (algorithm === "BFS" || algorithm === "DFS") {
            addLine("Traversal order", data.order.join(" → ") || "None");
            addLine("Devices reached", data.order.length);
        } else if (algorithm === "MST") {
            addLine("Selected minimum-cost links",
                data.edges.map(e =>
                    `${e.source} — ${e.target} (cost ${e.weight})`
                ).join(" | ") || "No links selected");

            addLine("Total cost", data.total);
            addLine("Status", data.edges.length ===
                Math.max(0, Number($("deviceCount").textContent) - 1)
                ? "All devices can be connected by this tree."
                : "Network is disconnected; this is a minimum spanning forest.");
        } else {
            data.components.forEach((group, index) => {
                addLine(`Group ${index + 1}`, group.join(", "));
            });

            addLine("Connectivity",
                data.components.length === 1
                    ? "All devices are connected."
                    : "Some devices are disconnected from other groups.");
        }
    } catch (error) {
        $("algorithmResult").classList.add("error");
        $("algorithmResult").textContent = error.message;
    }
});

loadNetwork();
