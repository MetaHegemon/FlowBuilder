export default {
    fontPaths: {
        mainNormal: './fonts/OpenSans-Regular.ttf',
        mainMedium: './fonts/OpenSans-Medium.ttf',
    },
    scene: {
        backgroundColor: '#7c7c7c'
    },
    line: {
        colorOnActive: '#b6b6b6',
        selectedColor: '#da0000',
        selectedMarkColor: '#da0000'
    },
    watchPoint: {
        back: {
            backgroundColor: '#D2D2D2'
        },
        topControlPanel: {
            backgroundColor: '#EEEFF2'
        },
        bottomControlPanel: {
            backgroundColor: '#EEEFF2'
        },
        cornerResize: {
            fontColor: '#5F5F5F'
        },
        closeButton: {
            fontColor: '#2F2F2F',
            hoverColor: '#2491F6'
        },
        copyButton: {
            fontColor: '#000000',
            hoverColor: '#2491F6'
        },
        exportButton: {
            fontColor: '#000000',
            hoverColor: '#2491F6'
        }
    },
    nodeMenu: {
        back: {
            backgroundColor: '#f8bd59'
        },
        front: {
            backgroundColor: '#525252'
        },
        button: {
            regular: {
                color: '#ffffff',
                hoverColor: '#2491F6'
            },
            warning: {
                color: '#DB6F68',
                hoverColor: '#2491F6'
            }
        }
    },
    node: {
        title: {
            fontColor: '#e3e3e3',
            fontSelectedColor: '#f8bd59',
        },
        indicator: {
            fontColor: '#e3e3e3',
            miniFontColor: '#ffffff'
        },
        header: {
            fontColor: '#ffffff'
        },
        mount: {
            front: {
                headColor: '#e3c43a',
                bodyColor: '#525252',
            },
            back: {
                color: '#ffffff',
                selectedColor: '#f8bd59'
            },
        },
        port: {
            label: {
                hoverColor: '#f8bd59',
            },
        },
        footer: {
            color: '#8d8d8d',
            label: {
                color: '#eeeeee',
                hoverColor: '#2491F6',
            }
        },
        portTypes: {
            float: {
                connectorColor: '#60e78e',
                labelColor: '#eeeeee',
                markFontColor: '#000000',
                markColor: '#60e78e'
            },
            int: {
                connectorColor: '#97a6e5',
                labelColor: '#eeeeee',
                markFontColor: '#000000',
                markColor: '#97a6e5'
            },
            color: {
                connectorColor: '#e9d866',
                labelColor: '#eeeeee',
                markFontColor: '#000000',
                markColor: '#e9d866'
            },
            pseudo: {
                connectorColor: '#dadada',
                labelColor: '#eeeeee',
                markFontColor: '#000000',
                markColor: '#dadada'
            }
        }
    }
};