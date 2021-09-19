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
        constraints: {
            maxVisiblePorts: 4,

        },
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
        header: {
            height: 20,
            collapse: {
                fontSize: 9,
                fontColor: '#000000',
                leftMargin: 5,
                topMargin: 0
            },
            play: {
                fontSize: 11,
                fontColor: '#000000',
                rightMargin: 10,
                topMargin: 0
            },
            menu: {
                fontSize: 11,
                fontColor: '#000000',
                rightMargin: 4,
                topMargin: 0
            }
        },
        mount: {
            width: 80,
            frontHeadColor: '#0a8ee5',
            frontBodyColor: '#fff',
            backMountColor: '#888888',
            backMountSelectedColor: '#0a8ee5',
            borderSize: 1,
            roundCornerRadius: 5,
            headerLabelFontSize: 14
        },

        footer: {
            height: 8,                         //высота всего подвала вместе с радиусом скругления
            labelFontSize: 12,
            color: '#d0d0d0',
            label: {
                leftMargin: 4,
                bottomMargin: 2,
                color: '#ffffff',
                hoverColor: '#0a8ee5'
            }
        },
        port: {
            height: 16,
            connectorWidth: 8,
            connectorHeight: 8,
            connectorSelectedColor: '#00ff00',
            fontSize: 10,
            connectorCornerRadius: 3,
            label: {
                leftMargin: 14,
                hoverColor: '#0a8ee5',
            },
            mark: {
                width: 8,
                height: 8,
                cornerRadius: 2,
                fontSize: 7,
                leftMargin: 3
            }
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
            },
            color: {
                connectorColor: '#f1ab2b',
                labelColor: '#2a2a2a',
                fontColor: '#ffffff',
                markColor: '#f1ab2b'
            },
            pseudo: {
                connectorColor: '#b6b6b6',
                labelColor: '#2a2a2a',
                fontColor: '#ffffff',
                markColor: '#b6b6b6'
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