/**
 * Check if fruits exceed danger line with column coverage
 * @param {Map} bodies - Bodies map
 * @param {number} dangerLineY - Y position of danger line
 * @param {number} containerWidth - Width of container
 * @param {number} numColumns - Number of columns to check
 * @returns {Object} Danger info {dangerFruits, occupiedColumns}
 */
export function checkDangerLine(bodies, dangerLineY, containerWidth, numColumns) {
    const dangerFruits = [];
    const occupiedColumns = new Set();
    
    const halfW = containerWidth * 0.5;
    const columnWidth = containerWidth / numColumns;
    
    for (const [id, b] of bodies) {
        const t = b.rb.translation();
        
        // Check if fruit's top edge exceeds danger line
        const fruitTopY = t.y + b.radius;
        if (fruitTopY > dangerLineY) {
            dangerFruits.push({ id, y: fruitTopY, x: t.x });
            
            // Determine which column this fruit is in
            const normalizedX = t.x + halfW; // Now 0 to containerWidth
            const columnIndex = Math.floor(normalizedX / columnWidth);
            const clampedColumn = Math.max(0, Math.min(numColumns - 1, columnIndex));
            occupiedColumns.add(clampedColumn);
        }
    }
    
    return {
        dangerFruits,
        occupiedColumns: Array.from(occupiedColumns)
    };
}

