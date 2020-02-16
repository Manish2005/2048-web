import 'phaser';

export default class Demo extends Phaser.Scene {
    fieldArray = [];
    fieldGroup: any;
    canMove: boolean;
    movingTiles: number;
    static gameOptions = {
        tileSize: 200,
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
    constructor() {
        super('demo');
    }

    preload() {
        this.load.image("tile", "./assets/tile.png");
    }

    create() {
        this.fieldGroup = this.add.group();
        for (var i = 0; i < 4; i++) {
            this.fieldArray[i] = [];
            for (var j = 0; j < 4; j++) {
                var two = this.add.sprite(j * Demo.gameOptions.tileSize + Demo.gameOptions.tileSize / 2, i * Demo.gameOptions.tileSize + Demo.gameOptions.tileSize / 2, "tile");
                two.alpha = 0;
                two.visible = false;
                this.fieldGroup.add(two);
                var text = this.add.text(j * Demo.gameOptions.tileSize + Demo.gameOptions.tileSize / 2, i * Demo.gameOptions.tileSize + Demo.gameOptions.tileSize / 2, "2", {
                    font: "bold 64px Arial",
                    color: "black",
                    align: "center"
                });
                text.setOrigin(0.5);
                text.alpha = 0;
                text.visible = false;
                this.fieldGroup.add(text);
                this.fieldArray[i][j] = {
                    tileValue: 0,
                    tileSprite: two,
                    tileText: text,
                    canUpgrade: true
                }
            }
        }
        window.focus()
        this.resize();
        window.addEventListener("resize", this.resize, false);
        this.input.keyboard.on("keydown", this.handleKey, this);
        this.canMove = false;
        this.createNewTile();
        this.createNewTile();
    }

    createNewTile() {
        var emptyTiles = [];
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (this.fieldArray[i][j].tileValue == 0) {
                    emptyTiles.push({
                        row: i,
                        col: j
                    })
                }
            }
        }
        var chosenTile = Phaser.Utils.Array.GetRandom(emptyTiles);
        this.fieldArray[chosenTile.row][chosenTile.col].tileValue = 2;
        this.fieldArray[chosenTile.row][chosenTile.col].tileSprite.visible = true;
        this.fieldArray[chosenTile.row][chosenTile.col].tileText.setText("2");
        this.fieldArray[chosenTile.row][chosenTile.col].tileText.visible = true;
        this.tweens.add({
            targets: [this.fieldArray[chosenTile.row][chosenTile.col].tileSprite, this.fieldArray[chosenTile.row][chosenTile.col].tileText],
            alpha: 1,
            duration: Demo.gameOptions.tweenSpeed * 0.1,
            onComplete: (tween) => {
                this.canMove = true;
            },
        });
    }

    handleKey(e) {
        if (this.canMove) {
            var children = this.fieldGroup.getChildren();
            switch (e.code) {
                case "KeyA":
                case 'ArrowLeft':
                    for (var i = 0; i < children.length; i++) {
                        children[i].depth = children[i].x;
                    }
                    this.handleMove(0, -1);
                    break;
                case "KeyD":
                case 'ArrowRight':
                    for (var i = 0; i < children.length; i++) {
                        children[i].depth = config.width - children[i].x;
                    }
                    this.handleMove(0, 1);
                    break;
                case "KeyW":
                case 'ArrowUp':
                    for (var i = 0; i < children.length; i++) {
                        children[i].depth = children[i].y;
                    }
                    this.handleMove(-1, 0);
                    break;
                case "KeyS":
                case 'ArrowDown':
                    for (var i = 0; i < children.length; i++) {
                        children[i].depth = config.height - children[i].y;
                    }
                    this.handleMove(1, 0);
                    break;
            }
        }
    }

    handleMove(deltaRow, deltaCol) {
        this.canMove = false;
        var somethingMoved = false;
        this.movingTiles = 0;
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                var colToWatch = deltaCol == 1 ? (4 - 1) - j : j;
                var rowToWatch = deltaRow == 1 ? (4 - 1) - i : i;
                var tileValue = this.fieldArray[rowToWatch][colToWatch].tileValue;
                if (tileValue != 0) {
                    var colSteps = deltaCol;
                    var rowSteps = deltaRow;
                    while (this.isInsideBoard(rowToWatch + rowSteps, colToWatch + colSteps) && this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue == 0) {
                        colSteps += deltaCol;
                        rowSteps += deltaRow;
                    }
                    if (this.isInsideBoard(rowToWatch + rowSteps, colToWatch + colSteps) && (this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue == tileValue) && this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].canUpgrade && this.fieldArray[rowToWatch][colToWatch].canUpgrade) {
                        this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue = tileValue * 2;
                        this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].canUpgrade = false;
                        this.fieldArray[rowToWatch][colToWatch].tileValue = 0;
                        this.moveTile(this.fieldArray[rowToWatch][colToWatch], rowToWatch + rowSteps, colToWatch + colSteps, Math.abs(rowSteps + colSteps), true);
                        somethingMoved = true;
                    }
                    else {
                        colSteps = colSteps - deltaCol;
                        rowSteps = rowSteps - deltaRow;
                        if (colSteps != 0 || rowSteps != 0) {
                            this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue = tileValue;
                            this.fieldArray[rowToWatch][colToWatch].tileValue = 0;
                            this.moveTile(this.fieldArray[rowToWatch][colToWatch], rowToWatch + rowSteps, colToWatch + colSteps, Math.abs(rowSteps + colSteps), false);
                            somethingMoved = true;
                        }
                    }
                }
            }
        }
        if (!somethingMoved) {
            this.canMove = true;
        }
    }

    moveTile(tile, row, col, distance, changeNumber) {
        this.movingTiles++;
        this.tweens.add({
            targets: [tile.tileSprite, tile.tileText],
            x: Demo.gameOptions.tileSize * (col + 0.5),
            y: Demo.gameOptions.tileSize * (row + 0.5),
            duration: Demo.gameOptions.tweenSpeed * distance,
            onComplete: (tween) => {
                this.movingTiles--;
                if (changeNumber) {
                    this.transformTile(tile, row, col);
                }
                if (this.movingTiles == 0) {
                    this.resetTiles();
                    this.createNewTile();
                }
            }
        })
    }

    transformTile(tile, row, col) {
        this.movingTiles++;
        tile.tileText.setText(this.fieldArray[row][col].tileValue.toString());
        tile.tileSprite.setTint(Demo.gameOptions.colors[this.fieldArray[row][col].tileValue]);
        this.tweens.add({
            targets: [tile.tileSprite],
            scaleX: 1.1,
            scaleY: 1.1,
            duration: Demo.gameOptions.tweenSpeed,
            yoyo: true,
            // repeat: 1,
            onComplete: (tween) => {
                this.movingTiles--;
                if (this.movingTiles == 0) {
                    this.resetTiles();
                    this.createNewTile();
                }
            }
        })
    }

    resetTiles() {
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                this.fieldArray[i][j].canUpgrade = true;
                this.fieldArray[i][j].tileSprite.x = j * Demo.gameOptions.tileSize + Demo.gameOptions.tileSize / 2;
                this.fieldArray[i][j].tileSprite.y = i * Demo.gameOptions.tileSize + Demo.gameOptions.tileSize / 2;
                this.fieldArray[i][j].tileText.x = j * Demo.gameOptions.tileSize + Demo.gameOptions.tileSize / 2;
                this.fieldArray[i][j].tileText.y = i * Demo.gameOptions.tileSize + Demo.gameOptions.tileSize / 2;
                if (this.fieldArray[i][j].tileValue > 0) {
                    this.fieldArray[i][j].tileSprite.alpha = 1;
                    this.fieldArray[i][j].tileSprite.visible = true;
                    this.fieldArray[i][j].tileText.alpha = 1;
                    this.fieldArray[i][j].tileText.visible = true;
                    this.fieldArray[i][j].tileText.setText(this.fieldArray[i][j].tileValue.toString());
                }
                else {
                    this.fieldArray[i][j].tileValue = 0;
                    this.fieldArray[i][j].tileSprite.alpha = 0;
                    this.fieldArray[i][j].tileSprite.visible = false;
                    this.fieldArray[i][j].tileText.alpha = 0;
                    this.fieldArray[i][j].tileText.visible = false;
                }
                this.fieldArray[i][j].tileSprite.setTint(Demo.gameOptions.colors[this.fieldArray[i][j].tileValue]);
            }
        }
    }

    isInsideBoard(row, col) {
        return (row >= 0) && (col >= 0) && (row < 4) && (col < 4);
    }

    resize() {
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

const config = {
    type: Phaser.AUTO,
    width: Demo.gameOptions.tileSize * 4,
    height: Demo.gameOptions.tileSize * 4,
    backgroundColor: 0x444444,
    scene: Demo
};

const game = new Phaser.Game(config);
