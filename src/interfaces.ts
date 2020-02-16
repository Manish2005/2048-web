import 'phaser';

export interface ITile {
    tileValue: number;
    tileSprite: Phaser.GameObjects.Sprite;
    tileText: Phaser.GameObjects.Text;
    canUpgrade: boolean;
}