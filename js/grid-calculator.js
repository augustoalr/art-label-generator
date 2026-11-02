(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.GridCalculator = factory();
    }
})(typeof self !== 'undefined' ? self : this, function() {
    return {
        PX_PER_CM: 37.79,
        cmToMm: (cm) => cm * 10,
        cmToPx: (cm) => cm * 37.79,
        calculatePageGrid: (pageW_mm, pageH_mm, labelW_mm, labelH_mm, pageMargin_mm = 10) => {
            const maxCols = Math.floor((pageW_mm - (pageMargin_mm * 2)) / labelW_mm);
            const maxRows = Math.floor((pageH_mm - (pageMargin_mm * 2)) / labelH_mm);
            const itemsPerPage = Math.max(0, maxCols * maxRows);
            const gridW = maxCols > 0 ? maxCols * labelW_mm : 0;
            const gridH = maxRows > 0 ? maxRows * labelH_mm : 0;
            const marginX = (pageW_mm - gridW) / 2;
            const marginY = (pageH_mm - gridH) / 2;
            return {
                maxCols,
                maxRows,
                itemsPerPage,
                gridW,
                gridH,
                marginX,
                marginY
            };
        }
    };
});
