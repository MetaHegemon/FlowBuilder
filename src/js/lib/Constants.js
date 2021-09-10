export default {
    layers: [0, 1, 2, 3, 4, 5],  //слои размещения объектов в сцене. значение элемента массива означает координату по z
    nodeMesh: {
        title: {
            fontSize: 12,
            fontColor: '#00a2d2'
        },
        mount: {
            width: 80,
            height: 200,
            headerHeight: 20,
            frontHeadColor: '#00a2d2',
            frontBodyColor: '#fff',
            backMountColor: '#2a2a2a',
            borderSize: 2,
            roundCornerRadius: 5,
            headerLabelFontSize: 14,
            footerHeight: 10,
            footerLabelFontSize: 12,
            footerColor: '#d0d0d0'
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
            markFontColor: 0xffffff,
            markFontSize: 7,
            markLeftMargin: 3
        },
        portTypes: {
            float: {
                color: 0xff0000
            },
            int: {
                color: 0x0000ff
            }
        }
    }
};