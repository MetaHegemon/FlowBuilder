export default {
    defaultTheme: 'light',
    animation:{
        nodeCollapseTime: 150, //milliseconds
        portHideTime: 150,
        collapseButtonRotateTime: 150,
        footerLabelHideTime: 150,
        caretBlinkingTime: 300,
        failEditingTextTime: 300,
    },
    layers: {
        nodeStep: 0.1,
        backMount: 0,
        title: 0,
        indicator: 0.3,
        frontMount: 0.01,
        header: 0.02,
        port: 0.02,
        footerLabel: 0.01,
        topForNode: 10,
    },
    deltaOnPointerInteractive: 3,
    fontPaths: {
        awSolid: './fonts/fa-solid-900.ttf',
        awLight: './fa-light-300.ttf',
        awRegular: './fa-regular-400.ttf',
        awBrands: './fa-brands-400.ttf',
        awDuotone: './fa-duotone-900.ttf'
    },
    lines: {
        lineWidth: 0.002,
        segments: 40,
        watchPoint: {
            positionOnLine: 80, //percent on line
            pointerRadius: 8,
            bigCircleRadius: 6,
            smallCircleRadius: 3
        }
    },
    miniNodeMesh: {
        height: 59,
        width: 59,
        roundCornerRadius: 5,
        footerHeight: 3, //without radius
        borderSize: 1,
        indicatorMountWidth: 20,
        indicatorMountHeight: 20,
        indicatorFontSize: 18,
        titleFontSize: 12,
        menuButtonFontSize: 8
    },
    nodeMesh: {
        constraints: {
            maxVisiblePorts: 4,
        },
        title: {
            fontSize: 21,
            leftMargin: 0,
            bottomMargin: 2
        },
        indicator: {
            fontSize: 21,
            rightMargin: 0,
            bottomMargin: 2
        },
        header: {
            height: 62,
            collapse: {
                fontSize: 15,
                leftMargin: 24.5,
                topMargin: 33
            },
            play: {
                fontSize: 23,
                rightMargin: 34,
                topMargin: 21
            },
            menu: {
                fontSize: 22,
                rightMargin: 16,
                topMargin: 21
            }
        },
        bigMount: {
            radius: 0.01
        },
        mount: {
            width: 293,
            maxWidth: 500,
            minWidth: 200,
            front: {
                headHeight: 6.4,             //без радиуса
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
            },
            magnet: {
                width: 22
            },
            label: {
                fontSize: 16,
                topMargin: 10,
                leftMargin: 40,
                letterSpacing: 0.046,
                pseudoLeftMargin: 13,
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
            label: {
                fontSize: 15,
                leftMargin: 12,
                bottomMargin: 5.1,
                letterSpacing: 0.032
            }
        },
        rightResizer: {
            width: 4
        }
    },
    three: {
        zoom: {
            /**
             * frustum 700 = 242% figma
             */
            default: 1600,                      //start zoom value(frustum)
            min: 3000,                          //frustum size how near camera can zoom
            max: 500,                           //frustum size how far camera can zoom
            damping: 0.8,                       //bigger than shorter inertia
            speed: 8,
            limitForFullCollapseNodes: 1800,    //frustum size, for all nodes collapsed
            limitForFullUnCollapseNodes: 1700   //frustum size, for all nodes uncollapsed //TODO убрать одно из значений
        }
    }
};