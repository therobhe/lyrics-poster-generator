/**
 * Calculates the positions and angles of letters in a spiral layout.
 * 
 * @param {string} lyrics - The lyrics text to layout
 * @param {Object} options - Configuration options
 * @param {number} options.svgSize - The size of the SVG container
 * @param {number} options.startRadius - The starting radius of the spiral
 * @returns {Array} Array of character objects with position and rotation data
 */
export function calculateSpiral(lyrics, options = {}) {
    if (!lyrics) return [];

    const {
        svgSize = 650,
        isPrint = false
    } = options;

    const letters = [];
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    const len = lyrics.length;

    // Fine-tuned start radius
    let startRadius = isPrint ? 90 : 85;
    if (len > 2200 && len <= 4500) {
        startRadius = isPrint ? 80 : 75;
    } else if (len > 4500) {
        startRadius = isPrint ? 70 : 95;
    }

    // Basic font size logic
    let fontSize;
    if (len < 300) {
        fontSize = 28;
    } else if (len < 600) {
        fontSize = 28 - ((len - 300) / 300) * (28 - 18);
    } else if (len < 1500) {
        fontSize = 18 - ((len - 600) / 900) * (18 - 12);
    } else {
        fontSize = Math.max(8, 12 - ((len - 1500) / 3000) * 4);
    }

    // Adjustments for ultra long lyrics
    if (len > 4500) {
        fontSize = isPrint ? 7 : 6;
    }

    // Slightly larger minimum for the "Jesus of Suburbia" range
    if (len > 2200 && len <= 4500) {
        fontSize = Math.max(9, fontSize);
    }

    // Allow even larger if very short
    if (len < 100) {
        fontSize = 34;
    }

    // Increase spacing between rows (pitch)
    let pitchMultiplier = 1.9;
    if (len < 600) pitchMultiplier = 2.4;

    // Fine-tuned scaling for Long vs Ultra-Long
    if (len > 2200 && len <= 4500) {
        pitchMultiplier = 1.55;
    } else if (len > 4500) {
        pitchMultiplier = 1.35;
    }

    const rotationGap = fontSize * pitchMultiplier;
    let currentAngle = 0;
    let currentRadius = startRadius;
    const charWidthFactor = 0.6;

    for (let i = 0; i < len; i++) {
        const char = lyrics[i];
        const charWidth = fontSize * charWidthFactor;
        const angleStep = charWidth / currentRadius;

        const x = centerX + currentRadius * Math.cos(currentAngle);
        const y = centerY + currentRadius * Math.sin(currentAngle);

        letters.push({
            char: char,
            x: x,
            y: y,
            angle: (currentAngle * 180 / Math.PI) + 90,
            fontSize: fontSize,
            letterSpacing: 0
        });

        currentAngle += angleStep;
        currentRadius += (rotationGap / (2 * Math.PI)) * angleStep;
    }

    return letters;
}
