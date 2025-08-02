export default class ChallengeSelectionScene extends Phaser.Scene {
    private challengeCount: number = 2; // デフォルトは2個

    constructor() {
        super({ key: 'ChallengeSelectionScene' });
    }

    create(): void {
        // 背景を追加
        this.add.rectangle(400, 300, 800, 600, 0x87CEEB);

        // 半透明の背景パネル
        const panel = this.add.graphics();
        panel.fillStyle(0x000000, 0.6);
        panel.fillRoundedRect(50, 50, 700, 500, 20);
        panel.lineStyle(3, 0xffffff, 0.8);
        panel.strokeRoundedRect(50, 50, 700, 500, 20);

        // タイトル
        const title = this.add.text(400, 100, '寿司の数を選択してね', {
            fontSize: '32px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            fontStyle: 'bold',
            align: 'center'
        });
        title.setOrigin(0.5);
        title.setResolution(2);

        // チャレンジ数ボタンを作成
        for (let i = 2; i <= 5; i++) {
            const button = this.add.text(200 + (i - 2) * 150, 250, `${i}個`, {
                fontSize: '36px',
                fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
                color: '#ffffff',
                backgroundColor: '#444444',
                padding: { x: 25, y: 15 },
                stroke: '#000000',
                strokeThickness: 2
            });
            button.setOrigin(0.5);
            button.setInteractive();
            button.setResolution(2);

            // 現在選択されているチャレンジ数をハイライト
            if (i === this.challengeCount) {
                button.setBackgroundColor('#667eea');
            }

            button.on('pointerdown', () => {
                this.challengeCount = i;
                // 全てのボタンの色をリセット
                for (let j = 2; j <= 5; j++) {
                    const btn = this.children.getByName(`challenge-${j}`) as Phaser.GameObjects.Text;
                    if (btn) {
                        btn.setBackgroundColor('#444444');
                    }
                }
                // 選択されたボタンをハイライト
                button.setBackgroundColor('#667eea');
            });

            button.setName(`challenge-${i}`);
        }

        // ゲーム開始ボタン
        const startButton = this.add.text(400, 400, 'ゲーム開始', {
            fontSize: '32px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 40, y: 20 },
            stroke: '#000000',
            strokeThickness: 3
        });
        startButton.setOrigin(0.5);
        startButton.setInteractive();
        startButton.setResolution(2);

        startButton.on('pointerdown', () => {
            // チャレンジ数をGameSceneに渡してゲーム開始
            this.scene.start('GameScene', { challengeCount: this.challengeCount });
        });

        // 深度設定
        panel.setDepth(0);
        title.setDepth(1);
        startButton.setDepth(1);
    }
} 