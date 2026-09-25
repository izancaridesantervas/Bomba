// Mod: Bomba rompe-barreras para Sandboxels
// Usa solo funciones confirmadas en la wiki oficial de modding:
// getPixel, isEmpty, tryDelete, changePixel, explodeAt

// Elementos considerados "barreras"
var BARRERAS = [
    "wall", "steel", "concrete", "brick", "glass", "iron",
    "tungsten", "titanium", "diamond", "obsidian", "plastic",
    "copper", "aluminum", "bronze", "brass", "nickel", "rock_wall"
];

function esBarrera(p) {
    if (!p) return false;
    return BARRERAS.indexOf(p.element) !== -1;
}

// Destruye barreras en un radio y lanza una explosión normal para el resto
function detonarRompeBarreras(cx, cy, radio) {
    for (var dx = -radio; dx <= radio; dx++) {
        for (var dy = -radio; dy <= radio; dy++) {
            if (dx * dx + dy * dy > radio * radio) continue;
            var x = cx + dx;
            var y = cy + dy;
            var p = getPixel(x, y);
            if (esBarrera(p)) {
                if (Math.random() < 0.35 && elements.rubble) {
                    changePixel(p, "rubble");
                } else {
                    tryDelete(x, y);
                }
            }
        }
    }
    explodeAt(cx, cy, radio);
}

function crearBomba(radio) {
    var nombreExplosion = "explode_barrier_" + radio;
    return {
        color: radio > 15 ? ["#ff3b1f", "#ffb400"] : ["#d62828", "#8d0801"],
        behavior: behaviors.POWDER,
        category: "weapons",
        state: "solid",
        density: 2500,
        tempHigh: 300,
        stateHigh: nombreExplosion,
        tick: function (pixel) {
            if (!isEmpty(pixel.x, pixel.y + 1)) {
                var debajo = getPixel(pixel.x, pixel.y + 1);
                if (!debajo || debajo.element !== pixel.element) {
                    detonarRompeBarreras(pixel.x, pixel.y, radio);
                    tryDelete(pixel.x, pixel.y);
                }
            }
        },
        desc: "Cae y explota al impactar contra algo s\u00f3lido, o si se calienta demasiado. Destruye paredes, acero y otras barreras. Radio: " + radio
    };
}

elements.bomba_rompebarreras = crearBomba(12);
elements.mega_bomba_rompebarreras = crearBomba(25);

// Elementos ocultos que detonan la explosión cuando la bomba se calienta demasiado
elements.explode_barrier_12 = {
    color: "#ff7700",
    behavior: behaviors.WALL,
    category: "special",
    hidden: true,
    tick: function (pixel) {
        detonarRompeBarreras(pixel.x, pixel.y, 12);
        tryDelete(pixel.x, pixel.y);
    }
};
elements.explode_barrier_25 = {
    color: "#ff7700",
    behavior: behaviors.WALL,
    category: "special",
    hidden: true,
    tick: function (pixel) {
        detonarRompeBarreras(pixel.x, pixel.y, 25);
        tryDelete(pixel.x, pixel.y);
    }
};
