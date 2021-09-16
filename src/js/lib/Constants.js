export default {
    layers: [1, 2, 3, 4, 5, 6],  //слои размещения объектов в сцене. значение элемента массива означает координату по z
    splineSegments: 100,
    deltaOnPointerInteractive: 3,

    fontPaths: {
        main: './fonts/Roboto-Regular.ttf',
        awSolid: './fonts/fa-solid-900.ttf',
        awLight: './fa-light-300.ttf',
        awRegular: './fa-regular-400.ttf',
        awBrands: './fa-brands-400.ttf',
        awDuotone: './fa-duotone-900.ttf'
    },
    nodeMesh: {
        title: {
            fontSize: 10,
            fontColor: '#000000',
            fontSelectedColor: '#0a8ee5',
            leftMargin: 5
        },
        indicator: {
            fontSize: 10,
            fontColor: '#000000',
            rightMargin: 2
        },
        mount: {
            width: 80,
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
            footerLabelColor: '#ffffff',
            footerLabelHoverColor: '#0a8ee5'
        },
        port: {
            height: 16,
            connectorWidth: 8,
            connectorHeight: 8,
            connectorSelectedColor: '#00ff00',
            labelLeftMargin: 14,
            labelHoverColor: '#0a8ee5',
            fontSize: 10,
            connectorCornerRadius: 3,
            markWidth: 8,
            markHeight: 8,
            markCornerRadius: 2,
            markFontSize: 7,
            markLeftMargin: 3
        },
        line: {
            color: '#2a2a2a',
            selectedColor: '#00ff00'
        },
        portTypes: {
            float: {
                connectorColor: '#ee6f6f',
                labelColor: '#2a2a2a',
                fontColor: '#ffffff',
                markColor: '#ee6f6f'
            },
            int: {
                connectorColor: '#4483f5',
                labelColor: '#2a2a2a',
                fontColor: '#ffffff',
                markColor: '#4483f5'
            }
        }
    },
    scene: {
        backgroundColor: '#f0f2f5'
    },
    three: {
        maxZoom: 0.2,               //how near camera can zoom
        minZoom: 10,                //how far camera can zoom
        dampingFactor: 0.15,        //bigger than shorter inertia
        zoomSpeed: 0.002
    }
};