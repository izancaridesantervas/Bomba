// Mod: Bomba rompe-barreras para Sandboxels
// Añade dos bombas que destruyen paredes, acero, hormigón, etc.

// Elementos considerados "barreras"
const BARRERAS = [
    "wall", "steel", "concrete", "brick", "glass", "iron",
    "tungsten", "titanium", "diamond", "obsidian", "rock_wall",
    "plastic", "copper", "aluminum", "bronze", "brass", "nickel"
];

function esBarrera(pixel) {
    if (!pixel) return false;
    const info = elements[pixel.element];
    if (!info) return false;
    return BARRERAS.includes(pixel.element) || (info.hardness && info.hardness >= 0.8);
}

// Destruye todo dentro de un radio; las barreras dejan escombros
function detonarRompeBarreras(cx, cy, radio) {
    for (let dx = -radio; dx <= radio; dx++) {
        for (let dy = -radio; dy <= radio; dy++) {
            if (dx * dx + dy * dy > radio * radio) continue;
            const x = cx + dx;
            const y = cy + dy;
            if (outOfBounds(x, y)) continue;
            const p = pixelMap[x] && pixelMap[x][y];
            if (!p) continue;

            if (esBarrera(p)) {
                if (Math.random() < 0.35 && elements.rubble) {
                    changePixel(p, "rubble");
                } else {
                    deletePixel(x, y);
                }
            }
        }
    }
    // Explosión normal para el resto de materiales, fuego y humo
    explodeAt(cx, cy, radio);
}

function crearBomba(radio) {
    return {
        color: radio > 15 ? ["#ff3b1f", "#ffb400"] : ["#d62828", "#8d0801"],
        behavior: behaviors.POWDER,
        category: "weapons",
        state: "solid",
        density: 2500,
        hardness: 0.3,
        tempHigh: 300,
        stateHigh: "explode_barrier_" + radio,
        tick: function (pixel) {
            const debajo = outOfBounds(pixel.x, pixel.y + 1)
                ? null
                : pixelMap[pixel.x][pixel.y + 1];
            const tocaSuelo = outOfBounds(pixel.x, pixel.y + 1) || (debajo && debajo.element !== pixel.element);

            // Detona al impactar contra algo sólido
            if (tocaSuelo) {
                const info = debajo ? elements[debajo.element] : null;
                if (!info || info.state === "solid") {
                    detonarRompeBarreras(pixel.x, pixel.y, radio);
                    deletePixel(pixel.x, pixel.y);
                }
            }
        },
        onExplosionBreakOrSelf: function (pixel) {
            detonarRompeBarreras(pixel.x, pixel.y, radio);
        },
        desc: "Cae y explota al impactar. Destruye paredes, acero y otras barreras. Radio: " + radio
    };
}

elements.bomba_rompebarreras = crearBomba(12);
elements.mega_bomba_rompebarreras = crearBomba(25);

// Al calentarse demasiado, también detonan
elements.explode_barrier_12 = {
    color: "#ff7700",
    behavior: behaviors.WALL,
    category: "special",
    hidden: true,
    tick: function (pixel) {
        detonarRompeBarreras(pixel.x, pixel.y, 12);
        deletePixel(pixel.x, pixel.y);
    }
};
elements.explode_barrier_25 = {
    color: "#ff7700",
    behavior: behaviors.WALL,
    category: "special",
    hidden: true,
    tick: function (pixel) {
        detonarRompeBarreras(pixel.x, pixel.y, 25);
        deletePixel(pixel.x, pixel.y);
    }
};
