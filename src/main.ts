import Phaser from 'phaser';
import BootScene from './scenes/BootScene.ts';
import PreloadScene from './scenes/PreloadScene.ts';
import MenuScene from './scenes/MenuScene.ts';
import GameScene from './scenes/GameScene.ts';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 300 },
            debug: false
        }
    },
    scene: [BootScene, PreloadScene, MenuScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
        pixelArt: false,
        antialias: true,
        roundPixels: false,
        powerPreference: 'high-performance'
    },
    antialias: true,
    roundPixels: false,
    powerPreference: 'high-performance'
};

const game = new Phaser.Game(config); 