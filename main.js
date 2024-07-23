require([
    "esri/Map",
    "esri/views/MapView",
    "esri/Graphic",
    "esri/layers/GraphicsLayer"
], function(Map, MapView, Graphic, GraphicsLayer) {
    var map = new Map({
        basemap: "streets-navigation-vector"
    });

    var view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-122.33425800221698, 47.636252144942864],
        zoom: 11
    });

    var graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    function updateCounter() {
        var count = 0;
        graphicsLayer.graphics.items.forEach(function(graphic) {
            if (view.extent.contains(graphic.geometry)) {
                count++;
            }
        });
        document.getElementById('counterValue').textContent = count;
    }

    function addPlantsToLayer(plants) {
        graphicsLayer.removeAll();
        plants.forEach(function(plant) {
            var point = {
                type: "point",
                longitude: plant.lng,
                latitude: plant.lat
            };

            var symbol = {
                type: "picture-marker",
                url: 'assets/imgs/tulip.png',
                width: "36px",
                height: "36px"
            };

            var popupContent = document.createElement("div");
            popupContent.className = "popup-content";

            var imgElement = document.createElement("img");
            imgElement.src = plant.img;
            imgElement.className = "popup-img";
            imgElement.style.width = "50%";
            imgElement.style.height = "auto";
            popupContent.appendChild(imgElement);

            var dateElement = document.createElement("div");
            dateElement.textContent = "Photo taken: " + plant.date;
            popupContent.appendChild(dateElement);
            popupContent.innerHTML += "<br>";

            var descElement = document.createElement("div");
            descElement.textContent = plant.desc;
            popupContent.appendChild(descElement);

            var popupTemplate = {
                title: plant.name,
                content: popupContent
            };

            var graphic = new Graphic({
                geometry: point,
                symbol: symbol,
                popupTemplate: popupTemplate
            });
            graphicsLayer.add(graphic);
        });
        updateCounter(); // Update counter after adding plants
    }

    // Fetch plant data from JSON file
    fetch('assets/plants.json')
        .then(response => response.json())
        .then(data => {
            addPlantsToLayer(data);

            // Filter functionality
            document.getElementById("colorFilter").addEventListener("change", function(event) {
                var selectedColor = event.target.value;
                var filteredPlants = data.filter(function(plant) {
                    return selectedColor === "all" || plant.color === selectedColor;
                });
                addPlantsToLayer(filteredPlants);
            });

            // Search functionality
            document.getElementById('searchInput').addEventListener('input', function() {
                var filter = this.value.toLowerCase();
                var graphics = graphicsLayer.graphics.items;

                graphics.forEach(function(graphic) {
                    var plantName = graphic.popupTemplate.title.toLowerCase();
                    graphic.visible = plantName.includes(filter);
                });
                updateCounter(); // Update counter after search
            });
        })
        .catch(error => console.error('Error loading plant data:', error));

    // Update counter when map view extent changes
    view.watch('extent', function() {
        updateCounter();
    });
});
