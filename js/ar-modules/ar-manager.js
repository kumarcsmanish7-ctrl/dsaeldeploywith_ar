
import * as THREE from 'three';
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';

export class ARManager {
    constructor() {
        this.exporter = new USDZExporter();
    }

    async exportCurrentStructure(structureType, data) {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(2, 5, 5);
        scene.add(directionalLight);

        // Add a base plane for debugging (semi-transparent)
        const baseGeometry = new THREE.PlaneGeometry(0.5, 0.5);
        const baseMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.rotation.x = -Math.PI / 2;
        scene.add(base);

        // Generate specific structure
        switch (structureType) {
            case 'stack':
                this.generateStack(scene, data);
                break;
            case 'queue':
                this.generateQueue(scene, data);
                break;
            case 'circular-queue':
                this.generateCircularQueue(scene, data);
                break;
            case 'singly-linked-list':
            case 'doubly-linked-list':
                this.generateLinkedList(scene, data);
                break;
            case 'bst':
                this.generateBST(scene, data);
                break;
            case 'heap':
            case 'scheduler':
                this.generateHeap(scene, data);
                break;
            default:
                console.warn('AR for this structure not implemented yet');
                alert('AR view for this structure is coming soon!');
                return;
        }

        // Export to USDZ
        const usdz = await this.exporter.parse(scene);
        const blob = new Blob([usdz], { type: 'model/vnd.usdz+zip' });
        const url = URL.createObjectURL(blob);

        // Trigger Quick Look (iOS) or Download
        const link = document.createElement('a');
        link.rel = 'ar';
        link.href = url;

        // Improve filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `dsa-${structureType}-${timestamp}.usdz`;

        // For iOS Quick Look to work from a button click, we need to append and click
        const img = document.createElement('img');
        img.src = 'https://upload.wikimedia.org/wikipedia/commons/4/48/Ar_icon.png'; // Placeholder or use generated thumbnail
        link.appendChild(img);

        // Determine interaction based on device (simplified)
        // Ideally, we just click the link.
        link.click();
    }

    generateStack(scene, items) {
        // Vertical stack of boxes
        // SCALED DOWN: 0.15 size (15cm)
        const geometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        const material = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });

        items.forEach((item, index) => {
            const cube = new THREE.Mesh(geometry, material);
            // Stack vertically with gaps. Bottom of stack at y=0.075 (half height)
            cube.position.y = (index * 0.2) + 0.075;
            scene.add(cube);
        });
    }

    generateQueue(scene, items) {
        // Horizontal row of boxes
        const geometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        const material = new THREE.MeshStandardMaterial({ color: 0x2196F3 });

        items.forEach((item, index) => {
            const cube = new THREE.Mesh(geometry, material);
            cube.position.x = index * 0.2;
            cube.position.y = 0.075; // On ground
            scene.add(cube);
        });
    }

    generateCircularQueue(scene, items) {
        // Circular arrangement
        // Scale radius down
        const radius = Math.max(0.3, items.length * 0.05);
        const geometry = new THREE.BoxGeometry(0.12, 0.12, 0.12);
        const material = new THREE.MeshStandardMaterial({ color: 0xFF9800 });

        items.forEach((item, index) => {
            const angle = (index / items.length) * Math.PI * 2;
            const cube = new THREE.Mesh(geometry, material);
            cube.position.x = Math.cos(angle) * radius;
            cube.position.z = Math.sin(angle) * radius;
            cube.position.y = 0.06;
            cube.lookAt(0, 0.06, 0); // Look at center
            scene.add(cube);
        });
    }

    generateLinkedList(scene, items) {
        // Cubes connected by small cylinder "arrows"
        const geometry = new THREE.BoxGeometry(0.15, 0.1, 0.1);
        const material = new THREE.MeshStandardMaterial({ color: 0x9C27B0 });
        const arrowMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

        items.forEach((item, index) => {
            const cube = new THREE.Mesh(geometry, material);
            cube.position.x = index * 0.3;
            cube.position.y = 0.05;
            scene.add(cube);

            if (index < items.length - 1) {
                const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.15), arrowMat);
                arrow.rotation.z = Math.PI / 2;
                arrow.position.x = (index * 0.3) + 0.15 + 0.075; // Halfway
                arrow.position.y = 0.05;
                scene.add(arrow);
            }
        });
    }

    generateBST(scene, root) {
        if (!root) return;

        const geometry = new THREE.SphereGeometry(0.08); // 8cm radius sphere
        const material = new THREE.MeshStandardMaterial({ color: 0x009688 });
        const linkMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

        const traverse = (node, x, y, z, level) => {
            if (!node) return;

            const mesh = new THREE.Mesh(geometry, material);
            // Start root higher up (1.0m) so it doesn't clip into ground immediately
            mesh.position.set(x, y, z);
            scene.add(mesh);

            const offset = 0.5 / (level + 1);

            if (node.left) {
                traverse(node.left, x - offset, y - 0.3, z, level + 1);
                this.addLine(scene, x, y, z, x - offset, y - 0.3, z, linkMat);
            }
            if (node.right) {
                traverse(node.right, x + offset, y - 0.3, z, level + 1);
                this.addLine(scene, x, y, z, x + offset, y - 0.3, z, linkMat);

            }
        };

        // Start root higher up
        traverse(root, 0, 1.0, 0, 0);
    }

    addLine(scene, x1, y1, z1, x2, y2, z2, material) {
        const path = new THREE.LineCurve3(new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2));
        const tube = new THREE.TubeGeometry(path, 1, 0.01, 8, false); // Thinner
        const mesh = new THREE.Mesh(tube, material);
        scene.add(mesh);
    }

    generateHeap(scene, items) {
        if (!items || items.length === 0) return;

        const geometry = new THREE.SphereGeometry(0.08);
        const material = new THREE.MeshStandardMaterial({ color: 0xFFC107 });
        const linkMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

        // Use a map to store positions for line drawing
        const positions = {};

        const traverse = (index, x, y, z, level) => {
            if (index >= items.length) return;

            // Visualization for Scheduler might have objects { task, priority }
            // Visualization for Heap might have numbers
            let value = items[index];
            if (typeof value === 'object' && value.priority !== undefined) {
                value = value.priority; // Show priority for scheduler
            }

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            scene.add(mesh);
            positions[index] = { x, y, z };

            // Draw line to parent
            if (index > 0) {
                const parentIndex = Math.floor((index - 1) / 2);
                const p = positions[parentIndex];
                if (p) {
                    this.addLine(scene, x, y, z, p.x, p.y, p.z, linkMat);
                }
            }

            const offset = 0.8 / Math.pow(2, level); // Tighter packing

            traverse(2 * index + 1, x - offset, y - 0.3, z, level + 1);
            traverse(2 * index + 2, x + offset, y - 0.3, z, level + 1);
        };

        // Root at 1m height
        traverse(0, 0, 1.0, 0, 0);
    }
}
