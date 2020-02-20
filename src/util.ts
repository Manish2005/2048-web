export class GameUtil {
    static resize(config: { width: number, height: number }) {
        var canvas = document.querySelector("canvas");
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var windowRatio = windowWidth / windowHeight;
        var gameRatio = config.width / config.height;
        if (windowRatio < gameRatio) {
            canvas.style.width = windowWidth + "px";
            canvas.style.height = (windowWidth / gameRatio) + "px";
        }
        else {
            canvas.style.width = (windowHeight * gameRatio) + "px";
            canvas.style.height = windowHeight - 20 + "px";
        }
    }
}

export const GameOptions = {
    tileSize: 200,
    backgroundColor: 0x444444,
    colors: {
        0: 0xFFFFFF,
        2: 0xFFFFFF,
        4: 0xFFEEEE,
        8: 0xFFDDDD,
        16: 0xFFCCCC,
        32: 0xFFBBBB,
        64: 0xFFAAAA,
        128: 0xFF9999,
        256: 0xFF8888,
        512: 0xFF7777,
        1024: 0xFF6666,
        2048: 0xFF5555,
        4096: 0xFF4444,
        8192: 0xFF3333,
        16384: 0xFF2222,
        32768: 0xFF1111,
        65536: 0xFF0000
    },
    tweenSpeed: 50
}