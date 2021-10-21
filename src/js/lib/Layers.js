/**
 * Статичные данные о положениях геометрий по оси Z
 */
export default {
    nodeStep: 0.01,                      //шаг между нодами
    node: {
        self: 0,
        backMount: 0,
        title: 0,
        indicator: 0.003,
        frontMount: 0.001,
        header: 0.002,
        widthResizer: 0.004,
        learnMoreButton: 0.002,
        noticeButton: 0.002,
        bigMount: 0.005,
        miniMenuButton: 0.002,
    },
    port: {
        self: 0.002,
        magnet: 0,
        connector: 0.01,
        markMount: 0,
        markLabel: 0.001,
        label: 0
    },
    topForNode: 10,
    line: {
        fat: -1,
        thin: -1.001
    },
    lineMark: {
        pointer: 0.002,
        big: 0,
        small: 0.001
    },
    watchPoint: {   //слой от 0 до 0.005
        self: 20,
        bigMount: 0.005,
        back: 0,
        front: 0.001,
        controlPanelTop: 0.002,
        controlPanelBottom: 0.002,
        copyButton: 0,
        exportButton: 0,
        closeButton: 0,
        iconCornerResize: {
            self: 0,
            text: 0,
            reactor: 0.001
        }
    },
    nodeMenu: {
        self: 24,
        bigMount: 0.005,
        back: 0,
        front: 0.001,
        container: 0.002
    },
    nodeNotice: {
        self: 0.003,
        bigMount: 0.005,
        back: 0,
        front: 0.001,
        container: 0.002,
        arrow: {
            self: 0,
            back: 0,
            front: 0.001
        },
        unwrapButton: 0.004,
        message: 0.003
    }
}