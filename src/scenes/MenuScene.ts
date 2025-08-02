export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create(): void {
        // 背景を追加
        this.add.rectangle(400, 300, 800, 600, 0x87CEEB);

        // ゲームタイトル
        const title = this.add.text(400, 80, 'ニャンコ寿司キャッチ！', {
            fontSize: '36px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            fontStyle: 'bold',
            align: 'center'
        });
        title.setOrigin(0.5);
        title.setResolution(2);

        // ゲーム説明（より簡潔に）
        const instructions = this.add.text(400, 180, '【ゲームルール】\n\n• お手本の寿司を覚えてね！\n• 同じ寿司だけキャッチ！\n• 違う寿司は避けてね！\n• 正しい順番でキャッチでボーナス！', {
            fontSize: '20px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        });
        instructions.setOrigin(0.5);
        instructions.setResolution(2);

        // 操作方法
        const controls = this.add.text(400, 320, '【操作方法】\n\n← → キーで猫を移動\nタッチでも操作可能', {
            fontSize: '18px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        });
        controls.setOrigin(0.5);
        controls.setResolution(2);

        // スタートボタン
        const startButton = this.add.text(400, 420, 'スタート', {
            fontSize: '28px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 30, y: 15 },
            stroke: '#000000',
            strokeThickness: 2
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

        // 半透明の背景パネルを追加（文字を見やすくするため）
        const panel = this.add.graphics();
        panel.fillStyle(0x000000, 0.3);
        panel.fillRoundedRect(50, 50, 700, 500, 20);
        panel.lineStyle(2, 0xffffff, 0.5);
        panel.strokeRoundedRect(50, 50, 700, 500, 20);

        // パネルを文字の後ろに配置
        panel.setDepth(0);
        title.setDepth(1);
        instructions.setDepth(1);
        controls.setDepth(1);
        startButton.setDepth(1);
    }
} 