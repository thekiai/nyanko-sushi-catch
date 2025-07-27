export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // タイトル（高品質フォント）
        const title = this.add.text(width / 2, height / 3, 'ニャンコ寿司キャッチ\n弐貫瞬速！', {
            fontSize: '48px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center',
            lineSpacing: 10
        });
        title.setOrigin(0.5);
        title.setResolution(2); // 高解像度レンダリング

        // サブタイトル（高品質フォント）
        const subtitle = this.add.text(width / 2, height / 2, 'お手本を覚えて、正確にキャッチしよう！', {
            fontSize: '20px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            lineSpacing: 5
        });
        subtitle.setOrigin(0.5);
        subtitle.setResolution(2);

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

        // 操作説明（高品質フォント）
        const instructions = this.add.text(width / 2, height * 0.8, '操作: 左右キー または タッチ', {
            fontSize: '18px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        instructions.setOrigin(0.5);
        instructions.setResolution(2);

        // 背景の装飾
        this.add.graphics()
            .fillStyle(0x000000, 0.3)
            .fillRoundedRect(width / 2 - 200, height / 2 - 150, 400, 300, 20);
    }
} 