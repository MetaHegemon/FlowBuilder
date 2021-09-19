export default {

    layers: [1, 2, 3, 4, 5, 6],  //слои размещения объектов в сцене. значение элемента массива означает координату по z
    splineSegments: 100,
    deltaOnPointerInteractive: 3,
    fontPaths: {
        mainNormal: './fonts/Inter-Regular.ttf',
        mainMedium: './fonts/Inter-Medium.ttf',
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
            fontSize: 21,
            fontColor: '#000000',
            fontSelectedColor: '#0a8ee5',
            leftMargin: 0,
            bottomMargin: 2
        },
        indicator: {
            fontSize: 21,
            fontColor: '#000000',
            rightMargin: 0,
            bottomMargin: 2
        },
        header: {
            height: 62,
            collapse: {
                fontSize: 15,
                fontColor: '#000000',
                leftMargin: 18.5,
                topMargin: 27
            },
            play: {
                fontSize: 23,
                fontColor: '#000000',
                rightMargin: 34,
                topMargin: 21
            },
            menu: {
                fontSize: 22,
                fontColor: '#000000',
                rightMargin: 16,
                topMargin: 21
            }
        },
        mount: {
            width: 293,
            frontBodyColor: '#fff',
            front: {
                headHeight: 6.4,             //без радиуса
                headColor: '#687EDB',
                bodyColor: '#ffffff',
            },
            back: {
                color: '#5F5F5F',
                selectedColor: '#0a8ee5'
            },
            borderSize: 1,
            roundCornerRadius: 4,
            headerLabelFontSize: 14
        },
        port: {
            height: 31,
            connector: {
                width: 14,
                height: 25,
                cornerRadius: 2,
                selectedColor: '#00ff00',
            },
            label: {
                fontSize: 16,
                topMargin: 10,
                leftMargin: 40,
                hoverColor: '#0a8ee5',
                letterSpacing: 0.046,
                pseudoLeftMargin: 13,
                underlineLeftMargin: -0.5,
                underlineTopMargin: 4.5
            },
            mark: {
                width: 30,
                height: 25,
                cornerRadius: 2,
                fontSize: 17,
                leftMargin: 4.5,
                topMargin: 15.5,
                label: {
                    leftMargin: 0,
                    topMargin: -1
                }
            }
        },
        footer: {
            height: 26,                         //высота всего подвала вместе с радиусом скругления
            color: '#EEEFF2',
            label: {
                fontSize: 15,
                leftMargin: 12,
                bottomMargin: 5.1,
                color: '#000000',
                hoverColor: '#0a8ee5',
                letterSpacing: 0.032
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