export default {
    animation:{
        nodeCollapseTime: 200, //milliseconds
        portHideTime: 200,
        collapseButtonRotateTime: 200,
        footerLabelHideTime: 200
    },
    layers: {
        nodeStep: 0.1,
        backMount: 0,
        title: 0,
        indicator: 0,
        frontMount: 0.01,
        footer: 0.01,
        header: 0.02,
        port: 0.02,
        footerLabel: 0.01,
        drag: 10
    },
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
            fontSelectedColor: '#2491F6',
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
                leftMargin: 24.5,
                topMargin: 33
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
                selectedColor: '#2491F6'
            },
            borderSize: 1,
            roundCornerRadius: 4
        },
        port: {
            height: 31,
            connector: {
                width: 14,
                height: 25,
                cornerRadius: 2,
                selectedColor: '#2491F6',
            },
            label: {
                fontSize: 16,
                topMargin: 10,
                leftMargin: 40,
                hoverColor: '#2491F6',
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
            height: 26,                         //высота подвала без радиуса
            color: '#EEEFF2',
            label: {
                fontSize: 15,
                leftMargin: 12,
                bottomMargin: 5.1,
                color: '#000000',
                hoverColor: '#2491F6',
                letterSpacing: 0.032
            }
        },
        line: {
            color: '#CACACA',
            selectedColor: '#2491F6'
        },
        portTypes: {
            float: {
                connectorColor: '#338A51',
                labelColor: '#2a2a2a',
                fontColor: '#ffffff',
                markColor: '#338A51'
            },
            int: {
                connectorColor: '#687EDB',
                labelColor: '#2a2a2a',
                fontColor: '#ffffff',
                markColor: '#687EDB'
            },
            color: {
                connectorColor: '#E99B66',
                labelColor: '#2a2a2a',
                fontColor: '#ffffff',
                markColor: '#E99B66'
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
        maxZoom: 0.2,               //frustum size how near camera can zoom
        minZoom: 10,                //frustum size how far camera can zoom
        dampingFactor: 0.15,        //bigger than shorter inertia
        zoomLimitForFullCollapseNodes: 1.5, //frustum size, for all nodes collapsed
        zoomSpeed: 0.002
    }
};