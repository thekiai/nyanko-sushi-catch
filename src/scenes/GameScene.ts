interface SushiData {
    sprite: Phaser.Physics.Arcade.Image;
    number: number;
    type: string;
    position: string;
}

interface Challenge {
    first: { type: string; position: string };
    second: { type: string; position: string };
}

export default class GameScene extends Phaser.Scene {
    private score: number = 0;
    private currentRound: number = 0;
    private cat!: Phaser.Physics.Arcade.Image;
    private plate!: Phaser.Physics.Arcade.Image;
    private fallingSushi!: Phaser.Physics.Arcade.Image;
    private cursor!: Phaser.Types.Input.Keyboard.CursorKeys;
    private scoreText!: Phaser.GameObjects.Text;
    private examplePlate!: Phaser.GameObjects.Image;
    private exampleSushi: Phaser.GameObjects.Image[] = [];
    private catchedSushi: SushiData[] = [];
    private gameState: 'showing-example' | 'falling' | 'judging' = 'showing-example';
    private sushiTypes: string[] = ['maguro', 'salmon'];
    private sushiPositions: string[] = ['left', 'right'];
    private currentChallenge!: Challenge;
    private fallSpeed: number = 200;

    constructor() {
        super({ key: 'GameScene' });
    }

    create(): void {
        // 物理エンジンが利用可能か確認
        if (!this.physics) {
            console.error('Physics engine is not available');
            return;
        }

        // 背景
        this.add.image(400, 300, 'background');

        // スコア表示（高品質フォント）
        this.scoreText = this.add.text(16, 16, '連続完璧: 0', {
            fontSize: '28px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.scoreText.setResolution(2);

        // 猫とお皿の作成
        this.createCatAndPlate();

        // キーボード入力の設定
        this.cursor = this.input.keyboard!.createCursorKeys();

        // タッチ入力の設定
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.x < 400) {
                this.moveCat('left');
            } else {
                this.moveCat('right');
            }
        });

        // BGM開始（一時的に無効化）
        // this.sound.play('bgm', { loop: true, volume: 0.3 });

        // 最初のラウンド開始
        this.startNewRound();
    }

    private createCatAndPlate(): void {
        // お皿を先に作成
        this.plate = this.add.image(400, 520, 'plate') as Phaser.Physics.Arcade.Image;
        this.physics.add.existing(this.plate, true);
        this.plate.setScale(0.5); // 新しい高解像度に合わせて調整

        // 猫を作成
        this.cat = this.add.image(400, 500, 'cat') as Phaser.Physics.Arcade.Image;
        this.physics.add.existing(this.cat, true);
        this.cat.setScale(0.4); // 新しい高解像度に合わせて調整

        // 物理オブジェクトが正しく作成されたことを確認
        if (!this.plate.body || !this.cat.body) {
            console.error('Failed to create physics bodies for cat and plate');
            return;
        }

        // 猫とお皿の衝突判定を設定
        this.physics.add.collider(this.cat, this.plate);
    }

    private startNewRound(): void {
        this.currentRound++;
        this.catchedSushi = [];
        this.gameState = 'showing-example';

        // 新しいお題を生成
        this.generateChallenge();

        // お手本を表示
        this.showExample();
    }

    private generateChallenge(): void {
        const firstSushi = this.sushiTypes[Math.floor(Math.random() * this.sushiTypes.length)];
        const secondSushi = this.sushiTypes[Math.floor(Math.random() * this.sushiTypes.length)];
        const firstPosition = this.sushiPositions[Math.floor(Math.random() * this.sushiPositions.length)];
        const secondPosition = this.sushiPositions[Math.floor(Math.random() * this.sushiPositions.length)];

        this.currentChallenge = {
            first: { type: firstSushi, position: firstPosition },
            second: { type: secondSushi, position: secondPosition }
        };
    }

    private showExample(): void {
        // お手本用のお皿を作成
        this.examplePlate = this.add.image(400, 150, 'plate');
        this.examplePlate.setScale(0.4);

        // お手本の寿司を配置
        this.exampleSushi = [];
        
        // 1貫目
        const firstX = this.currentChallenge.first.position === 'left' ? 350 : 450;
        const firstSushi = this.add.image(firstX, 150, `sushi-${this.currentChallenge.first.type}`);
        firstSushi.setScale(0.4);
        this.exampleSushi.push(firstSushi);

        // 2貫目
        const secondX = this.currentChallenge.second.position === 'left' ? 350 : 450;
        const secondSushi = this.add.image(secondX, 150, `sushi-${this.currentChallenge.second.type}`);
        secondSushi.setScale(0.4);
        this.exampleSushi.push(secondSushi);

        // 1秒後に消去してゲーム開始
        this.time.delayedCall(1000, () => {
            this.hideExample();
            this.startFallingSushi();
        });
    }

    private hideExample(): void {
        if (this.examplePlate) {
            this.examplePlate.destroy();
            this.examplePlate = null!;
        }
        this.exampleSushi.forEach(sushi => sushi.destroy());
        this.exampleSushi = [];
    }

    private startFallingSushi(): void {
        this.gameState = 'falling';
        this.dropSushi(1);
    }

    private dropSushi(sushiNumber: number): void {
        const sushiType = sushiNumber === 1 ? this.currentChallenge.first.type : this.currentChallenge.second.type;
        const x = 400; // 中央から落下開始
        
        // 物理オブジェクトとして作成
        this.fallingSushi = this.physics.add.image(x, 50, `sushi-${sushiType}`);
        this.fallingSushi.setScale(0.5); // 新しい高解像度に合わせて調整
        
        // プロパティを設定
        (this.fallingSushi as any).sushiNumber = sushiNumber;
        (this.fallingSushi as any).sushiType = sushiType;
        
        // 物理オブジェクトが存在することを確認してから速度を設定
        if (this.fallingSushi && this.fallingSushi.body) {
            this.fallingSushi.setVelocityY(this.fallSpeed);
        }

        // お皿との衝突判定
        if (this.fallingSushi && this.plate) {
            this.physics.add.collider(this.fallingSushi, this.plate, () => {
                this.catchSushi(this.fallingSushi);
            });
        }
    }

    private catchSushi(sushi: Phaser.Physics.Arcade.Image): void {
        // キャッチ音（一時的に無効化）
        // this.sound.play('catch', { volume: 0.5 });

        // 物理オブジェクトが存在することを確認
        if (!sushi || !sushi.body) {
            console.error('Sushi object is undefined or has no body');
            return;
        }

        // 寿司を固定
        sushi.setVelocity(0, 0);
        sushi.setImmovable(true);

        // お皿の位置に固定
        const plateX = this.plate.x;
        const plateY = this.plate.y;
        const offsetX = (sushi as any).sushiNumber === 1 ? -25 : 25;
        sushi.setPosition(plateX + offsetX, plateY - 10);

        this.catchedSushi.push({
            sprite: sushi,
            number: (sushi as any).sushiNumber,
            type: (sushi as any).sushiType,
            position: this.getCatPosition()
        });

        // 次の寿司を落とすか判定
        if ((sushi as any).sushiNumber === 1) {
            this.time.delayedCall(500, () => {
                this.dropSushi(2);
            });
        } else {
            this.time.delayedCall(1000, () => {
                this.judgeResult();
            });
        }
    }

    private getCatPosition(): string {
        const catX = this.cat.x;
        return catX < 400 ? 'left' : 'right';
    }

    private moveCat(direction: 'left' | 'right'): void {
        if (this.gameState !== 'falling') return;

        const moveDistance = 50;
        if (direction === 'left' && this.cat.x > 100) {
            this.cat.x -= moveDistance;
            this.plate.x -= moveDistance;
        } else if (direction === 'right' && this.cat.x < 700) {
            this.cat.x += moveDistance;
            this.plate.x += moveDistance;
        }
    }

    private judgeResult(): void {
        this.gameState = 'judging';

        let perfect = true;
        let message = '';

        // 1貫目の判定
        const firstCatched = this.catchedSushi.find(s => s.number === 1);
        if (!firstCatched || 
            firstCatched.type !== this.currentChallenge.first.type ||
            firstCatched.position !== this.currentChallenge.first.position) {
            perfect = false;
        }

        // 2貫目の判定
        const secondCatched = this.catchedSushi.find(s => s.number === 2);
        if (!secondCatched || 
            secondCatched.type !== this.currentChallenge.second.type ||
            secondCatched.position !== this.currentChallenge.second.position) {
            perfect = false;
        }

        // 結果表示
        if (perfect) {
            this.score++;
            message = '完璧ニャ！';
            // this.sound.play('perfect', { volume: 0.7 });
            this.cat.setTexture('cat-happy');
            this.fallSpeed = Math.min(this.fallSpeed + 10, 400); // 少し加速
        } else {
            this.score = 0;
            message = '惜しいニャ…';
            this.fallSpeed = Math.max(this.fallSpeed - 5, 150); // 少し減速
        }

        // 結果テキスト表示（高品質フォント）
        const resultText = this.add.text(400, 300, message, {
            fontSize: '48px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: perfect ? '#32CD32' : '#FF6347',
            stroke: '#000000',
            strokeThickness: 6,
            fontStyle: 'bold'
        });
        resultText.setOrigin(0.5);
        resultText.setResolution(2);

        // スコア更新
        this.scoreText.setText(`連続完璧: ${this.score}`);

        // 2秒後に次のラウンド
        this.time.delayedCall(2000, () => {
            resultText.destroy();
            this.cat.setTexture('cat');
            this.clearCatchedSushi();
            this.startNewRound();
        });
    }

    private clearCatchedSushi(): void {
        this.catchedSushi.forEach(sushi => {
            if (sushi.sprite) {
                sushi.sprite.destroy();
            }
        });
        this.catchedSushi = [];
    }

    update(): void {
        if (this.gameState === 'falling') {
            // キーボード入力処理
            if (this.cursor.left.isDown) {
                this.moveCat('left');
            } else if (this.cursor.right.isDown) {
                this.moveCat('right');
            }
        }
    }
} 