import 'phaser';
import { GameUtil, GameOptions } from './util'
import { ITile } from './interfaces';
import { Tile } from './tile';

export default class Demo extends Phaser.Scene {
    fieldArray: Array<Array<ITile>> = [];
    fieldGroup: Phaser.GameObjects.Group;
    canMove: boolean;
    movingTiles: number;

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
                var two = this.add.sprite(Tile.getTilePosition(j), Tile.getTilePosition(i), "tile");
                two.alpha = 0;
                two.visible = false;
                this.fieldGroup.add(two);
                var text = this.add.text(Tile.getTilePosition(j), Tile.getTilePosition(i), "2", {
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
        GameUtil.resize(config);
        window.addEventListener("resize", () => { GameUtil.resize(config) }, false);
        this.input.keyboard.on("keydown", this.handleKey, this);
        this.canMove = false;
        this.createNewTile();
        this.createNewTile();
    }

    createNewTile() {
        var emptyTiles = [];
        for (var row = 0; row < 4; row++) {
            for (var col = 0; col < 4; col++) {
                if (this.fieldArray[row][col].tileValue == 0) {
                    emptyTiles.push({ row, col })
                }
            }
        }
        const chosenTile = Phaser.Utils.Array.GetRandom(emptyTiles);
        const tile = this.fieldArray[chosenTile.row][chosenTile.col];
        tile.tileValue = 2;
        tile.tileSprite.visible = true;
        tile.tileText.setText("2");
        tile.tileText.visible = true;
        this.tweens.add({
            targets: [tile.tileSprite, tile.tileText],
            alpha: 1,
            duration: GameOptions.tweenSpeed,
            onComplete: (tween) => {
                this.canMove = true;
            },
        });
    }

    handleKey(e) {
        if (this.canMove) {
            var children = this.fieldGroup.getChildren() as any;
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
                    while (Tile.isInsideBoard(rowToWatch + rowSteps, colToWatch + colSteps) && this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue == 0) {
                        colSteps += deltaCol;
                        rowSteps += deltaRow;
                    }
                    if (Tile.isInsideBoard(rowToWatch + rowSteps, colToWatch + colSteps) && (this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue == tileValue) && this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].canUpgrade && this.fieldArray[rowToWatch][colToWatch].canUpgrade) {
                        this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue = tileValue * 2;
                        this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].canUpgrade = false;
                        this.fieldArray[rowToWatch][colToWatch].tileValue = 0;
                        this.moveTile(this.fieldArray[rowToWatch][colToWatch], rowToWatch + rowSteps, colToWatch + colSteps, Math.abs(rowSteps + colSteps), true);
                        somethingMoved = true;
                    } else {
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
            x: Tile.getTilePosition(col),
            y: Tile.getTilePosition(row),
            duration: GameOptions.tweenSpeed * distance,
            onComplete: (tween) => {
                this.movingTiles--;
                if (changeNumber) {
                    this.transformTile(tile, row, col);
                }
                if (this.movingTiles == 0) {
                    Tile.resetTiles(this.fieldArray);
                    this.createNewTile();
                }
            }
        })
    }

    transformTile(tile, row, col) {
        this.movingTiles++;
        tile.tileText.setText(this.fieldArray[row][col].tileValue.toString());
        tile.tileSprite.setTint(GameOptions.colors[this.fieldArray[row][col].tileValue]);
        this.tweens.add({
            targets: [tile.tileSprite],
            scaleX: 1.1,
            scaleY: 1.1,
            duration: GameOptions.tweenSpeed,
            yoyo: true,
            onComplete: (tween) => {
                this.movingTiles--;
                if (this.movingTiles == 0) {
                    Tile.resetTiles(this.fieldArray);
                    this.createNewTile();
                }
            }
        })
    }
}

const config = {
    type: Phaser.AUTO,
    width: GameOptions.tileSize * 4,
    height: GameOptions.tileSize * 4,
    backgroundColor: 0x444444,
    scene: Demo
};

const game = new Phaser.Game(config);
