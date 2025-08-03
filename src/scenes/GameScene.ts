interface SushiData {
    x: number;
    y: number;
    type: SushiType;
    sprite: Phaser.Physics.Arcade.Image;
    originalX: number; // プレートに乗った時の元のx座標
}

// 寿司オブジェクトの拡張型定義
interface SushiWithMetadata extends Phaser.Physics.Arcade.Image {
    sushiNumber?: number;
    sushiType?: SushiType;
    sushiId?: number;
    catched?: boolean;
    alreadyCatched?: boolean;
    isSampleSushi?: boolean;
}

type SushiType = 'tuna' | 'salmon' | 'chutoro' | 'ikura' | 'shrimp' | 'egg' | 'uni' | 'hotate' | 'iwashi' | 'tai';

interface Challenge {
    sushiTypes: SushiType[];
    sushiSprites: Phaser.GameObjects.Image[];
}

export default class GameScene extends Phaser.Scene {
    private cat!: Phaser.Physics.Arcade.Image;
    private plate!: Phaser.Physics.Arcade.Image;
    private fallingSushi: SushiWithMetadata[] = [];
    private cursor!: Phaser.Types.Input.Keyboard.CursorKeys;
    private scoreText!: Phaser.GameObjects.Text;
    private resultText!: Phaser.GameObjects.Text;
    private nextButton: Phaser.GameObjects.Text | undefined; // 次ボタンを追加
    private timerText!: Phaser.GameObjects.Text; // タイマー表示用
    private gameState: 'waiting' | 'falling' | 'judging' = 'waiting';
    private score: number = 0;
    private currentRound: number = 0;
    private catchedSushiArray: SushiData[] = [];
    private processedSushiCount: number = 0; // 処理済み寿司のカウンター（避けた+キャッチした）
    private exampleSushi: (Phaser.GameObjects.Image | Phaser.GameObjects.Text)[] = [];
    private currentChallenge!: Challenge;
    private fallSpeed: number = 200;
    private gameTimer!: Phaser.Time.TimerEvent; // 30秒タイマー
    private timeLimit: number = 30000; // 30秒（ミリ秒）
    private maxRounds: number = 5; // 最大ラウンド数
    private remainingTime: number = 30; // 残り時間（秒）
    private challengeCount: number = 2; // チャレンジ数（2〜5個）
    private isMovingLeft: boolean = false;
    private isMovingRight: boolean = false;
    private isKeyboardLeft: boolean = false;
    private isKeyboardRight: boolean = false;
    private isTouchLeft: boolean = false;
    private isTouchRight: boolean = false;

    // 寿司の難易度とスコア
    private readonly sushiScores: Record<SushiType, number> = {
        'tuna': 100,
        'salmon': 100,
        'chutoro': 150,
        'ikura': 120,
        'shrimp': 110,
        'egg': 80,
        'uni': 200,
        'hotate': 130,
        'iwashi': 90,
        'tai': 140
    };

    // 寿司の日本語名を定義
    private readonly sushiNames: Record<SushiType, string> = {
        'tuna': 'マグロ',
        'salmon': 'サーモン',
        'chutoro': '中トロ',
        'ikura': 'いくら',
        'shrimp': 'エビ',
        'egg': '玉子',
        'uni': 'ウニ',
        'hotate': 'ホタテ',
        'iwashi': 'イワシ',
        'tai': 'タイ'
    };

    constructor() {
        super({ key: 'GameScene' });
    }

    create(data?: { challengeCount?: number }): void {
        // チャレンジ数を設定（渡された値があれば使用、なければデフォルト2）
        if (data && data.challengeCount) {
            this.challengeCount = data.challengeCount;
        }

        // 背景
        // this.add.image(400, 300, 'background');

        // スコア表示（高品質フォント）
        this.scoreText = this.add.text(16, 16, 'スコア: 0', {
            fontSize: '28px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.scoreText.setResolution(20);

        // タイマー表示
        this.timerText = this.add.text(16, 60, '残り時間: 30秒', {
            fontSize: '24px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.timerText.setResolution(20);

        // 結果表示テキストを作成
        this.resultText = this.add.text(400, 200, '', {
            fontSize: '24px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            fontStyle: 'bold'
        });
        this.resultText.setOrigin(0.5);
        this.resultText.setVisible(false); // 初期は非表示

        // 猫とお皿の作成
        this.createCatAndPlate();

        // キーボード入力の設定
        this.cursor = this.input.keyboard!.createCursorKeys();

        // タッチ入力の設定（長押し対応）
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (this.gameState === 'falling') {
                if (pointer.x < 400) {
                    this.isTouchLeft = true;
                    this.isTouchRight = false;
                } else {
                    this.isTouchRight = true;
                    this.isTouchLeft = false;
                }
            }
        });

        this.input.on('pointerup', () => {
            if (this.gameState === 'falling') {
                this.isTouchLeft = false;
                this.isTouchRight = false;
            }
        });

        this.input.on('pointerout', () => {
            if (this.gameState === 'falling') {
                this.isTouchLeft = false;
                this.isTouchRight = false;
            }
        });

        // BGM開始（一時的に無効化）
        // this.sound.play('bgm', { loop: true, volume: 0.3 });

        // 最初のラウンド開始
        this.startNewRound();
    }

    private createCatAndPlate(): void {
        // お皿を作成（物理オブジェクトとして）
        this.plate = this.physics.add.image(410, 370, 'plate');
        this.plate.setScale(this.challengeCount >= 3 ? 0.3 + (this.challengeCount - 3) * 0.1 : 0.3, 0.3); // 横方向のみスケール調整、縦は固定
        this.plate.setDepth(2); // 猫よりも前に表示（猫は1）
        this.plate.name = 'plate';

        // 猫を作成（物理オブジェクトとして）
        this.cat = this.physics.add.image(400, 500, 'cat');
        this.cat.setScale(0.4); // 猫のサイズを調整
        this.cat.setDepth(1);
        this.cat.name = 'cat';

        // 物理演算を無効にして固定位置に設定
        if (this.plate.body) {
            this.plate.body.enable = false;
        }
        if (this.cat.body) {
            this.cat.body.enable = false;
        }

        // タッチ入力の設定（より滑らかな操作）
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (this.gameState === 'falling') {
                if (pointer.x < 400) {
                    this.moveCat('left');
                } else {
                    this.moveCat('right');
                }
            }
        });
    }

    private startNewRound(): void {
        this.currentRound++;
        this.gameState = 'waiting';

        // タイマーを停止
        if (this.gameTimer) {
            this.gameTimer.remove();
        }

        // 落下中の寿司を全て削除
        this.fallingSushi.forEach(sushi => {
            if (sushi) {
                sushi.destroy();
            }
        });
        this.fallingSushi = [];

        // 皿の上の寿司を削除
        this.clearPlateSushi();

        // フラグをリセット
        this.catchedSushiArray = [];
        this.processedSushiCount = 0; // カウンターもリセット

        // 新しいチャレンジを作成
        this.createChallenge();

        // 1秒後にサンプルを表示
        this.time.delayedCall(this.currentRound === 1 ? 1000 : 0, () => {
            this.showExample();
        });
    }

    private createChallenge(): void {
        const allSushiTypes = ['tuna', 'salmon', 'chutoro', 'ikura', 'shrimp', 'egg', 'uni', 'hotate', 'iwashi', 'tai'];
        const challengeSushiTypes: SushiType[] = [];
        const challengeSushiSprites: Phaser.GameObjects.Image[] = [];

        // チャレンジ数分の寿司をランダムに選択
        for (let i = 0; i < this.challengeCount; i++) {
            const randomType = allSushiTypes[Math.floor(Math.random() * allSushiTypes.length)] as SushiType;
            challengeSushiTypes.push(randomType);

            // 寿司スプライトを作成
            const sprite = this.add.image(0, 150, `${randomType}-sushi`);
            sprite.setScale(0.4);
            sprite.setVisible(false); // 最初は非表示
            challengeSushiSprites.push(sprite);
        }

        this.currentChallenge = {
            sushiTypes: challengeSushiTypes,
            sushiSprites: challengeSushiSprites
        };
    }

    private showExample(isResultDisplay: boolean = false): void {
        // お手本の表示（isResultDisplay=trueの場合は正解表示）
        this.exampleSushi = [];

        if (isResultDisplay) {
            // 正解表示の場合：右上に表示（サンプルと同じ大きさ）
            const examplePlate = this.add.image(650, 100, 'plate');
            examplePlate.setScale(this.challengeCount >= 3 ? 0.3 + (this.challengeCount - 3) * 0.1 : 0.3, 0.3); // 横方向のみスケール調整、縦は固定
            examplePlate.setDepth(10); // 手前に表示
            this.exampleSushi.push(examplePlate);

            const spacing = 60; // 2個の時は80px間隔
            const totalWidth = spacing * (this.challengeCount - 1);
            const startX = 650 - (totalWidth / 2); // 右上から左右に配置

            // 正解表示の場合：チャレンジの正解順番を表示
            this.currentChallenge.sushiSprites.forEach((_, index) => {
                const newSprite = this.add.image(0, 80, `${this.currentChallenge.sushiTypes[index]}-sushi`);
                newSprite.setScale(0.4); // サンプルと同じ大きさ
                const x = startX + (index * spacing);
                newSprite.setPosition(x, 80);
                newSprite.setDepth(15 - index);
                newSprite.setScale(0.32); // サンプルと同じ大きさ
                this.exampleSushi.push(newSprite);
            });

            // 「これが正解」の文字を追加
            const correctText = this.add.text(650, 130, 'これが正解だよ', {
                fontSize: '16px',
                fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3,
                fontStyle: 'bold'
            });
            correctText.setOrigin(0.5);
            correctText.setDepth(10);
            this.exampleSushi.push(correctText);
        } else {
            // チャレンジ数に応じて寿司を配置
            let spacing: number;
            spacing = 100

            const totalWidth = spacing * (this.challengeCount - 1);
            const startX = 400 - (totalWidth / 2); // 中央から左右に配置

            // 通常のサンプル表示の場合：チャレンジの寿司を表示
            this.currentChallenge.sushiSprites.forEach((sprite, index) => {
                sprite.setVisible(true);
                const x = startX + (index * spacing);
                sprite.setPosition(x, 150);
                sprite.setDepth(20 - index);
                this.exampleSushi.push(sprite);
            });
        }

        // 表示時間を設定
        if (!isResultDisplay) {
            const displayTime = 1000 + (this.challengeCount - 2) * 300;

            this.time.delayedCall(displayTime, () => {
                this.exampleSushi.forEach(sushi => sushi.destroy());
                this.exampleSushi = [];
                if (!isResultDisplay) {
                    this.startFallingSushi();
                }
            });
        }
    }

    private startFallingSushi(): void {
        this.gameState = 'falling';
        this.remainingTime = 30; // 残り時間をリセット
        this.updateTimerDisplay(); // タイマー表示を更新

        // 既存のタイマーを停止
        if (this.gameTimer) {
            this.gameTimer.remove();
        }

        this.dropSushi(1);

        // 30秒タイマー開始
        this.gameTimer = this.time.delayedCall(this.timeLimit, () => {
            if (this.gameState === 'falling') {
                this.forceJudgeResult();
            }
        });
    }

    private forceJudgeResult(): void {
        this.gameState = 'judging';

        // タイマーを停止
        if (this.gameTimer) {
            this.gameTimer.remove();
        }

        // 時間切れメッセージを表示
        this.resultText.setText('時間切れ！');
        this.resultText.setVisible(true);

        // 1秒後に判定実行
        this.time.delayedCall(1000, () => {
            this.judgeResult();
        });
    }

    private dropSushi(sushiNumber: number): void {
        // サンプルの寿司か、ランダムな寿司かを決定
        const shouldDropSample = Math.random() < 0.6; // 60%の確率でサンプルの寿司

        let sushiType: SushiType;
        if (shouldDropSample && sushiNumber <= this.challengeCount) {
            // サンプルの寿司を落とす
            sushiType = this.currentChallenge.sushiTypes[sushiNumber - 1];
        } else {
            // サンプルとは別のランダムな寿司を落とす
            const allSushiTypes: SushiType[] = ['tuna', 'salmon', 'chutoro', 'ikura', 'shrimp', 'egg', 'uni', 'hotate', 'iwashi', 'tai'];
            const sampleSushiTypes = this.currentChallenge.sushiTypes;
            const nonSampleSushiTypes = allSushiTypes.filter(type => !sampleSushiTypes.includes(type));
            sushiType = nonSampleSushiTypes[Math.floor(Math.random() * nonSampleSushiTypes.length)];
        }

        const x = Math.random() * 400 + 200; // 200から600のランダムな位置から落下

        const sushi = this.physics.add.image(x, 0, `${sushiType}-sushi`) as SushiWithMetadata;
        sushi.setScale(0.32); // 皿の上の寿司と同じサイズに
        sushi.name = 'sushi'; // 寿司に名前を設定

        // 落下中の寿司の深度を設定（お皿より手前、固定深度）
        sushi.setDepth(15); // お皿より手前に表示されるように設定

        // 寿司の情報を設定
        sushi.sushiNumber = sushiNumber;
        sushi.sushiType = sushiType;
        sushi.sushiId = Date.now() + Math.random(); // ユニークID
        sushi.catched = false; // キャッチ済みフラグを初期化
        sushi.alreadyCatched = false; // 処理済みフラグを初期化
        sushi.isSampleSushi = shouldDropSample; // サンプルの寿司かどうかのフラグ

        // 重力で落下
        if (sushi.body && 'setVelocityY' in sushi.body) {
            (sushi.body as Phaser.Physics.Arcade.Body).setVelocityY(this.fallSpeed);
        }

        // プレートとの衝突判定は削除（物理演算に影響するため）
        // 代わりにupdate()で位置をチェックする

        this.fallingSushi.push(sushi);

        // 落下中の寿司の深度を調整
        this.updateFallingSushiDepth();
    }

    private catchSushi(sushi: SushiWithMetadata): void {
        // 既に処理済みの場合は何もしない
        if (!sushi.visible || sushi.alreadyCatched) {
            return;
        }

        // 処理済みフラグを設定
        sushi.alreadyCatched = true;

        // 物理演算を無効化
        if (sushi.body) {
            sushi.body.enable = false;
        }

        // 寿司の位置を皿の上に調整（当たった位置をそのまま使用）
        const currentSushiX = sushi.x; // 寿司が当たったX位置をそのまま使用
        const targetX = currentSushiX; // 当たった位置をそのまま使用
        const targetY = this.plate.y - 20; // 皿の上に調整

        // 位置を直接設定（アニメーションなし）
        sushi.setPosition(targetX, targetY);
        sushi.setScale(0.32);

        // 表示順序は後でupdate()で調整するため、ここでは設定しない
        sushi.setDepth(15); // お皿より手前に表示されるように設定

        // キャッチした寿司の情報を記録
        this.catchedSushiArray.push({
            x: targetX,
            y: targetY,
            type: sushi.sushiType!,
            sprite: sushi,
            originalX: sushi.x - this.plate.x // プレート上の相対位置を保存
        });

        // 処理済みカウンターを増やす
        this.processedSushiCount++;

        // fallingSushi配列から削除（皿の上に固定されたので）
        const index = this.fallingSushi.indexOf(sushi);
        if (index > -1) {
            this.fallingSushi.splice(index, 1);
        }

        // 寿司が皿に追加されたので深度を再調整（最後に実行）
        this.updateAllSushiDepth();

        // キャッチ音（一時的に無効化）
        // this.sound.play('catch');

        // 次の寿司を落とすか判定する
        if (this.catchedSushiArray.length < this.challengeCount) {
            // まだ全ての寿司をキャッチしていない場合、次の寿司を落とす
            this.time.delayedCall(500, () => {
                this.dropSushi(this.catchedSushiArray.length + 1);
            });
        } else {
            // 全ての寿司をキャッチしたら判定
            this.judgeResult();
        }
    }

    private moveCat(direction: 'left' | 'right'): void {
        if (this.gameState !== 'falling') return;

        const moveDistance = 8; // 移動距離を30から8に減らす（より細かい動き）
        if (direction === 'left' && this.cat.x > 100) {
            this.cat.x -= moveDistance;
            this.plate.x -= moveDistance;

            // 皿の上の寿司も一緒に移動
            this.catchedSushiArray.forEach(sushiData => {
                sushiData.sprite.x -= moveDistance;
                sushiData.x -= moveDistance; // 配列内の座標も更新
            });
        } else if (direction === 'right' && this.cat.x < 700) {
            this.cat.x += moveDistance;
            this.plate.x += moveDistance;

            // 皿の上の寿司も一緒に移動
            this.catchedSushiArray.forEach(sushiData => {
                sushiData.sprite.x += moveDistance;
                sushiData.x += moveDistance; // 配列内の座標も更新
            });
        }

        // 移動後に深度を再調整
        if (this.catchedSushiArray.length >= 2) {
            this.updateAllSushiDepth();
        }

        // 落下中の寿司の深度も調整
        this.updateFallingSushiDepth();
    }

    private judgeResult(): void {
        this.gameState = 'judging';

        // タイマーを停止
        if (this.gameTimer) {
            this.gameTimer.remove();
        }

        let perfect = true;
        let message = '';
        let roundScore = 0;
        let orderBonus = 0;

        // キャッチした寿司のみを判定対象とする
        const actuallyCatched = this.catchedSushiArray;

        // スコア計算とパーフェクト判定を統合
        const expectedTypes = this.currentChallenge.sushiTypes;
        const catchedExpectedSushi: SushiData[] = [];

        // 実際にキャッチした寿司が期待する寿司の中にあれば加算
        actuallyCatched.forEach(sushiData => {
            const expectedIndex = expectedTypes.indexOf(sushiData.type);
            if (expectedIndex !== -1) {
                // 期待する寿司の中に実際にキャッチした寿司がある場合のみスコアを加算
                roundScore += this.sushiScores[sushiData.type];
                catchedExpectedSushi.push(sushiData);
            }
        });

        // パーフェクト判定（全ての期待する寿司をキャッチしているか）
        perfect = expectedTypes.every(expectedType =>
            catchedExpectedSushi.some(catched => catched.type === expectedType)
        );

        // 順番一致の判定（プレートに乗った時の位置でソートしてから判定）
        if (actuallyCatched.length >= this.challengeCount) {
            // プレートに乗った時の元の位置でソートした寿司の配列を作成
            const sortedByOriginalX = [...actuallyCatched].sort((a, b) => a.originalX - b.originalX);

            let orderPerfect = true;
            for (let i = 0; i < this.challengeCount; i++) {
                if (sortedByOriginalX[i].type !== this.currentChallenge.sushiTypes[i]) {
                    orderPerfect = false;
                    break;
                }
            }

            if (orderPerfect) {
                orderBonus = 100; // 順番一致ボーナス
            } else {
                // 順番が間違っている場合のみ正解を表示
                this.showExample(true); // 正解表示モードで呼び出し
            }
        }

        // 結果表示（統合されたロジックを使用）
        if (roundScore > 0) {
            // 期待する寿司をキャッチした場合のみ表示
            catchedExpectedSushi.forEach(sushiData => {
                message += `${this.sushiNames[sushiData.type]}: ${this.sushiScores[sushiData.type]}点\n`;
            });

            if (perfect && orderBonus > 0) {
                message += '\n順番パーフェクト！\n';
                message += `順番一致ボーナス: +${orderBonus}点\n`;
                message += `\n合計: ${roundScore + orderBonus}点`;
                this.score += roundScore + orderBonus;
            } else {
                message += `\n合計: ${roundScore}点`;
                this.score += roundScore;
            }
        } else {
            message = '頑張って！p(^_^)q';
        }

        this.resultText.setText(message);
        this.resultText.setVisible(true);
        this.scoreText.setText(`スコア: ${this.score} (${this.currentRound}/${this.maxRounds})`);

        // 次ボタンを作成
        this.nextButton = this.add.text(650, 300, '次へ →', {
            fontSize: '24px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            backgroundColor: '#228B22',
            padding: { x: 20, y: 10 },
            stroke: '#000000',
            strokeThickness: 2
        });
        this.nextButton.setOrigin(0.5);
        this.nextButton.setInteractive();
        this.nextButton.on('pointerdown', () => {
            this.goToNextRound();
        });

        // 自動で次のラウンドに進む処理を削除
        // this.time.delayedCall(displayTime, () => { ... });
    }

    private endGame(): void {
        this.gameState = 'judging';

        const finalMessage = `ゲーム終了！\n\n最終スコア: ${this.score}点\n\nお疲れさまでした🍵`;
        this.resultText.setText(finalMessage);
        this.resultText.setVisible(true);

        const restartButton = this.add.text(650, 300, 'もう一回 →', {
            fontSize: '24px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            backgroundColor: '#228B22',
            padding: { x: 20, y: 10 },
            stroke: '#000000',
            strokeThickness: 2
        });
        restartButton.setOrigin(0.5);
        restartButton.setInteractive();
        restartButton.on('pointerdown', () => {
            //リセットしてゲームを再開
            this.currentRound = 0;
            this.score = 0;
            this.gameState = 'waiting';
            this.fallingSushi = [];
            this.catchedSushiArray = [];
            this.processedSushiCount = 0;
            this.exampleSushi = [];
            this.scene.start('ChallengeSelectionScene');
        });
        this.input.keyboard?.on('keydown-RIGHT', () => {
            //リセットしてゲームを再開
            this.currentRound = 0;
            this.score = 0;
            this.gameState = 'waiting';
            this.fallingSushi = [];
            this.catchedSushiArray = [];
            this.processedSushiCount = 0;
            this.exampleSushi = [];
            this.scene.start('ChallengeSelectionScene');
        });
    }

    private clearCatchedSushi(): void {
        this.catchedSushiArray.forEach(sushi => {
            if (sushi.sprite) {
                sushi.sprite.destroy();
            }
        });
        this.catchedSushiArray = [];
    }

    private clearPlateSushi(): void {
        // 皿の上の寿司を全て削除
        this.catchedSushiArray.forEach(sushiData => {
            if (sushiData.sprite) {
                sushiData.sprite.destroy();
            }
        });
        this.catchedSushiArray = [];
    }

    private updateAllSushiDepth(): void {
        // 皿の上の寿司のみを対象とする（落下中の寿司は除外）
        const plateSushi: Array<{ sprite: Phaser.GameObjects.Image, x: number }> = [];

        // 皿の上の寿司を追加
        this.catchedSushiArray.forEach(sushiData => {
            plateSushi.push({
                sprite: sushiData.sprite,
                x: sushiData.x
            });
        });

        // 皿の上の寿司が2つ以上ある場合のみ深度を調整
        if (plateSushi.length >= 2) {
            // X座標でソート（左から右）
            const sortedSushi = plateSushi.sort((a, b) => a.x - b.x);

            // 左から右に奥行きを設定（左が手前、右が奥）
            sortedSushi.forEach((sushi, index) => {
                // 左から順番に深度を設定（左が手前、右が奥）
                // Phaserでは深度値が大きいほど手前に表示される
                sushi.sprite.setDepth(10 - index); // 10, 9, 8, 7... の順で深度を設定
            });
        }
    }

    private updateFallingSushiDepth(): void {
        // 落下中の寿司と皿の上の寿司を全て収集
        const allSushi: Array<{ sprite: Phaser.GameObjects.Image, x: number, isFalling: boolean }> = [];

        // 皿の上の寿司を追加
        this.catchedSushiArray.forEach(sushiData => {
            allSushi.push({
                sprite: sushiData.sprite,
                x: sushiData.x,
                isFalling: false
            });
        });

        // 落下中の寿司を追加
        this.fallingSushi.forEach(sushi => {
            allSushi.push({
                sprite: sushi,
                x: sushi.x,
                isFalling: true
            });
        });

        // 全ての寿司が存在する場合のみ深度を調整
        if (allSushi.length >= 2) {
            // X座標でソート（左から右）
            const sortedSushi = allSushi.sort((a, b) => a.x - b.x);

            // 左から右に奥行きを設定（左が手前、右が奥）
            sortedSushi.forEach((sushi, index) => {
                // 左から順番に深度を設定（左が手前、右が奥）
                // Phaserでは深度値が大きいほど手前に表示される
                sushi.sprite.setDepth(15 - index); // 15, 14, 13, 12... の順で深度を設定
            });
        }
    }

    private updateTimerDisplay(): void {
        if (this.timerText) {
            this.timerText.setText(`残り時間: ${this.remainingTime}秒`);

            // 残り時間に応じて色を変更
            if (this.remainingTime <= 5) {
                this.timerText.setColor('#ff0000'); // 赤色
            } else if (this.remainingTime <= 10) {
                this.timerText.setColor('#ffff00'); // 黄色
            } else {
                this.timerText.setColor('#ffffff'); // 白色
            }
        }
    }

    private goToNextRound(): void {
        // 次ボタンを削除
        if (this.nextButton) {
            this.nextButton.destroy();
            this.nextButton = undefined;
        }

        // 正解表示も確実に削除
        this.exampleSushi.forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        this.exampleSushi = [];

        this.resultText.setVisible(false);
        this.clearCatchedSushi();
        this.clearPlateSushi();

        if (this.currentRound >= this.maxRounds) {
            this.endGame();
        } else {
            this.startNewRound();
        }
    }

    update(): void {
        if (this.gameState === 'falling') {
            // キーボード入力処理
            if (this.cursor.left.isDown) {
                this.isKeyboardLeft = true;
                this.isKeyboardRight = false;
            } else if (this.cursor.right.isDown) {
                this.isKeyboardRight = true;
                this.isKeyboardLeft = false;
            } else {
                // キーボードが離された時はキーボードフラグのみリセット
                this.isKeyboardLeft = false;
                this.isKeyboardRight = false;
            }

            // 移動状態を統合（キーボードまたはタッチのどちらかがアクティブなら移動）
            this.isMovingLeft = this.isKeyboardLeft || this.isTouchLeft;
            this.isMovingRight = this.isKeyboardRight || this.isTouchRight;

            // 移動処理（毎フレーム実行）
            if (this.isMovingLeft) {
                this.moveCat('left');
            } else if (this.isMovingRight) {
                this.moveCat('right');
            }

            // タイマー更新
            if (this.gameTimer && this.remainingTime > 0) {
                const elapsed = this.timeLimit - this.gameTimer.getElapsed();
                this.remainingTime = Math.max(0, Math.ceil(elapsed / 1000));
                this.updateTimerDisplay();
            }
        } else if (this.gameState === 'judging') {
            // 判定中は→キーで次のラウンドに進む
            if (this.cursor.right.isDown) {
                this.goToNextRound();
            }
        }

        // 画面外に出た寿司を削除
        this.fallingSushi = this.fallingSushi.filter(sushi => {
            if (sushi && sushi.y > 650) {
                sushi.destroy();

                // 寿司が画面外に出た場合の処理
                if (this.catchedSushiArray.length < this.challengeCount) {
                    // まだ全ての寿司をキャッチしていない場合、次の寿司を落とす
                    const nextSushiNumber = this.catchedSushiArray.length + 1;
                    this.time.delayedCall(500, () => {
                        this.dropSushi(nextSushiNumber);
                    });
                } else {
                    this.judgeResult();
                }

                return false;
            }
            return true;
        });

        // 落下中の寿司の位置をチェック（処理済みは削除）
        this.fallingSushi = this.fallingSushi.filter(sushi => {
            if (sushi.visible && !sushi.catched) {
                // お皿との位置関係をチェック
                const plateBounds = this.plate.getBounds();
                const sushiBounds = sushi.getBounds();
                const verticalDistance = Math.abs(sushiBounds.bottom - plateBounds.bottom);
                const horizontalDistance = Math.abs(sushiBounds.centerX - (plateBounds.left + plateBounds.right) / 2);
                const allowedHorizontalDistance = 100 + (this.challengeCount - 3) * 20;
                if (verticalDistance <= 60 && horizontalDistance <= allowedHorizontalDistance) {
                    // 処理済みフラグを設定
                    sushi.catched = true;
                    this.catchSushi(sushi);
                    return false;
                }
            }

            // 処理されていない寿司は残す
            return true;
        });
    }
}