
import * as THREE from 'three';
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';

export class ARManager {
    constructor() {
        this.exporter = new USDZExporter();
    }

    async exportCurrentStructure(structureType, data) {
        console.log(`[ARManager] Generating for ${structureType}`, data);

        // --- 1. SETUP SCENE ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        // Root group to hold everything - essential for AR scaling/placement consistency
        const arContent = new THREE.Group();
        scene.add(arContent);

        // --- 2. LIGHTING (Crucial for "Grey Object" fix) ---
        // Strong Ambient Light to ensure nothing is pitch black
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        scene.add(ambientLight);

        // Directional Light for depth/shadows
        const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
        dirLight.position.set(5, 10, 7);
        scene.add(dirLight);

        // --- 3. BASE ANCHOR (Helps iPad placement) ---
        // Invisible plane at y=0 to help ARKit/ARCore detect "floor"
        const baseGeo = new THREE.PlaneGeometry(0.5, 0.5);
        const baseMat = new THREE.MeshBasicMaterial({
            color: 0x0000FF, // BLUE BASE for verification
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
        });
        const basePlane = new THREE.Mesh(baseGeo, baseMat);
        basePlane.rotation.x = -Math.PI / 2; // Flat on ground
        arContent.add(basePlane);

        // --- 4. DATA FALLBACK ---
        if (!data || data.length === 0) {
            console.warn("[ARManager] No data provided, using DEMO data.");
            data = [10, 20, 30, 40, 50]; // Default demo data
            alert("No data detected. Using DEMO data for AR view.");
        }

        // --- 5. GENERATE CONTENT ---
        try {
            switch (structureType) {
                case 'stack':
                    this.generateStack(arContent, data);
                    break;
                case 'queue':
                    this.generateQueue(arContent, data);
                    break;
                case 'circular-queue':
                    this.generateCircularQueue(arContent, data);
                    break;
                case 'singly-linked-list':
                case 'doubly-linked-list':
                    this.generateLinkedList(arContent, data);
                    break;
                case 'bst':
                    this.generateBST(arContent, data);
                    break;
                case 'heap':
                case 'scheduler':
                    this.generateHeap(arContent, data);
                    break;
                default:
                    alert('AR for this structure is not yet implemented.');
                    return;
            }
        } catch (err) {
            console.error("[ARManager] Error generating structure:", err);
            alert("Error constructing AR model: " + err.message);
            return;
        }

        // --- 6. EXPORT ---
        this.exportScene(scene, structureType);
    }

    async exportScene(scene, filenamePrefix) {
        try {
            const usdz = await this.exporter.parse(scene);
            const blob = new Blob([usdz], { type: 'model/vnd.usdz+zip' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.rel = 'ar';
            link.href = url;
            link.download = `${filenamePrefix}-ar.usdz`;

            // Standard AR Icon image to prompt user gesture if needed
            const img = document.createElement('img');
            img.src = 'https://upload.wikimedia.org/wikipedia/commons/4/48/Ar_icon.png';
            img.style.display = 'none'; // distinct click is better
            link.appendChild(img);

            link.click();

            // Cleanup
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 5000);

        } catch (error) {
            console.error("[ARManager] Export failed:", error);
            alert("Failed to export AR file: " + error.message);
        }
    }

    // --- HELPERS ---

    createLabelTexture(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Background (White/Transparent)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 256, 256);

        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, 246, 246);

        // Text
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 120px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 128);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createInfoPanel(group, text) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128; // Wide banner
        const ctx = canvas.getContext('2d');

        // Panel Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        // Check if roundRect is available, otherwise use fillRect
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(0, 0, 512, 128, 20);
            ctx.fill();
        } else {
            ctx.fillRect(0, 0, 512, 128);
        }


        // Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 256, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });

        const geometry = new THREE.PlaneGeometry(0.4, 0.1); // 40cm x 10cm
        const mesh = new THREE.Mesh(geometry, material);

        // Position: Top Right
        mesh.position.set(0.3, 0.5, 0);
        // Look at camera (roughly front)
        mesh.lookAt(0, 0.5, 1);

        group.add(mesh);
    }

    // --- GENERATORS (High Fidelity) ---

    generateStack(group, items) {
        // DEBUG DATA:
        alert(`Stack Data Received: ${JSON.stringify(items)}\nItems Count: ${items.length}`);

        const boxSize = 0.1; // 10cm
        const gap = 0.05;    // Increased gap to 5cm to be super safe

        items.forEach((val, index) => {
            // Glassy Premium Material
            // Note: USDZ export of transmission is tricky, falling back to Standard with opacity for stability
            const material = new THREE.MeshStandardMaterial({
                color: 0x4CAF50, // DSA Green
                roughness: 0.2,
                metalness: 0.1,
                map: this.createLabelTexture(val.toString()),
                transparent: true,
                opacity: 0.95 // Slightly more opaque
            });

            const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
            const mesh = new THREE.Mesh(geometry, material);

            // Stack upwards
            mesh.position.y = (boxSize + gap) * index + (boxSize / 2);
            group.add(mesh);
        });

        // Add "TOP" indicator above best element
        if (items.length > 0) {
            const topY = (boxSize + gap) * (items.length - 1) + boxSize + 0.05;
            this.createInfoPanel(group, `Top: ${items[items.length - 1]}`);

            // Stats Panel
            const statsCanvas = document.createElement('canvas');
            statsCanvas.width = 512; statsCanvas.height = 256;
            const ctx = statsCanvas.getContext('2d');
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(0, 0, 512, 256);
            ctx.fillStyle = '#000';
            ctx.font = '30px Arial';
            ctx.fillText(`Stack Size: ${items.length}`, 20, 50);
            ctx.fillText("Time Complexity: O(1)", 20, 100);
            ctx.fillText("Space Complexity: O(n)", 20, 150);

            const tex = new THREE.CanvasTexture(statsCanvas);
            const panel = new THREE.Mesh(
                new THREE.PlaneGeometry(0.3, 0.15),
                new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
            );
            panel.position.set(-0.3, 0.2, 0);
            panel.lookAt(0, 0.2, 1);
            group.add(panel);
        }
    }

    generateQueue(group, items) {
        const boxSize = 0.1;
        const gap = 0.02;

        items.forEach((val, index) => {
            const material = new THREE.MeshStandardMaterial({
                color: 0x2196F3,
                roughness: 0.2,
                map: this.createLabelTexture(val.toString())
            });
            const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
            const mesh = new THREE.Mesh(geometry, material); // Declare mesh here
            mesh.position.x = (boxSize + gap) * index;
            mesh.position.y = boxSize / 2;
            group.add(mesh);
        });
    }

    generateCircularQueue(group, items) {
        // ... (Keep existing simplified logic for now but apply texture if possible)
        const boxSize = 0.08;
        const radius = 0.25;
        const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);

        items.forEach((val, index) => {
            // ... same logic
            const material = new THREE.MeshStandardMaterial({
                color: 0xFF9800,
                roughness: 0.3,
                map: this.createLabelTexture(val.toString())
            });
            const angle = (index / items.length) * Math.PI * 2;
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = Math.cos(angle) * radius;
            mesh.position.z = Math.sin(angle) * radius;
            mesh.position.y = boxSize / 2;
            mesh.lookAt(0, boxSize / 2, 0);
            group.add(mesh);
        });
    }

    generateLinkedList(group, items) {
        // ... (Keep existing)
        const boxSize = 0.08;
        const dist = 0.2;
        items.forEach((val, index) => {
            const material = new THREE.MeshStandardMaterial({
                color: 0x9C27B0,
                roughness: 0.3,
                map: this.createLabelTexture(val.toString())
            });
            const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = index * dist;
            mesh.position.y = boxSize / 2;
            group.add(mesh);
            // ... arrows
            if (index < items.length - 1) {
                const arrowMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
                const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, dist - boxSize), arrowMat);
                arrow.rotation.z = -Math.PI / 2;
                arrow.position.x = (index * dist) + (boxSize / 2) + ((dist - boxSize) / 2);
                arrow.position.y = boxSize / 2;
                group.add(arrow);
            }
        });
    }

    generateBST(group, root) {
        // ... (Keep existing but add label support if time permits, for now keep structure)
        if (!root) return;
        const nodeRadius = 0.05;
        const geometry = new THREE.SphereGeometry(nodeRadius);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });

        const traverse = (node, x, y, z, level) => {
            if (!node) return;
            // TODO: Sphere mapping for text is tricky, maybe add sprite?
            const material = new THREE.MeshStandardMaterial({
                color: 0x009688,
                roughness: 0.3,
                map: this.createLabelTexture(node.value.toString()) // Assuming node has a 'value' property
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            group.add(mesh);
            // ... recursion
            const spread = 0.4 / (level + 1);
            const drop = 0.2;
            if (node.left) {
                traverse(node.left, x - spread, y - drop, z, level + 1);
                this.addLine(group, x, y, z, x - spread, y - drop, z, lineMat);
            }
            if (node.right) {
                traverse(node.right, x + spread, y - drop, z, level + 1);
                this.addLine(group, x, y, z, x + spread, y - drop, z, lineMat);
            }
        };
        traverse(root, 0, 0.8, 0, 1);
    }

    generateHeap(group, items) {
        // ... (Keep existing)
        if (!items || items.length === 0) return;
        const nodeRadius = 0.05;
        const geometry = new THREE.SphereGeometry(nodeRadius);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x000000 });
        const positions = {};
        const traverse = (index, x, y, z, level) => {
            if (index >= items.length) return;
            const material = new THREE.MeshStandardMaterial({
                color: 0xFFC107,
                roughness: 0.3,
                map: this.createLabelTexture(items[index].toString())
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            group.add(mesh);
            positions[index] = { x, y, z };
            if (index > 0) {
                const parentIdx = Math.floor((index - 1) / 2);
                const p = positions[parentIdx];
                if (p) this.addLine(group, x, y, z, p.x, p.y, p.z, lineMat);
            }
            const spread = 0.5 / Math.pow(2, level);
            const drop = 0.2;
            traverse(2 * index + 1, x - spread, y - drop, z, level + 1);
            traverse(2 * index + 2, x + spread, y - drop, z, level + 1);
        };
        traverse(0, 0, 0.8, 0, 0);
    }

    addLine(group, x1, y1, z1, x2, y2, z2, material) {
        const points = [];
        points.push(new THREE.Vector3(x1, y1, z1));
        points.push(new THREE.Vector3(x2, y2, z2));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        group.add(line);
    }
}
