import { GameOptions } from './util';

export class Tile {
    static isInsideBoard(row: number, col: number) {
        return (row >= 0) && (col >= 0) && (row < 4) && (col < 4);
    }

    /**
    * 
    * @param line row or column number
    */
    static getTilePosition(line: number): number {
        return GameOptions.tileSize * (line + 0.5);
    }

    static resetTiles(fieldArray) {
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                const tile = fieldArray[i][j];
                tile.canUpgrade = true;
                tile.tileSprite.x = tile.tileText.x = Tile.getTilePosition(j);
                tile.tileSprite.y = tile.tileText.y = Tile.getTilePosition(i);
                if (tile.tileValue > 0) {
                    tile.tileSprite.alpha = tile.tileText.alpha = 1;
                    tile.tileSprite.visible = tile.tileText.visible = true;
                    tile.tileText.setText(tile.tileValue.toString());
                } else {
                    tile.tileValue = 0;
                    tile.tileSprite.alpha = tile.tileText.alpha = 0;
                    tile.tileSprite.visible = tile.tileText.visible = false;
                }
                tile.tileSprite.setTint(GameOptions.colors[tile.tileValue]);
            }
        }
    }
}