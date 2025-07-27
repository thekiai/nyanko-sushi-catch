export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // タイトル
        const title = this.add.text(width / 2, height / 3, 'ニャンコ寿司キャッチ\n弐貫瞬速！', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        });
        title.setOrigin(0.5);

        // サブタイトル
        const subtitle = this.add.text(width / 2, height / 2, 'お手本を覚えて、正確にキャッチしよう！', {
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        subtitle.setOrigin(0.5);

        // スタートボタン
        const startButton = this.add.text(width / 2, height * 2 / 3, 'スタート', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 }
        });
        startButton.setOrigin(0.5);
        startButton.setInteractive();

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

        // 操作説明
        const instructions = this.add.text(width / 2, height * 0.8, '操作: 左右キー または タッチ', {
            fontSize: '14px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1
        });
        instructions.setOrigin(0.5);

        // 背景の装飾
        this.add.graphics()
            .fillStyle(0x000000, 0.3)
            .fillRoundedRect(width / 2 - 200, height / 2 - 150, 400, 300, 20);
    }
} 