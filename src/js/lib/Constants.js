export default {
    layers: [1, 2, 3, 4, 5, 6],  //слои размещения объектов в сцене. значение элемента массива означает координату по z
    splineSegments: 100,
    nodeMesh: {
        title: {
            fontSize: 12,
            fontColor: '#0a8ee5',
            leftMargin: 5
        },
        mount: {
            width: 80,
            height: 200,
            headerHeight: 20,
            frontHeadColor: '#0a8ee5',
            frontBodyColor: '#fff',
            backMountColor: '#888888',
            backMountSelectedColor: '#0a8ee5',
            borderSize: 2,
            roundCornerRadius: 5,
            headerLabelFontSize: 14,
            footerHeight: 10,
            footerLabelFontSize: 12,
            footerColor: '#d0d0d0',
            footerLabelColor: '#ffffff'
        },
        port: {
            height: 16,
            connectorWidth: 8,
            connectorHeight: 8,
            labelLeftMargin: 14,
            fontSize: 10,
            connectorCornerRadius: 3,
            markWidth: 8,
            markHeight: 8,
            markCornerRadius: 2,
            markFontSize: 7,
            markLeftMargin: 3
        },
        portTypes: {
            float: {
                connectorColor: '#ee6f6f',
                labelColor: '#2a2a2a',
                fontColor: '#ffffff'
            },
            int: {
                connectorColor: '#4483f5',
                labelColor: '#2a2a2a',
                fontColor: '#ffffff'
            }
        }
    }
};