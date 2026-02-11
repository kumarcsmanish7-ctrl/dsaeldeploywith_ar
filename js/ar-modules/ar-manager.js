
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
            color: 0x888888,
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

    // --- GENERATORS (Scaled for Tabletop ~20-30cm max) ---

    generateStack(group, items) {
        const boxSize = 0.1; // 10cm
        const gap = 0.02;    // 2cm gap

        // Material: Bright Green
        const material = new THREE.MeshStandardMaterial({ color: 0x4CAF50, roughness: 0.3, metalness: 0.1 });
        const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);

        items.forEach((val, index) => {
            const mesh = new THREE.Mesh(geometry, material);
            // Stack upwards: y = (size + gap) * index + half_size (pivot is center)
            mesh.position.y = (boxSize + gap) * index + (boxSize / 2);
            group.add(mesh);
        });
    }

    generateQueue(group, items) {
        const boxSize = 0.1;
        const gap = 0.02;
        const material = new THREE.MeshStandardMaterial({ color: 0x2196F3, roughness: 0.3 });
        const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);

        items.forEach((val, index) => {
            const mesh = new THREE.Mesh(geometry, material);
            // Line up along X axis
            mesh.position.x = (boxSize + gap) * index;
            mesh.position.y = boxSize / 2; // Sit on floor
            group.add(mesh);
        });
    }

    generateCircularQueue(group, items) {
        const boxSize = 0.08;
        const radius = 0.25; // 25cm radius
        const material = new THREE.MeshStandardMaterial({ color: 0xFF9800, roughness: 0.3 });
        const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);

        const count = items.length;
        items.forEach((val, index) => {
            const angle = (index / count) * Math.PI * 2;
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.x = Math.cos(angle) * radius;
            mesh.position.z = Math.sin(angle) * radius;
            mesh.position.y = boxSize / 2;

            mesh.lookAt(0, boxSize / 2, 0); // Face center
            group.add(mesh);
        });
    }

    generateLinkedList(group, items) {
        const boxSize = 0.08;
        const dist = 0.2; // 20cm spacing
        const material = new THREE.MeshStandardMaterial({ color: 0x9C27B0, roughness: 0.3 });
        const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);

        // Arrow material
        const arrowMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const arrowLen = dist - boxSize;

        items.forEach((val, index) => {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = index * dist;
            mesh.position.y = boxSize / 2;
            group.add(mesh);

            // Draw arrow to next
            if (index < items.length - 1) {
                const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, arrowLen), arrowMat);
                arrow.rotation.z = -Math.PI / 2; // Horizontal
                arrow.position.x = (index * dist) + (boxSize / 2) + (arrowLen / 2);
                arrow.position.y = boxSize / 2;
                group.add(arrow);
            }
        });
    }

    generateBST(group, root) {
        if (!root) return;

        const nodeRadius = 0.05; // 5cm
        const material = new THREE.MeshStandardMaterial({ color: 0x009688, roughness: 0.3 });
        const geometry = new THREE.SphereGeometry(nodeRadius);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });

        const traverse = (node, x, y, z, level) => {
            if (!node) return;

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            group.add(mesh);

            const spread = 0.4 / (level + 1); // shrink spread as we go down
            const drop = 0.2;

            if (node.left) {
                const nextX = x - spread;
                const nextY = y - drop;
                traverse(node.left, nextX, nextY, z, level + 1);
                this.addLine(group, x, y, z, nextX, nextY, z, lineMat);
            }
            if (node.right) {
                const nextX = x + spread;
                const nextY = y - drop;
                traverse(node.right, nextX, nextY, z, level + 1);
                this.addLine(group, x, y, z, nextX, nextY, z, lineMat);
            }
        };

        // Start higher up so tree hangs down or builds up
        // Let's build up from y=0.1 or down from y=1.0? 
        // Trees usually look better top-down. Let's start at y=1.0m
        traverse(root, 0, 0.8, 0, 1);
    }

    generateHeap(group, items) {
        if (!items || items.length === 0) return;

        const nodeRadius = 0.05;
        const material = new THREE.MeshStandardMaterial({ color: 0xFFC107, roughness: 0.3 });
        const geometry = new THREE.SphereGeometry(nodeRadius);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x000000 });

        const positions = {}; // map index -> {x,y,z}

        const traverse = (index, x, y, z, level) => {
            if (index >= items.length) return;

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            group.add(mesh);
            positions[index] = { x, y, z };

            // Connect to parent
            if (index > 0) {
                const parentIdx = Math.floor((index - 1) / 2);
                const p = positions[parentIdx];
                if (p) {
                    this.addLine(group, x, y, z, p.x, p.y, p.z, lineMat);
                }
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
