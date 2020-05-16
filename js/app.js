var app = new Vue({
	el: '#app',
	data: {
		width: 200,
		height: 200,
		depth: 200,
		message: "Testing Vue",
		stonetype: "Marble",
		redlight: false,
		greenlight: false,
		bluelight: false,
		markings: [
			// { face: "front", x: 10, y: 20, id: 0 }
		]
	},
	created: function () {
		// `this` points to the vm instance
		document.addEventListener("addMarking", this.onAddMarking, false);

	},
	updated: function () {
		// `this` points to the vm instance
	},
	mounted: function () {
		// `this` points to the vm instance
	},
	destroyed: function () {
		// `this` points to the vm instance
	},
	computed: {
		// a computed getter
		reversedMessage: function () {
			// `this` points to the vm instance
			return this.message.split('').reverse().join('')
		}
	},
	methods: {
		onAddMarking: function (e) {
			console.log(e.detail);
			this.markings.push(e.detail);
		},
		reverseMessage: function () {
			this.message = this.message.split('').reverse().join('')
		},
		updateDimensions: function () {
			this.width = Math.max(Math.min(this.width, 500), 1);
			this.height = Math.max(Math.min(this.height, 500), 1);
			this.depth = Math.max(Math.min(this.depth, 500), 1);
			this.sendEvent();
		},
		updateType: function () {
			this.sendEvent();
		},
		updateLights: function () {
			this.sendEvent();
		},
		deleteMarking: function (marking) {
			var detail =
			{
				id: marking.id
			};

			var event = new CustomEvent("deleteMarking", {
				detail: detail,
				bubbles: false,
				cancelable: false
			});

			document.dispatchEvent(event);
		},
		sendEvent: function () {
			var detail =
			{
				red: this.redlight,
				green: this.greenlight,
				blue: this.bluelight,
				width: this.width,
				height: this.height,
				depth: this.depth,
				type: this.stonetype
			};

			var event = new CustomEvent("updateScene", {
				detail: detail,
				bubbles: false,
				cancelable: false
			});

			document.dispatchEvent(event);
		}
	}
})
