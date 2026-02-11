
import * as THREE from 'three';
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';
import { ARButton } from 'three/addons/webxr/ARButton.js';

export class ARManager {
    constructor() {
        this.exporter = new USDZExporter();

        // WebXR State
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.reticle = null;
        this.controller = null;
        this.hitTestSource = null;
        this.hitTestSourceRequested = false;
        this.xrSession = null;

        this.placedGroup = null; // The root of our placed content
        this.isPlaced = false;
        this.raycaster = new THREE.Raycaster();
        this.uiButtons = []; // Array of { mesh, action }

        // Data State
        this.currentData = [];
        this.structureType = 'stack';
    }

    // =========================================================================
    //  EXISTING USDZ EXPORT (Quick Look Fallback)
    // =========================================================================

    async exportCurrentStructure(structureType, data) {
        console.log(`[ARManager] Generating USDZ for ${structureType}`, data);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        const arContent = new THREE.Group();
        scene.add(arContent);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
        dirLight.position.set(5, 10, 7);
        scene.add(dirLight);

        const baseGeo = new THREE.PlaneGeometry(0.5, 0.5);
        const baseMat = new THREE.MeshBasicMaterial({ color: 0x0000FF, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
        const basePlane = new THREE.Mesh(baseGeo, baseMat);
        basePlane.rotation.x = -Math.PI / 2;
        arContent.add(basePlane);

        if (!data || data.length === 0) {
            data = [10, 20, 30];
            alert("No data detected. Using DEMO data.");
        }

        try {
            switch (structureType) {
                case 'stack': this.generateStack(arContent, data); break;
                // Add other cases back if needed, focusing on Stack for now
                default: this.generateStack(arContent, data); break;
            }
        } catch (err) {
            alert("Error: " + err.message);
            return;
        }

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
            // Standard AR Icon
            const img = document.createElement('img');
            img.src = 'https://upload.wikimedia.org/wikipedia/commons/4/48/Ar_icon.png';
            link.appendChild(img);
            link.click();
        } catch (error) {
            alert("Export failed: " + error.message);
        }
    }

    // =========================================================================
    //  INTERACTIVE WEBXR SESSION
    // =========================================================================

    async startInteractiveSession(structureType, data) {
        this.structureType = structureType;
        this.currentData = data && data.length ? [...data] : [10, 20, 30];

        console.log("Starting WebXR Session...");

        // Init Scene
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        light.position.set(0.5, 1, 0.25);
        this.scene.add(light);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.xr.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        // AR Button
        const arButton = ARButton.createButton(this.renderer, { requiredFeatures: ['hit-test'] });
        document.body.appendChild(arButton);

        // Controller (Raycaster)
        this.controller = this.renderer.xr.getController(0);
        this.controller.addEventListener('select', this.onSelect.bind(this));
        this.scene.add(this.controller);

        // Reticle
        this.reticle = new THREE.Mesh(
            new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 }) // Green Ring
        );
        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;
        this.scene.add(this.reticle);

        // Main Content Group
        this.placedGroup = new THREE.Group();
        this.scene.add(this.placedGroup);
        this.isPlaced = false;

        // Start Loop
        this.renderer.setAnimationLoop(this.render.bind(this));
    }

    onSelect() {
        if (this.reticle.visible && !this.isPlaced) {
            // PLACE OBJECT
            this.reticle.matrix.decompose(this.placedGroup.position, this.placedGroup.quaternion, this.placedGroup.scale);
            this.isPlaced = true;
            this.reticle.visible = false;

            // Generate visual
            this.rebuildInteractiveStack();
            this.spawnUI();
        } else if (this.isPlaced) {
            // UI CLICK DETECTION
            // Setup raycaster from controller position
            const tempMatrix = new THREE.Matrix4();
            tempMatrix.identity().extractRotation(this.controller.matrixWorld);

            this.raycaster.ray.origin.setFromMatrixPosition(this.controller.matrixWorld);
            this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

            const intersects = this.raycaster.intersectObjects(this.uiButtons.map(b => b.mesh));

            if (intersects.length > 0) {
                const clickedObj = intersects[0].object;
                const button = this.uiButtons.find(b => b.mesh === clickedObj);
                if (button) {
                    button.action();
                    // Feedback
                    clickedObj.material.color.setHex(0xffff00); // Flash yellow
                    setTimeout(() => clickedObj.material.color.setHex(button.color), 200);
                }
            }
        }
    }

    rebuildInteractiveStack() {
        // Clear children except logic objects
        // easier to just clear group and rebuild
        this.placedGroup.clear();

        // Add Base
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.3), new THREE.MeshStandardMaterial({ color: 0x333333 }));
        this.placedGroup.add(base);

        this.generateStack(this.placedGroup, this.currentData);
        // Re-add UI if needed, or keep UI separate? Better separate.
    }

    spawnUI() {
        // Create 3D Buttons floating above/near stack
        const uiGroup = new THREE.Group();
        uiGroup.position.set(0, 0.5, -0.4); // Behind/Above
        this.placedGroup.add(uiGroup);

        // Push Button
        this.createButton(uiGroup, "PUSH", 0x2196F3, -0.15, () => {
            const val = Math.floor(Math.random() * 99);
            this.currentData.push(val);
            this.rebuildInteractiveStack();
        });

        // Pop Button
        this.createButton(uiGroup, "POP", 0xF44336, 0.15, () => {
            if (this.currentData.length > 0) this.currentData.pop();
            this.rebuildInteractiveStack();
        });
    }

    createButton(parent, text, color, xPos, callback) {
        const geometry = new THREE.BoxGeometry(0.12, 0.08, 0.05);
        const material = new THREE.MeshStandardMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(xPos, 0, 0);

        // Label
        const label = this.createLabelTexture(text);
        const labelGeo = new THREE.PlaneGeometry(0.1, 0.05);
        const labelMat = new THREE.MeshBasicMaterial({ map: label, transparent: true });
        const labelMesh = new THREE.Mesh(labelGeo, labelMat);
        labelMesh.position.set(0, 0, 0.03); // slightly in front
        mesh.add(labelMesh);

        parent.add(mesh);

        this.uiButtons.push({ mesh, action: callback, color: color });
    }

    render(timestamp, frame) {
        if (frame) {
            const referenceSpace = this.renderer.xr.getReferenceSpace();
            const session = this.renderer.xr.getSession();

            if (!this.hitTestSourceRequested) {
                session.requestReferenceSpace('viewer').then((referenceSpace) => {
                    session.requestHitTestSource({ space: referenceSpace }).then((source) => {
                        this.hitTestSource = source;
                    });
                });
                session.addEventListener('end', () => {
                    this.hitTestSourceRequested = false;
                    this.hitTestSource = null;
                    // remove canvas/etc setup manually if needed
                });
                this.hitTestSourceRequested = true;
            }

            if (this.hitTestSource && !this.isPlaced) {
                const hitTestResults = frame.getHitTestResults(this.hitTestSource);
                if (hitTestResults.length > 0) {
                    const hit = hitTestResults[0];
                    this.reticle.visible = true;
                    this.reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
                } else {
                    this.reticle.visible = false;
                }
            }
        }
        this.renderer.render(this.scene, this.camera);
    }

    // --- UTILS ---
    createLabelTexture(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 128; // Rect
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, 256, 128);
        ctx.fillStyle = '#000000'; ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 64);
        return new THREE.CanvasTexture(canvas);
    }

    generateStack(group, items) {
        const boxSize = 0.1;
        const gap = 0.01;
        items.forEach((val, index) => {
            const material = new THREE.MeshStandardMaterial({
                color: 0x4CAF50,
                roughness: 0.2,
                map: this.createLabelTexture(val.toString()),
                transparent: true, opacity: 0.95
            });
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(boxSize, boxSize, boxSize), material);
            mesh.position.y = (boxSize + gap) * index + (boxSize / 2) + 0.05; // 0.05 is base height
            group.add(mesh);
        });

        // Stats
        this.createInfoPanel(group, `Top: ${items[items.length - 1] || 'None'} | Size: ${items.length}`);
    }

    createInfoPanel(group, text) {
        const tex = this.createLabelTexture(text);
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.3, 0.15),
            new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true })
        );
        mesh.position.set(0, 0.1, -0.3); // Behind stack
        group.add(mesh);
    }
}
