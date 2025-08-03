export default class ChallengeSelectionScene extends Phaser.Scene {
    private challengeCount: number = 2; // デフォルトは2個
    private cursor!: Phaser.Types.Input.Keyboard.CursorKeys;
    private enterKey!: Phaser.Input.Keyboard.Key;
    private challengeButtons: Phaser.GameObjects.Text[] = [];

    constructor() {
        super({ key: 'ChallengeSelectionScene' });
    }

    create(): void {
        // キーボード入力を設定
        this.cursor = this.input.keyboard!.createCursorKeys();
        this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        // 背景を追加
        this.add.rectangle(400, 300, 800, 600, 0x87CEEB);

        // 半透明の背景パネル
        const panel = this.add.graphics();
        panel.fillStyle(0x000000, 0);
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
                backgroundColor: '#999999',
                padding: { x: 25, y: 15 },
                stroke: '#000000',
                strokeThickness: 2
            });
            button.setOrigin(0.5);
            button.setInteractive();
            button.setResolution(2);

            // 現在選択されているチャレンジ数をハイライト
            if (i === this.challengeCount) {
                button.setBackgroundColor('#333333');
            }

            button.on('pointerdown', () => {
                this.selectChallenge(i);
            });

            button.setName(`challenge-${i}`);
            this.challengeButtons.push(button);
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
            this.startGame();
        });

        // 深度設定
        panel.setDepth(0);
        title.setDepth(1);
        startButton.setDepth(1);
    }

    update(): void {
        // キーボード入力処理
        if (Phaser.Input.Keyboard.JustDown(this.cursor.left)) {
            this.challengeCount = Math.max(2, this.challengeCount - 1);
            this.updateButtonHighlight();
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursor.right)) {
            this.challengeCount = Math.min(5, this.challengeCount + 1);
            this.updateButtonHighlight();
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursor.space) || Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.startGame();
        }
    }

    private selectChallenge(count: number): void {
        this.challengeCount = count;
        this.updateButtonHighlight();
    }

    private updateButtonHighlight(): void {
        // 全てのボタンの色をリセット
        for (let j = 2; j <= 5; j++) {
            const btn = this.children.getByName(`challenge-${j}`) as Phaser.GameObjects.Text;
            if (j === this.challengeCount) {
                btn.setBackgroundColor('#333333');
            } else {
                btn.setBackgroundColor('#999999');
            }
        }
    }
    private startGame(): void {
        // チャレンジ数をGameSceneに渡してゲーム開始
        this.scene.start('GameScene', { challengeCount: this.challengeCount });
    }
} 