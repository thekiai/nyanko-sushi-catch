interface SushiData {
    x: number;
    y: number;
    type: SushiType;
    sprite: Phaser.Physics.Arcade.Image;
}

type SushiType = 'tuna' | 'salmon' | 'chutoro' | 'ikura' | 'shrimp' | 'egg' | 'uni' | 'hotate' | 'iwashi' | 'tai';

interface Challenge {
    first: SushiType;
    second: SushiType;
    firstSushi: Phaser.GameObjects.Image;
    secondSushi: Phaser.GameObjects.Image;
}

export default class GameScene extends Phaser.Scene {
    private cat!: Phaser.Physics.Arcade.Image;
    private plate!: Phaser.Physics.Arcade.Image;
    private fallingSushi: Phaser.Physics.Arcade.Image[] = [];
    private cursor!: Phaser.Types.Input.Keyboard.CursorKeys;
    private scoreText!: Phaser.GameObjects.Text;
    private resultText!: Phaser.GameObjects.Text;
    private gameState: 'waiting' | 'falling' | 'judging' = 'waiting';
    private score: number = 0;
    private currentRound: number = 0;
    private catchedSushi: SushiData[] = [];
    private processedSushiCount: number = 0; // 処理済み寿司のカウンター（避けた+キャッチした）
    private exampleSushi: Phaser.GameObjects.Image[] = [];
    private currentChallenge!: Challenge;
    private fallSpeed: number = 200;
    // private moveCooldown: boolean = false; // 連続入力のコールドダウン（削除）

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

        // 結果表示テキストを作成
        this.resultText = this.add.text(400, 300, '', {
            fontSize: '48px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            fontStyle: 'bold'
        });
        this.resultText.setOrigin(0.5);
        this.resultText.setVisible(false); // 初期は非表示

        // 猫とお皿の作成
        this.createCatAndPlate();

        // キーボード入力の設定
        this.cursor = this.input.keyboard!.createCursorKeys();

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

        // BGM開始（一時的に無効化）
        // this.sound.play('bgm', { loop: true, volume: 0.3 });

        // 最初のラウンド開始
        this.startNewRound();
    }

    private createCatAndPlate(): void {
        // お皿を作成（物理オブジェクトとして）
        this.plate = this.physics.add.image(380, 370, 'plate');
        this.plate.setScale(0.3); // お皿のサイズを小さく調整
        this.plate.setDepth(2); // 猫よりも前に表示（猫は1）
        this.plate.setRotation(-0.20); // 反時計回りに20度回転（ラジアンで約0.20）
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
        this.catchedSushi = [];
        this.processedSushiCount = 0; // カウンターもリセット
        
        // 新しいチャレンジを作成
        this.createChallenge();
        
        // 3秒後にサンプルを表示
        this.time.delayedCall(1000, () => {
            this.showExample();
        });
    }

    private createChallenge(): void {
        const sushiTypes = ['tuna', 'salmon', 'chutoro', 'ikura', 'shrimp', 'egg', 'uni', 'hotate', 'iwashi', 'tai'];
        const firstSushi = sushiTypes[Math.floor(Math.random() * sushiTypes.length)];
        const secondSushi = sushiTypes[Math.floor(Math.random() * sushiTypes.length)];

        this.currentChallenge = {
            first: firstSushi as SushiType,
            second: secondSushi as SushiType,
            firstSushi: this.add.image(350, 150, `${firstSushi}-sushi`),
            secondSushi: this.add.image(450, 150, `${secondSushi}-sushi`)
        };
        this.currentChallenge.firstSushi.setScale(0.4);
        this.currentChallenge.secondSushi.setScale(0.4);
        this.currentChallenge.firstSushi.setFlipX(true); // 左右に反転
        this.currentChallenge.secondSushi.setFlipX(true); // 左右に反転
        
        // 最初は非表示にする
        this.currentChallenge.firstSushi.setVisible(false);
        this.currentChallenge.secondSushi.setVisible(false);
    }

    private showExample(): void {
        // お手本の表示
        this.exampleSushi = [];
        
        // お手本用のお皿を作成
        const examplePlate = this.add.image(400, 180, 'plate');
        examplePlate.setScale(0.3);
        examplePlate.setRotation(-0.20); // 反時計回りに20度回転
        examplePlate.setDepth(-2); // 背景に表示
        this.exampleSushi.push(examplePlate);

        // 寿司を表示する
        this.currentChallenge.firstSushi.setVisible(true);
        this.currentChallenge.secondSushi.setVisible(true);
        
        // 1貫目（左側）
        this.currentChallenge.firstSushi.setPosition(350, 150);
        this.exampleSushi.push(this.currentChallenge.firstSushi);

        // 2貫目（右側）
        this.currentChallenge.secondSushi.setPosition(450, 150);
        this.exampleSushi.push(this.currentChallenge.secondSushi);

        // 1秒後に消去してゲーム開始
        this.time.delayedCall(1000, () => {
            this.exampleSushi.forEach(sushi => sushi.destroy());
            this.exampleSushi = [];
            this.startFallingSushi();
        });
    }

    private startFallingSushi(): void {
        this.gameState = 'falling';
        this.dropSushi(1);
    }

    private dropSushi(sushiNumber: number): void {
        // サンプルの寿司か、ランダムな寿司かを決定
        const shouldDropSample = Math.random() < 0.6; // 60%の確率でサンプルの寿司
        
        let sushiType: SushiType;
        if (shouldDropSample) {
            // サンプルの寿司を落とす
            sushiType = sushiNumber === 1 ? this.currentChallenge.first : this.currentChallenge.second;
        } else {
            // サンプルとは別のランダムな寿司を落とす
            const allSushiTypes: SushiType[] = ['tuna', 'salmon', 'chutoro', 'ikura', 'shrimp', 'egg', 'uni', 'hotate', 'iwashi', 'tai'];
            const sampleSushiTypes = [this.currentChallenge.first, this.currentChallenge.second];
            const nonSampleSushiTypes = allSushiTypes.filter(type => !sampleSushiTypes.includes(type));
            sushiType = nonSampleSushiTypes[Math.floor(Math.random() * nonSampleSushiTypes.length)];
        }
        
        const x = Math.random() * 800; // 0から800のランダムな位置から落下
        
        const sushi = this.physics.add.image(x, 0, `${sushiType}-sushi`);
        sushi.setScale(0.32); // 皿の上の寿司と同じサイズに
        sushi.setFlipX(true); // 左右に反転
        sushi.name = 'sushi'; // 寿司に名前を設定
        
        // 寿司の情報を設定
        (sushi as any).sushiNumber = sushiNumber;
        (sushi as any).sushiType = sushiType;
        (sushi as any).sushiId = Date.now() + Math.random(); // ユニークID
        (sushi as any).catched = false; // キャッチ済みフラグを初期化
        (sushi as any).alreadyCatched = false; // 処理済みフラグを初期化
        (sushi as any).isSampleSushi = shouldDropSample; // サンプルの寿司かどうかのフラグ
        
        // 重力で落下
        if (sushi.body) {
            sushi.body.setVelocityY(this.fallSpeed);
        }
        
        // プレートとの衝突判定は削除（物理演算に影響するため）
        // 代わりにupdate()で位置をチェックする
        
        this.fallingSushi.push(sushi);
    }

    private catchSushi(sushi: Phaser.Physics.Arcade.Image): void {
        // 既に処理済みの場合は何もしない
        if (!sushi.visible || (sushi as any).alreadyCatched) {
            console.log('既に処理済みの寿司です');
            return;
        }
        
        // 処理済みフラグを設定
        (sushi as any).alreadyCatched = true;
        
        console.log('寿司をキャッチしました！');
        
        // 物理演算を無効化
        if (sushi.body) {
            sushi.body.enable = false;
        }
        
        // 寿司の位置を皿の上に調整（現在位置を基準に）
        const position = this.catchedSushi.length === 1 ? 'left' : 'right';
        const plateX = this.plate.x;
        const offsetX = position === 'left' ? -60 : 10;
        
        // 現在のY位置を皿の上に調整（X位置は現在位置を基準に）
        const targetX = plateX + offsetX;
        const targetY = this.plate.y - 20; // 皿の上に調整（160から20に変更）
        
        console.log('寿司の位置を調整します:', { targetX, targetY, position });
        
        // 位置を直接設定（アニメーションなし）
        sushi.setPosition(targetX, targetY);
        sushi.setScale(0.32);
        sushi.setFlipX(true); // 左右に反転
        
        // 表示順序を調整（猫の手前に表示）
        if (position === 'right') {
            sushi.setDepth(4); // 右の寿司を猫の手前に（手前）
        } else {
            sushi.setDepth(3); // 左の寿司を猫の手前に（奥）
        }
        
        console.log('寿司をcatchedSushiに追加します');
        
        // キャッチした寿司の情報を記録
        this.catchedSushi.push({
            x: targetX,
            y: targetY,
            type: (sushi as any).sushiType,
            sprite: sushi
        });
        
        // 処理済みカウンターを増やす
        this.processedSushiCount++;
        
        // fallingSushi配列から削除（皿の上に固定されたので）
        const index = this.fallingSushi.indexOf(sushi);
        if (index > -1) {
            console.log('fallingSushiから削除します');
            this.fallingSushi.splice(index, 1);
        }
        
        console.log('キャッチ処理完了、次の寿司を落とします');
        
        // キャッチ音（一時的に無効化）
        // this.sound.play('catch');
        
        // 1貫目をキャッチしたら2貫目を落とす
        if (this.processedSushiCount === 1) {
            this.time.delayedCall(500, () => {
                this.dropSushi(2);
            });
        } else if (this.processedSushiCount >= 2) {
            // 2貫目まで処理したら判定
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
            this.catchedSushi.forEach(sushiData => {
                sushiData.sprite.x -= moveDistance;
            });
        } else if (direction === 'right' && this.cat.x < 700) {
            this.cat.x += moveDistance;
            this.plate.x += moveDistance;
            
            // 皿の上の寿司も一緒に移動
            this.catchedSushi.forEach(sushiData => {
                sushiData.sprite.x += moveDistance;
            });
        }
    }

    private judgeResult(): void {
        this.gameState = 'judging';

        let perfect = true;
        let message = '';
        let roundScore = 0;

        // キャッチした寿司のみを判定対象とする
        const actuallyCatched = this.catchedSushi;

        // 1貫目の判定
        const firstCatched = actuallyCatched.find(s => s.type === this.currentChallenge.first);
        if (!firstCatched || 
            firstCatched.type !== this.currentChallenge.first) {
            perfect = false;
        } else {
            roundScore += this.sushiScores[firstCatched.type];
        }

        // 2貫目の判定
        const secondCatched = actuallyCatched.find(s => s.type === this.currentChallenge.second);
        if (!secondCatched || 
            secondCatched.type !== this.currentChallenge.second) {
            perfect = false;
        } else {
            roundScore += this.sushiScores[secondCatched.type];
        }

        // 結果表示
        if (perfect) {
            message = `パーフェクト！\n+${roundScore}点`;
            this.score += roundScore;
            // this.sound.play('perfect');
        } else {
            message = '残念...\n+0点';
        }

        this.resultText.setText(message);
        this.resultText.setVisible(true);
        this.scoreText.setText(`スコア: ${this.score}`);

        // 3秒後に次のラウンド
        this.time.delayedCall(3000, () => {
            this.resultText.setVisible(false);
            this.clearCatchedSushi();
            this.clearPlateSushi(); // 皿の上の寿司もクリア
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

    private clearPlateSushi(): void {
        // 皿の上の寿司を全て削除
        this.catchedSushi.forEach(sushiData => {
            if (sushiData.sprite) {
                sushiData.sprite.destroy();
            }
        });
        this.catchedSushi = [];
    }

    update(): void {
        if (this.gameState === 'falling') {
            // キーボード入力処理（滑らかな移動）
            if (this.cursor.left.isDown) {
                this.moveCat('left');
            } else if (this.cursor.right.isDown) {
                this.moveCat('right');
            }
        }
        
        // 画面外に出た寿司を削除
        this.fallingSushi = this.fallingSushi.filter(sushi => {
            if (sushi && sushi.y > 650) {
                console.log('寿司が画面外に出ました');
                sushi.destroy();
                
                // 寿司が画面外に出た場合の処理
                if (this.catchedSushi.length === 0) {
                    // 1貫目が画面外に出た場合、2貫目を落とす
                    this.time.delayedCall(500, () => {
                        this.dropSushi(2);
                    });
                } else if (this.catchedSushi.length === 1) {
                    // 2貫目が画面外に出た場合、判定を実行
                    this.time.delayedCall(500, () => {
                        this.judgeResult();
                    });
                }
                
                return false;
            }
            return true;
        });
        
        // 落下中の寿司の位置をチェック（処理済みは削除）
        this.fallingSushi = this.fallingSushi.filter(sushi => {
            if (sushi.visible && !(sushi as any).catched) {
                // お皿との位置関係をチェック
                const plateBounds = this.plate.getBounds();
                const sushiBounds = sushi.getBounds();
                
                console.log('寿司チェック:', {
                    sushiId: (sushi as any).sushiId,
                    catched: (sushi as any).catched,
                    alreadyCatched: (sushi as any).alreadyCatched,
                    sushiY: sushi.y,
                    plateY: this.plate.y,
                    distance: Math.abs(sushi.y - this.plate.y)
                });
                
                // 寿司がお皿の上に来ているかチェック（より簡単な判定）
                const verticalDistance = Math.abs(sushiBounds.bottom - plateBounds.top);
                const horizontalDistance = Math.abs(sushiBounds.centerX - (plateBounds.left + plateBounds.right) / 2);
                
                if (verticalDistance <= 60 && horizontalDistance <= 80) {
                    
                    console.log('寿司がお皿の上に来ました！', {
                        sushiBottom: sushiBounds.bottom,
                        plateTop: plateBounds.top,
                        plateBottom: plateBounds.bottom,
                        sushiCenterX: sushiBounds.centerX,
                        plateLeft: plateBounds.left,
                        plateRight: plateBounds.right,
                        verticalDistance,
                        horizontalDistance
                    });
                    
                    console.log('寿司がお皿の上に来ました！');
                    
                    // 処理済みフラグを設定
                    (sushi as any).catched = true;
                    
                    // サンプルと同じ寿司かチェック
                    const currentSushiType = (sushi as any).sushiType;
                    const isSampleSushi = (sushi as any).isSampleSushi;
                    const expectedSushiType = this.processedSushiCount === 0 ? 
                        this.currentChallenge.first : this.currentChallenge.second;
                    
                    console.log('寿司判定詳細:', {
                        currentSushiType,
                        expectedSushiType,
                        isSampleSushi,
                        catchedSushiLength: this.catchedSushi.length,
                        processedSushiCount: this.processedSushiCount,
                        firstChallenge: this.currentChallenge.first,
                        secondChallenge: this.currentChallenge.second,
                        isMatch: currentSushiType === expectedSushiType
                    });
                    
                    // サンプルの寿司で、期待される寿司と一致する場合のみキャッチ
                    if (isSampleSushi && currentSushiType === expectedSushiType) {
                        // サンプルの寿司で、期待される寿司と一致する場合、キャッチ処理
                        console.log(`サンプルの寿司（${currentSushiType}）が来たのでキャッチします`);
                        this.catchSushi(sushi);
                        
                        // キャッチした寿司はfallingSushiから削除（重複処理を防ぐ）
                        return false;
                    } else {
                        // サンプルではない寿司、または期待される寿司と一致しない場合もお皿に乗せる
                        console.log(`お題ではない寿司（${currentSushiType}）もお皿に乗せます`);
                        this.catchSushi(sushi);
                        
                        // キャッチした寿司はfallingSushiから削除（重複処理を防ぐ）
                        return false;
                    }
                }
            }
            
            // 処理されていない寿司は残す
            return true;
        });
    }
}