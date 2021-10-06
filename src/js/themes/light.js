export default {
    scene: {
        backgroundColor: '#f0f2f5'
    },
    line: {
        colorOnActive: '#b6b6b6',
        selectedColor: '#2491F6'
    },
    node: {
        title: {
            fontColor: '#000000',
            fontSelectedColor: '#2491F6',
        },
        indicator: {
            fontColor: '#000000',
            miniFontColor: '#ffffff'
        },
        header: {
            fontColor: '#000000'
        },
        mount: {
            front: {
                headColor: '#687EDB',
                bodyColor: '#ffffff',
            },
            back: {
                color: '#5F5F5F',
                selectedColor: '#2491F6'
            },
        },
        port: {
            label: {
                hoverColor: '#2491F6',
            },
        },
        footer: {
            color: '#F2EFEE',
            label: {
                color: '#000000',
                hoverColor: '#2491F6',
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
                markFontColor: '#ffffff',
                markColor: '#338A51'
            },
            int: {
                connectorColor: '#687EDB',
                labelColor: '#2a2a2a',
                markFontColor: '#ffffff',
                markColor: '#687EDB'
            },
            color: {
                connectorColor: '#E99B66',
                labelColor: '#2a2a2a',
                markFontColor: '#ffffff',
                markColor: '#E99B66'
            },
            pseudo: {
                connectorColor: '#b6b6b6',
                labelColor: '#2a2a2a',
                markFontColor: '#ffffff',
                markColor: '#b6b6b6'
            }
        }
    },
    fontPaths: {
        mainNormal: './fonts/Inter-Regular.ttf',
        mainMedium: './fonts/Inter-Medium.ttf',
    }
};