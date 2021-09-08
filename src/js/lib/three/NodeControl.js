import * as THREE from 'three';

export class NodeControl{
    constructor() {
        this.const = {
            mountWidth: 100,
            mountHeight: 200,
            mountHeaderHeight: 40,
            portHeight: 20,
            mountFooterHeight: 20,
            roundCornerRadius: 5,
            borderSize: 2,
            roundCornerLissage: 20,
            connectorWidth: 15,
            connectorHeight: 15,
            layers: [0, 1, 2, 3, 4, 5],
            backMountColor: '#2a2a2a',
            frontMountHeadColor: '#00a2d2',
            frontMountBodyColor: '#fff'
        }
        this.nodeData = [];
        this.nodeObjects = [];
    }

    setData(nodeData){
        //TODO need convert to NodeControl format
        this.nodeData = nodeData;
    }

    buildNodes (){
        for(let i = 0; i < this.nodeData.length; i += 1){
            const node = this.createNode(this.nodeData[i]);
            this.nodeObjects.push(node);
        }
    }

    getNodes (){
        return this.nodeObjects;
    }

    createNode (data){
        const nodeShieldHeight = this.calcNodeShieldHeight(data.inputs.length + data.outputs.length);

        const nodeObject = new THREE.Object3D();
        clog(nodeObject);
        nodeObject.matrixWorld.makeTranslation( 0, 1000, 0 );
        nodeObject.updateWorldMatrix();
        nodeObject.updateMatrix();
        nodeObject.name = 'node';
        nodeObject.userData.data = data;

        //create shield
        const shieldObject = new THREE.Object3D();
        const backMount = this.getBackMount(nodeShieldHeight);
        shieldObject.add(backMount);
        const frontMount = this.getFrontMount(nodeShieldHeight);
        shieldObject.add(frontMount);
        nodeObject.add(shieldObject);




        //header

        //ports
        this.addInputPortsToNode(nodeObject, data.inputs);

        //footer




        nodeObject.position.set(data.position.x, data.position.y, this.const.layers[0]);

        //TODO set for all childrens userData.superParent;

        return nodeObject;
    }

    calcNodeShieldHeight(portsCount) {
        const portsHeight = portsCount * this.const.portHeight;
        return this.const.roundCornerRadius + this.const.mountHeaderHeight + portsHeight + this.const.mountFooterHeight;
    }

    getBackMount (height) {
        const mount = this.getNewBackMountMesh({
            w: this.const.mountWidth,
            h: height,
            color: this.const.backMountColor
        });
        mount.name = 'backMount';
        mount.visible = true;

        return mount;
    }

    getNewBackMountMesh(settings){
        //w - width, h - height, color - color
        const h = settings.h;
        const w = settings.w;
        const color = settings.color;
        const radius = this.const.roundCornerRadius;
        const lissage = this.const.roundCornerLissage;

        const shape = new THREE.Shape();

        shape.moveTo(radius, 0);
        shape.lineTo(w - radius, 0);
        shape.quadraticCurveTo(w - radius/lissage, -radius/lissage , w, -radius);
        shape.lineTo(w, -h + radius);
        shape.quadraticCurveTo(w - radius/lissage, -h + radius/lissage, w-radius, -h);
        shape.lineTo(radius, -h);
        shape.quadraticCurveTo(radius/lissage, -h + radius/lissage, 0, -h+radius);
        shape.lineTo(0, -radius);
        shape.quadraticCurveTo(radius/lissage, -radius/lissage, radius, 0);
        shape.closePath();

        const geometry = new THREE.ShapeGeometry( shape );
        const material = new THREE.MeshBasicMaterial({color: color ? color : 'red'});
        const mesh = new THREE.Mesh( geometry, material);

        return mesh;
    }

    getFrontMount (height) {
        const mount = this.getNewFrontMountMesh({
            w: this.const.mountWidth - this.const.borderSize,
            h: height - this.const.borderSize,
            headColor: this.const.frontMountHeadColor,
            bodyColor: this.const.frontMountBodyColor
        });
        mount.name = 'frontMount';
        mount.position.set(this.const.borderSize / 2, -this.const.borderSize / 2, this.const.layers[1]);

        return mount;
    }

    getNewFrontMountMesh(settings){
        //w - width, h - height, headColor - color, bodyColor - color
        const h = settings.h;
        const w = settings.w;
        const headColor = settings.headColor;
        const bodyColor = settings.bodyColor;
        const radius = this.const.roundCornerRadius;
        const lissage = this.const.roundCornerLissage;

        const frontMountObject = new THREE.Object3D();
        //head
        const headShape = new THREE.Shape();
        headShape.moveTo(radius, 0);
        headShape.lineTo(w - radius, 0);
        headShape.quadraticCurveTo(w - radius/lissage, -radius/lissage , w, -radius);
        headShape.lineTo(0, -radius);
        headShape.quadraticCurveTo(radius/lissage, -radius/lissage, radius, 0);
        headShape.closePath();

        const headMesh = new THREE.Mesh(
            new THREE.ShapeGeometry( headShape ),
            new THREE.MeshBasicMaterial({color: headColor ? headColor : 'red'})
        );
        headMesh.name = 'headFrontMount';
        frontMountObject.add(headMesh);

        //body
        const bodyShape = new THREE.Shape();
        bodyShape.moveTo(0, -radius);
        bodyShape.lineTo(w , -radius);
        bodyShape.lineTo(w, -h + radius);
        bodyShape.quadraticCurveTo(w - radius/lissage, -h + radius/lissage, w-radius, -h);
        bodyShape.lineTo(radius, -h);
        bodyShape.quadraticCurveTo(radius/lissage, -h + radius/lissage, 0, -h+radius);
        bodyShape.closePath();

        const bodyMesh = new THREE.Mesh(
            new THREE.ShapeGeometry( bodyShape ),
            new THREE.MeshBasicMaterial({color: bodyColor ? bodyColor : 'red'})
        );
        bodyMesh.name = 'bodyFrontMount';
        frontMountObject.add(bodyMesh);

        return frontMountObject;
    }

    addInputPortsToNode (nodeObject, inputs){
        clog(inputs);

        let currentYPos = - this.const.roundCornerRadius - this.const.mountHeaderHeight - this.const.portHeight/2;
        for(let i = 0; i < inputs.length; i += 1) {

            const connector = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(this.const.connectorWidth, this.const.connectorHeight),
                new THREE.MeshBasicMaterial({color: 'red'})
            );
            connector.name = 'connector';
            connector.userData.data = inputs[i];
            connector.position.set(-this.const.connectorWidth/2, 0, 0);


            const label = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(this.const.mountWidth, this.const.connectorHeight),
                new THREE.MeshBasicMaterial({color: 'green'})
            );
            label.name = 'label';
            label.userData.data = inputs[i];
            label.position.set(this.const.mountWidth/2, 0, 0);

            const portObject = new THREE.Object3D();
            portObject.name = 'port';
            portObject.userData.data = inputs[i];
            portObject.add(connector);
            portObject.add(label);
            portObject.position.set(0, currentYPos, this.const.layers[3]);
            currentYPos -= this.const.portHeight;
            nodeObject.add(portObject);
        }
    }
}