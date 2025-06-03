export function createRoad(scene, THREE) {
    /**
     * createRoad(scene, THREE)
     * 
     * This function builds a complete urban intersection scene, including:
     * - Asphalt roads (horizontal and vertical)
     * - Sidewalks (all four directions)
     * - Road markings: solid and dashed lines, yellow lines
     * - Crosswalks
     * - Direction arrows with textures
     * - Street lights with realistic illumination
     * - Decorative trees around the junction
     * 
     * It adds all these elements directly to the provided THREE.js scene.
     */
    
        /** -------------------- PARAMETERS -------------------- */
        // Colors
        const asphaltColor = 0x666666;
        const sidewalkColor = 0xd9d9d9;
        const lineColor = 0xffffff;
        const centerLineColor = 0xffff00;
    
        // Dimensions
        const laneWidth = 3.5;
        const numLanesPerDirection = 2;
        const totalLanes = numLanesPerDirection * 2;
        const roadWidth = laneWidth * totalLanes;
        const sidewalkWidth = 1.3;
        const roadLength = 100;
        const crosswalkArea = 10;
    
        const pavementColor = 0xd8cab8;
    
        // Crosswalk stripes
        const stripeWidth = 0.7;
        const stripeLength = 1.6;
        const stripeThickness = 0.05;
        const stripeSpacing = 0.5;
        const numStripes = 6;
        const crosswalkY = 0.1;
    
        /** -------------------- BASE AREA -------------------- */
        const baseGeometry = new THREE.PlaneGeometry(500, 500);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: pavementColor,
            roughness: 0.8,
            metalness: 0.1
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.rotation.x = -Math.PI / 2;
        base.position.y = 0.03; 
        scene.add(base);
    
        /** -------------------- SIDEWALKS -------------------- */
        const sidewalkMaterial = new THREE.MeshStandardMaterial({ color: sidewalkColor });
        const sidewalkLength = (roadLength - crosswalkArea * 2) / 2 + 3;
    
        // East-West sidewalks
        [1, -1].forEach(direction => {
            const sw1 = new THREE.Mesh(new THREE.BoxGeometry(sidewalkLength, 0.4, sidewalkWidth), sidewalkMaterial);
            sw1.position.set(-roadLength / 2 + sidewalkLength / 2, 0.2, direction * (roadWidth / 2 + sidewalkWidth / 2));
            scene.add(sw1);
    
            const sw2 = new THREE.Mesh(new THREE.BoxGeometry(sidewalkLength, 0.4, sidewalkWidth), sidewalkMaterial);
            sw2.position.set(roadLength / 2 - sidewalkLength / 2, 0.2, direction * (roadWidth / 2 + sidewalkWidth / 2));
            scene.add(sw2);
        });
    
        // North-South sidewalks
        [1, -1].forEach(direction => {
            const sw3 = new THREE.Mesh(new THREE.BoxGeometry(sidewalkWidth, 0.4, sidewalkLength), sidewalkMaterial);
            sw3.position.set(direction * (roadWidth / 2 + sidewalkWidth / 2), 0.2, -roadLength / 2 + sidewalkLength / 2);
            scene.add(sw3);
    
            const sw4 = new THREE.Mesh(new THREE.BoxGeometry(sidewalkWidth, 0.4, sidewalkLength), sidewalkMaterial);
            sw4.position.set(direction * (roadWidth / 2 + sidewalkWidth / 2), 0.2, roadLength / 2 - sidewalkLength / 2);
            scene.add(sw4);
        });
    
        /** -------------------- ROADS -------------------- */
        const asphaltMaterial = new THREE.MeshStandardMaterial({ color: asphaltColor });
        const roadH = new THREE.Mesh(new THREE.BoxGeometry(roadLength, 0.1, roadWidth), asphaltMaterial);
        const roadV = new THREE.Mesh(new THREE.BoxGeometry(roadWidth, 0.1, roadLength), asphaltMaterial);
        roadH.position.set(0, 0.05, 0);
        roadV.position.set(0, 0.05, 0);
        scene.add(roadH);
        scene.add(roadV);
    
        /** -------------------- LANE MARKINGS -------------------- */
        const dashedLineMaterial = new THREE.LineDashedMaterial({
            color: lineColor,
            dashSize: 1,
            gapSize: 1
        });
        const solidLineMaterial = new THREE.LineBasicMaterial({ color: centerLineColor });
    
        // Functions for lines
        function createSolidLine(start, end, material) {
            const points = [start, end];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            scene.add(line);
        }
        function createDashedLine(start, end, material) {
            const points = [start, end];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            line.computeLineDistances();
            scene.add(line);
        }
    
        // Solid lines
        createSolidLine(new THREE.Vector3(-roadLength / 2, 0.01, 0), new THREE.Vector3(-crosswalkArea, 0.01, 0), solidLineMaterial);
        createSolidLine(new THREE.Vector3(crosswalkArea, 0.01, 0), new THREE.Vector3(roadLength / 2, 0.01, 0), solidLineMaterial);
        createSolidLine(new THREE.Vector3(0, 0.01, -roadLength / 2), new THREE.Vector3(0, 0.01, -crosswalkArea), solidLineMaterial);
        createSolidLine(new THREE.Vector3(0, 0.01, crosswalkArea), new THREE.Vector3(0, 0.01, roadLength / 2), solidLineMaterial);
    
        // Dashed lines
        const centerOffset = laneWidth / 2;
        const laneOffsets = [centerOffset + laneWidth, -(centerOffset + laneWidth)];
        laneOffsets.forEach(offset => {
            createDashedLine(new THREE.Vector3(-roadLength / 2, 0.12, offset), new THREE.Vector3(-crosswalkArea, 0.12, offset), dashedLineMaterial);
            createDashedLine(new THREE.Vector3(crosswalkArea, 0.12, offset), new THREE.Vector3(roadLength / 2, 0.12, offset), dashedLineMaterial);
            createDashedLine(new THREE.Vector3(offset, 0.12, -roadLength / 2), new THREE.Vector3(offset, 0.12, -crosswalkArea), dashedLineMaterial);
            createDashedLine(new THREE.Vector3(offset, 0.12, crosswalkArea), new THREE.Vector3(offset, 0.12, roadLength / 2), dashedLineMaterial);
    
            /** -------------------- YELLOW CENTER LINES -------------------- */
            const yellowMat = new THREE.MeshStandardMaterial({ color: centerLineColor });
            const yellowLineY = 0.06;
            const lineThickness = 0.1;
            const lineWidth = 0.15;
            const lineLength = (roadLength - crosswalkArea) / 2;
    
            const southToNorth = new THREE.Mesh(new THREE.BoxGeometry(lineWidth, lineThickness, lineLength), yellowMat);
            southToNorth.position.set(0.2, yellowLineY, -lineLength / 2 - crosswalkArea / 2 - 4);
            scene.add(southToNorth);
    
            const northToSouth = new THREE.Mesh(new THREE.BoxGeometry(lineWidth, lineThickness, lineLength), yellowMat);
            northToSouth.position.set(0.2, yellowLineY, lineLength / 2 + crosswalkArea / 2 + 2);
            scene.add(northToSouth);
    
            const westToEast = new THREE.Mesh(new THREE.BoxGeometry(lineLength, lineThickness, lineWidth), yellowMat);
            westToEast.position.set(-lineLength / 2 - crosswalkArea / 2 - 4, yellowLineY, 0.2);
            scene.add(westToEast);
    
            const eastToWest = new THREE.Mesh(new THREE.BoxGeometry(lineLength, lineThickness, lineWidth), yellowMat);
            eastToWest.position.set(lineLength / 2 + crosswalkArea / 2 + 2, yellowLineY, -0.2);
            scene.add(eastToWest);
        });
    
        /** -------------------- CROSSWALKS -------------------- */
        const crosswalkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            polygonOffset: true,
            polygonOffsetFactor: -5,
            polygonOffsetUnits: -5
        });
    
        function createCrosswalk(start, isHorizontal) {
            for (let i = -Math.floor(numStripes / 2); i <= Math.floor(numStripes / 2); i++) {
                const geometry = isHorizontal
                    ? new THREE.BoxGeometry(stripeLength, stripeThickness, stripeWidth)
                    : new THREE.BoxGeometry(stripeWidth, stripeThickness, stripeLength);
    
                const stripe = new THREE.Mesh(geometry, crosswalkMaterial);
                if (isHorizontal) {
                    stripe.position.set(start.x + i * (stripeLength + stripeSpacing), crosswalkY, start.z);
                } else {
                    stripe.position.set(start.x, crosswalkY, start.z + i * (stripeLength + stripeSpacing));
                }
                stripe.rotation.y = Math.PI / 2;
                scene.add(stripe);
            }
        }
    
        createCrosswalk(new THREE.Vector3(-(roadWidth / 2 + sidewalkWidth / 3) + 9, 0, centerOffset + laneWidth / 2 + 4), true);
        createCrosswalk(new THREE.Vector3(-(roadWidth / 2 + sidewalkWidth / 3) + 8, 0, centerOffset + laneWidth / 2 - 10), true);
        createCrosswalk(new THREE.Vector3(-(roadWidth / 2 + sidewalkWidth / 3) + 1, 0, centerOffset + laneWidth / 2 - 2), false);
        createCrosswalk(new THREE.Vector3(-(roadWidth / 2 + sidewalkWidth / 3) + 14.5, 0, centerOffset + laneWidth / 2 - 2), false);
    
        /** -------------------- DIRECTION ARROWS -------------------- */
        function createArrow(x, z, rotation) {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
    
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.moveTo(64, 10);
            ctx.lineTo(100, 80);
            ctx.lineTo(75, 80);
            ctx.lineTo(75, 120);
            ctx.lineTo(53, 120);
            ctx.lineTo(53, 80);
            ctx.lineTo(28, 80);
            ctx.closePath();
            ctx.fill();
    
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
            const geometry = new THREE.PlaneGeometry(2, 2);
            const arrow = new THREE.Mesh(geometry, material);
    
            arrow.position.set(x, 0.12, z);
            arrow.rotation.x = Math.PI / 2;
            arrow.rotation.z = rotation;
            scene.add(arrow);
        }
    
        const arrowOffset = 2.0;
        createArrow(arrowOffset, -20, -Math.PI);
        createArrow(-arrowOffset, -20, 0);
        createArrow(arrowOffset, 20, Math.PI);
        createArrow(-arrowOffset, 20, 0);
        createArrow(-20, arrowOffset, -Math.PI / 2);
        createArrow(-20, -arrowOffset, Math.PI / 2);
        createArrow(20, arrowOffset, -Math.PI / 2);
        createArrow(20, -arrowOffset, Math.PI / 2);
    
        /** -------------------- STREET LIGHTS -------------------- */
        function createStreetLight(x, z) {
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 5, 16), new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 }));
            pole.position.set(x, 2.5, z);
            pole.castShadow = true;
            scene.add(pole);
    
            const cap = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffffe0, emissive: 0xffff99, emissiveIntensity: 1.5, metalness: 0.5, roughness: 0.3 }));
            cap.position.set(x, 5.3, z);
            cap.castShadow = true;
            scene.add(cap);
    
            const light = new THREE.PointLight(0xffdd88, 1.2, 30, 2);
            light.position.set(x, 5.5, z);
            light.castShadow = true;
            light.shadow.mapSize.width = 512;
            light.shadow.mapSize.height = 512;
            scene.add(light);
        }
    
        createStreetLight(8, 20);
        createStreetLight(-8, 20);
        createStreetLight(8, -20);
        createStreetLight(-8, -20);
    
        /** -------------------- DECORATIVE TREES -------------------- */
        function createTree(x, z) {
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 2, 12), new THREE.MeshStandardMaterial({ color: 0x8b5a2b }));
            trunk.position.set(x, 1, z);
    
            const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.8, metalness: 0.2 }));
            leaves.position.set(x, 2.4, z);
    
            scene.add(trunk);
            scene.add(leaves);
        }
    
        createTree(20, 14);
        createTree(-20, 14);
        createTree(20, -14);
        createTree(-20, -14);
    }
    