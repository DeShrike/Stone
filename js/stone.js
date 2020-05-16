let textures;
let textureName;

let redLightOn = false;
let greenLightOn = false;
let blueLightOn = false;

let redLight;
let blueLight;
let greenLight;

let boxWidth = 2;
let boxHeight = 2;
let boxDepth = 2;

let canvaswidth = 640;
let canvasheight = 480;

let cameraAngleY = 0;

let cameraPosX = 0;
let cameraPosY = 150;
let cameraPosZ = 0;

let controls;

let eyeZ;

let delta = 0;

let scene;
let camera;
let renderer;
let canvas;
let raycaster;
let mouse;

let frontplane;
let backplane;
let leftplane;
let rightplane;
let topplane;
let bottomplane;

let indicator;
let indicatorFace; // the name of the face that the indicator is on
let markings = [];

let light1, light2, light3, light4;

function setup() {
	console.log("Setup");

	canvas = document.getElementById("myCanvas");
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, canvaswidth / canvasheight, 0.1, 1000);
	renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
	renderer.setClearColor("#4C4B4B");
	renderer.setSize(canvaswidth, canvasheight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;
	camera.position.z = 5;

	onCanvasResize();
	// console.log("Canvas", canvas, canvaswidth, canvasheight);

	eyeZ = canvasheight / 2 / Math.tan((30 * Math.PI) / 180); // The default distance the camera is away from the origin.
	console.log("eyeZ", eyeZ);

	document.addEventListener("updateScene", onUpdateScene, false);
	document.addEventListener("deleteMarking", onDeleteMarking, false);

	window.addEventListener("click", onMouseClick);
	window.addEventListener("mousemove", onMouseMove);
	window.addEventListener("resize", onCanvasResize);

	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	textures = {
		"Marble": new THREE.TextureLoader().load("textures/marble.jpg"),
		"Granite": new THREE.TextureLoader().load("textures/granite.jpg"),
		"Sandstone": new THREE.TextureLoader().load("textures/sandstone.jpg")
	};

	textureName = "Marble";
}

function onDeleteMarking(e) {
	console.log(e.detail);
}

function onMouseClick(event) {
	// console.log("onMouseClick");
	if (indicator.visible) {
		const x = indicator.position.x;
		const y = indicator.position.y;
		const z = indicator.position.z;

		mx = 0.0;
		my = 0.0;

		switch (indicatorFace) {
			case "Front":
				mx = x + boxWidth / 2.0;
				my = y + boxHeight / 2.0;
				break;
			case "Right":
				mx = z + boxDepth / 2.0;
				my = y + boxHeight / 2.0;
				break;
			case "Left":
				mx = z + boxDepth / 2.0;
				my = y + boxHeight / 2.0;
				break;
			case "Top":
				mx = x + boxWidth / 2.0;
				my = boxDepth - (z + boxDepth / 2.0);
				break;
			case "Back":
				mx = boxWidth - (x + boxWidth / 2.0);
				my = y + boxHeight / 2.0;
				break;
			case "Bottom":
				mx = x + boxWidth / 2.0;
				my = z + boxDepth / 2.0;
				break;
		}

		mx *= 100.0;
		my *= 100.0;

		mx = Math.round(mx * 10, 2) / 10.0;
		my = Math.round(my * 10, 2) / 10.0;

		const marking = {
			visible: true,
			face: indicatorFace,
			x: mx,
			y: my,
			id: markings.length,
			wx: x,
			wy: y,
			wz: z
		};

		markings.push(marking);
		addMarking(marking);
		addMarkingObject(marking);
	}
}

function onMouseMove(event) {
	const mouseX = event.clientX - canvas.getBoundingClientRect().x;
	const mouseY = event.clientY - canvas.getBoundingClientRect().y;

	// console.log("Mouse: ", event.clientX, event.clientY, mouseX, mouseY);

	event.preventDefault();
	mouse.x = (mouseX / canvaswidth) * 2 - 1;
	mouse.y = -(mouseY / canvasheight) * 2 + 1;

	checkIntersects();
}

function addMarking(marking) {
	var detail =
	{
		face: marking.face,
		x: marking.x,
		y: marking.y,
		id: marking.id
	};

	var event = new CustomEvent("addMarking", {
		detail: detail,
		bubbles: false,
		cancelable: false
	});

	document.dispatchEvent(event);
}

function checkIntersects() {
	raycaster.setFromCamera(mouse, camera);

	indicator.visible = false;
	let intersects = raycaster.intersectObjects(scene.children, true);
	for (let i = 0; i < intersects.length; i++) {
		let intersect = intersects[i];
		let objectName = intersect.object.name;
		if (objectName === "Left" || objectName === "Right" || objectName === "Front" || objectName === "Back" || objectName === "Top" || objectName === "Bottom") {
			indicator.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
			indicator.visible = true;
			indicatorFace = objectName;
			break;
		}
	}
}

function onCanvasResize() {
	canvaswidth = canvas.offsetWidth;
	canvasheight = canvas.offsetHeight;

	canvaswidth = canvas.getBoundingClientRect().width;
	canvasheight = canvas.getBoundingClientRect().height;

	console.log("Resizing", canvaswidth, canvasheight, canvas.getBoundingClientRect());

	renderer.setSize(canvaswidth, canvasheight);
	camera.aspect = canvaswidth / canvasheight;
	camera.updateProjectionMatrix();
}

function onUpdateScene(e) {
	console.log("onUpdateScene");
	boxDepth = e.detail.depth / 100;
	boxHeight = e.detail.height / 100;
	boxWidth = e.detail.width / 100;

	redLightOn = e.detail.red;
	greenLightOn = e.detail.green;
	blueLightOn = e.detail.blue;

	redLight.visible = redLightOn;
	greenLight.visible = greenLightOn;
	blueLight.visible = blueLightOn;

	textureName = e.detail.type;

	controls.reset();
	buildStone();
}

function addMarkingObject(marking)
{
	let markingGeometry = new THREE.CubeGeometry(1, 1, 1);
	let markingMaterial = new THREE.MeshPhongMaterial({ color: 0x55AA11 });
	object = new THREE.Mesh(markingGeometry, markingMaterial);
	object.name = marking.id;
	object.castShadow = true;
	object.receiveShadow = false;
	object.scale.set(0.1, 0.1, 0.1);
	object.position.set(marking.wx, marking.wy, marking.wz);

	scene.add(object);
}

function build() {
	console.log("Build");

	let indicatorGeometry = new THREE.CubeGeometry(1, 1, 1);
	let indicatorMaterial = new THREE.MeshPhongMaterial({ color: 0xAA5511 });
	indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
	indicator.name = "Indicator";
	indicator.castShadow = true;
	indicator.receiveShadow = false;
	indicator.scale.set(0.1, 0.1, 0.1);
	indicator.position.set(0, 0, 0);

	scene.add(indicator);

	buildStone();

	let lightStrength = 0x444444;
	let lightHeight = 8;

	light1 = new THREE.PointLight(lightStrength, 1, 500);
	light1.position.set(-5, lightHeight, 5);
	light1.castShadow = true;
	light1.shadow.camera.near = 0.1;
	light1.shadow.camera.far = 25;
	scene.add(light1);

	light2 = new THREE.PointLight(lightStrength, 1, 500);
	light2.position.set(5, lightHeight, 5);
	light2.castShadow = false;
	light2.shadow.camera.near = 0.1;
	light2.shadow.camera.far = 25;
	scene.add(light2);

	light3 = new THREE.PointLight(lightStrength, 1, 500);
	light3.position.set(-5, lightHeight, -5);
	light3.castShadow = false;
	light3.shadow.camera.near = 0.1;
	light3.shadow.camera.far = 25;
	scene.add(light3);

	light4 = new THREE.PointLight(lightStrength, 1, 500);
	light4.position.set(5, lightHeight, -5);
	light4.castShadow = false;
	light4.shadow.camera.near = 0.1;
	light4.shadow.camera.far = 25;
	scene.add(light4);

	redLight = new THREE.PointLight(0xFF0000, 0.5, 500);
	redLight.name = "Red";
	redLight.position.set(-10, -1, 5);
	redLight.castShadow = true;
	redLight.shadow.camera.near = 0.1;
	redLight.shadow.camera.far = 25;
	redLight.visible = redLightOn;
	scene.add(redLight);

	greenLight = new THREE.PointLight(0x00FF00, 0.5, 500);
	greenLight.name = "Green";
	greenLight.position.set(0, 0, 5);
	greenLight.castShadow = true;
	greenLight.shadow.camera.near = 0.1;
	greenLight.shadow.camera.far = 25;
	greenLight.visible = greenLightOn;
	scene.add(greenLight);

	blueLight = new THREE.PointLight(0x0000FF, 0.5, 500);
	blueLight.name = "Blue";
	blueLight.position.set(10, 1, 5);
	blueLight.castShadow = true;
	blueLight.shadow.camera.near = 0.1;
	blueLight.shadow.camera.far = 25;
	blueLight.visible = blueLightOn;
	scene.add(blueLight);

	let ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.2);
	scene.add(ambientLight);

	// Floor
	let floorGeometry = new THREE.PlaneGeometry(20, 20, 20, 20);
	let floorMaterial = new THREE.MeshPhongMaterial({ color: 0xAAAAAA });
	let floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.rotation.x -= Math.PI / 2;
	floor.position.y -= 3;
	floor.receiveShadow = true;
	scene.add(floor);

	controls = new THREE.OrbitControls(camera, renderer.domElement);
	// controls.addEventListener("change", renderer);
	controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 0.05;

	controls.screenSpacePanning = false;
	controls.enableKeys = false;
	controls.enablePan = false;

	controls.minDistance = 3;
	controls.maxDistance = 10;

	// controls.minPolarAngle = -Math.PI / 2;
	controls.maxPolarAngle = Math.PI / 2;
}

function buildStone() {
	console.log("Building Stone");

	if (leftplane != null) {
		scene.remove(leftplane, rightplane, topplane, bottomplane, frontplane, backplane);
	}

	let geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
	let material = new THREE.MeshPhongMaterial({ map: textures[textureName], side: THREE.FrontSide });
	// material.opacity = 0.25;
	// material.transparent = true;

	leftplane = new THREE.Mesh(geometry, material);
	leftplane.name = "Left";
	leftplane.scale.set(boxDepth, boxHeight, 1);
	leftplane.position.x = -boxWidth / 2;
	leftplane.rotation.y = -(90 * Math.PI) / 180;
	leftplane.castShadow = true;
	scene.add(leftplane);

	rightplane = new THREE.Mesh(geometry, material);
	rightplane.name = "Right";
	rightplane.scale.set(boxDepth, boxHeight, 1);
	rightplane.position.x = boxWidth / 2;
	rightplane.rotation.y = (90 * Math.PI) / 180;
	rightplane.castShadow = true;
	scene.add(rightplane);

	backplane = new THREE.Mesh(geometry, material);
	backplane.name = "Back";
	backplane.scale.set(boxWidth, boxHeight, 1);
	backplane.position.z = -boxDepth / 2;
	backplane.rotation.x = (180 * Math.PI) / 180;
	backplane.castShadow = true;
	scene.add(backplane);

	frontplane = new THREE.Mesh(geometry, material);
	frontplane.name = "Front";
	frontplane.scale.set(boxWidth, boxHeight, 1);
	frontplane.position.z = boxDepth / 2;
	frontplane.rotation.x = (0 * Math.PI) / 180;
	frontplane.castShadow = true;
	scene.add(frontplane);

	bottomplane = new THREE.Mesh(geometry, material);
	bottomplane.name = "Bottom";
	bottomplane.scale.set(boxWidth, boxDepth, 1);
	bottomplane.position.y = -boxHeight / 2;
	bottomplane.rotation.x = (90 * Math.PI) / 180;
	bottomplane.castShadow = true;
	scene.add(bottomplane);

	topplane = new THREE.Mesh(geometry, material);
	topplane.name = "Top";
	topplane.scale.set(boxWidth, boxDepth, 1);
	topplane.position.y = boxHeight / 2;
	topplane.rotation.x = -(90 * Math.PI) / 180;
	topplane.castShadow = true;
	scene.add(topplane);
}

function update() {
	// cube.rotation.y += 0.01;
	// cube.rotation.z += 0.005;

	// delta += 0.1;
	// cube.material.uniforms.delta.value = 0.5 + Math.sin(delta) * 0.5;

	// var  time = Date.now() * 0.0005;
	// light.position.x = Math.sin(time * 0.7) * 30;
	// light.position.y = Math.cos(time * 0.5) * 30;
	// light.position.z = Math.cos(time * 0.3) * 30;

	// cube.position.x += Math.sin(time * 0.1) / 100;

	controls.update();
	// cameraAngleY += 0.01;
	// camera.position.x = Math.sin(cameraAngleY) * 5; // eyeZ;
	// camera.position.y = Math.sin(cameraAngleY) * 2;
	// camera.position.z = Math.cos(cameraAngleY) * 5; //eyeZ;
	// camera.lookAt(0, 0, 0);
}

function loop() {
	update();
	renderer.render(scene, camera);
	requestAnimationFrame(loop);
}

setup();
build();
loop();
