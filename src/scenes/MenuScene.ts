export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // ゲームタイトル
        const title = this.add.text(400, 150, 'ニャンコ寿司キャッチ\n弐貫瞬速！', {
            fontSize: '48px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            fontStyle: 'bold',
            align: 'center'
        });
        title.setOrigin(0.5);
        title.setResolution(2);

        // ゲーム説明
        const instructions = this.add.text(400, 280, '【ゲームルール】\n\n1. お手本の寿司を覚えてね！\n2. お手本と同じ寿司だけキャッチ！\n3. 違う寿司は避けてね！\n4. 2貫正しくキャッチでパーフェクト！', {
            fontSize: '24px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        });
        instructions.setOrigin(0.5);
        instructions.setResolution(2);

        // 操作方法
        const controls = this.add.text(400, 420, '【操作方法】\n← → キーで猫を移動\nタッチでも操作可能', {
            fontSize: '20px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        });
        controls.setOrigin(0.5);
        controls.setResolution(2);

        // スタートボタン（高品質フォント）
        const startButton = this.add.text(width / 2, height * 2 / 3, 'スタート', {
            fontSize: '32px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 30, y: 15 }
        });
        startButton.setOrigin(0.5);
        startButton.setInteractive();
        startButton.setResolution(2);

        // ボタンのホバー効果
        startButton.on('pointerover', () => {
            startButton.setStyle({ backgroundColor: '#45a049' });
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ backgroundColor: '#4CAF50' });
        });

        // クリックでゲーム開始
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // 背景の装飾
        this.add.graphics()
            .fillStyle(0x000000, 0.3)
            .fillRoundedRect(width / 2 - 200, height / 2 - 150, 400, 300, 20);
    }
} 