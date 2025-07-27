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
    firstSushi: Phaser.Physics.Arcade.Image;
    secondSushi: Phaser.Physics.Arcade.Image;
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
    private exampleSushi: Phaser.GameObjects.Image[] = [];
    private currentChallenge!: Challenge;
    private fallSpeed: number = 200;
    private moveCooldown: boolean = false; // 連続入力のコールドダウン

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
        this.add.image(400, 300, 'background');

        // スコア表示（高品質フォント）
        this.scoreText = this.add.text(16, 16, 'スコア: 0', {
            fontSize: '28px',
            fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.scoreText.setResolution(2);

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
            if (this.gameState === 'falling' && !this.moveCooldown) {
                if (pointer.x < 400) {
                    this.moveCat('left');
                } else {
                    this.moveCat('right');
                }
                
                // タッチ操作のコールドダウン
                this.moveCooldown = true;
                this.time.delayedCall(150, () => {
                    this.moveCooldown = false;
                });
            }
        });

        // BGM開始（一時的に無効化）
        // this.sound.play('bgm', { loop: true, volume: 0.3 });

        // 最初のラウンド開始
        this.startNewRound();
    }

    private createCatAndPlate(): void {
        // お皿を先に作成
        this.plate = this.add.image(400, 380, 'plate') as Phaser.Physics.Arcade.Image;
        this.physics.add.existing(this.plate, true);
        this.plate.setScale(0.5);
        this.plate.setDepth(0); // 皿を奥に表示
        this.plate.name = 'plate'; // 皿に名前を設定

        // 猫を作成
        this.cat = this.add.image(400, 500, 'cat') as Phaser.Physics.Arcade.Image;
        this.physics.add.existing(this.cat, true);
        this.cat.setScale(0.4);
        this.cat.setDepth(1); // 猫を手前に表示

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
        this.gameState = 'waiting';

        // 落下中の寿司を全てクリア
        this.fallingSushi.forEach(sushi => {
            if (sushi && sushi.body) {
                sushi.destroy();
            }
        });
        this.fallingSushi = [];
        
        // 皿の上の寿司をクリア
        this.clearPlateSushi();

        // 新しいお題を生成
        this.createChallenge();
        
        // お手本を表示
        this.showExample();
    }

    private createChallenge(): void {
        const sushiTypes = ['tuna', 'salmon', 'chutoro', 'ikura', 'shrimp', 'egg', 'uni', 'hotate', 'iwashi', 'tai'];
        const firstSushi = sushiTypes[Math.floor(Math.random() * sushiTypes.length)];
        const secondSushi = sushiTypes[Math.floor(Math.random() * sushiTypes.length)];

        this.currentChallenge = {
            first: firstSushi as SushiType,
            second: secondSushi as SushiType,
            firstSushi: this.add.image(350, 150, `${firstSushi}-sushi`) as Phaser.Physics.Arcade.Image,
            secondSushi: this.add.image(450, 150, `${secondSushi}-sushi`) as Phaser.Physics.Arcade.Image
        };
        this.currentChallenge.firstSushi.setScale(0.4);
        this.currentChallenge.secondSushi.setScale(0.4);
    }

    private showExample(): void {
        // お手本の表示
        this.exampleSushi = [];
        
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

    private hideExample(): void {
        this.exampleSushi.forEach(sushi => sushi.destroy());
        this.exampleSushi = [];
    }

    private startFallingSushi(): void {
        this.gameState = 'falling';
        this.dropSushi(1);
    }

    private dropSushi(sushiNumber: number): void {
        const sushiType = sushiNumber === 1 ? this.currentChallenge.first : this.currentChallenge.second;
        const x = 400; // 中央から落下開始
        
        const sushi = this.physics.add.image(x, 0, `${sushiType}-sushi`) as Phaser.Physics.Arcade.Image;
        sushi.setScale(0.32); // 皿の上の寿司と同じサイズに
        sushi.name = 'sushi'; // 寿司に名前を設定
        
        // 寿司の情報を設定
        (sushi as any).sushiNumber = sushiNumber;
        (sushi as any).sushiType = sushiType;
        (sushi as any).sushiId = Date.now() + Math.random(); // ユニークID
        
        // 重力で落下
        if (sushi.body) {
            (sushi.body as Phaser.Physics.Arcade.Body).setVelocityY(this.fallSpeed);
        }
        
        // プレートとの衝突判定（一度だけ追加）
        if (this.plate.body && sushi.body) {
            const collider = this.physics.add.collider(sushi, this.plate, (obj1: any, obj2: any) => {
                // 衝突判定を即座に削除
                collider.destroy();
                
                // 寿司オブジェクトを特定
                const sushiObj = obj1.name === 'sushi' ? obj1 : (obj2.name === 'sushi' ? obj2 : null);
                
                // 寿司オブジェクトが存在し、まだキャッチされていない場合のみ処理
                if (sushiObj && sushiObj.visible && !sushiObj.catched) {
                    // 実際に皿の上に来ているかチェック
                    const plateBounds = this.plate.getBounds();
                    const sushiBounds = sushiObj.getBounds();
                    
                    console.log('衝突判定:', {
                        sushiY: sushiObj.y,
                        plateY: this.plate.y,
                        sushiBottom: sushiBounds.bottom,
                        plateTop: plateBounds.top,
                        plateBottom: plateBounds.bottom,
                        sushiCenterX: sushiBounds.centerX,
                        plateLeft: plateBounds.left,
                        plateRight: plateBounds.right
                    });
                    
                    // 寿司が皿の上に重なっているかチェック（条件を緩和）
                    if (sushiBounds.bottom >= plateBounds.top - 20 && 
                        sushiBounds.bottom <= plateBounds.bottom + 20 &&
                        sushiBounds.centerX >= plateBounds.left - 30 &&
                        sushiBounds.centerX <= plateBounds.right + 30) {
                        
                        console.log('寿司が皿の上に来ました！');
                        sushiObj.catched = true; // キャッチ済みフラグを設定
                        this.catchSushi(sushiObj);
                    } else {
                        console.log('寿司が皿の上に来ていません');
                    }
                }
            }, undefined, this);
        }
        
        this.fallingSushi.push(sushi);
    }

    private catchSushi(sushi: Phaser.Physics.Arcade.Image): void {
        // 既にキャッチ済みの寿司は処理しない
        if (!sushi.visible) return;
        
        // 同じIDの寿司が既にキャッチされているかチェック
        const sushiId = (sushi as any).sushiId;
        const alreadyCatched = this.catchedSushi.some(catched => 
            (catched.sprite as any).sushiId === sushiId
        );
        if (alreadyCatched) return;
        
        // 物理演算を即座に完全停止
        if (sushi.body) {
            (sushi.body as Phaser.Physics.Arcade.Body).setEnable(false); // 物理ボディを即座に無効化
        }
        
        // 寿司の位置を皿の上に調整（現在位置を基準に）
        const position = this.catchedSushi.length === 1 ? 'left' : 'right';
        const plateX = this.plate.x;
        const offsetX = position === 'left' ? -60 : 10;
        
        // 現在のY位置を皿の上に調整（X位置は現在位置を基準に）
        const targetX = plateX + offsetX;
        const targetY = this.plate.y - 20; // 皿の上に調整（160から20に変更）
        
        // 位置を直接設定（アニメーションなし）
        sushi.setPosition(targetX, targetY);
        sushi.setScale(0.32);
        
        // 表示順序を調整（猫の手前に表示）
        if (position === 'right') {
            sushi.setDepth(3); // 右の寿司を猫の手前に
        } else {
            sushi.setDepth(4); // 左の寿司を猫の手前に
        }
        
        // キャッチした寿司の情報を記録
        this.catchedSushi.push({
            x: targetX,
            y: targetY,
            type: (sushi as any).sushiType,
            sprite: sushi
        });
        
        // fallingSushi配列から削除（皿の上に固定されたので）
        const index = this.fallingSushi.indexOf(sushi);
        if (index > -1) {
            this.fallingSushi.splice(index, 1);
        }
        
        // キャッチ音（一時的に無効化）
        // this.sound.play('catch');
        
        // 1貫目をキャッチしたら2貫目を落とす
        if (this.catchedSushi.length === 1) {
            this.time.delayedCall(500, () => {
                this.dropSushi(2);
            });
        } else if (this.catchedSushi.length >= 2) {
            // 2貫目までキャッチしたら判定
            this.judgeResult();
        }
    }

    private getCatPosition(): string {
        const catX = this.cat.x;
        return catX < 400 ? 'left' : 'right';
    }

    private moveCat(direction: 'left' | 'right'): void {
        if (this.gameState !== 'falling' || this.moveCooldown) return;

        const moveDistance = 30; // 移動距離を50から30に減らす
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

        // 1貫目の判定
        const firstCatched = this.catchedSushi.find(s => s.type === this.currentChallenge.first);
        if (!firstCatched || 
            firstCatched.type !== this.currentChallenge.first) {
            perfect = false;
        } else {
            roundScore += this.sushiScores[firstCatched.type];
        }

        // 2貫目の判定
        const secondCatched = this.catchedSushi.find(s => s.type === this.currentChallenge.second);
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
            // キーボード入力処理（より滑らかな移動）
            if (this.cursor.left.isDown) {
                this.moveCat('left');
            } else if (this.cursor.right.isDown) {
                this.moveCat('right');
            }
            
            // 連続入力の制御（少し遅延を追加）
            if (this.cursor.left.isDown || this.cursor.right.isDown) {
                // 移動の制限（フレームレートに依存しない）
                if (!this.moveCooldown) {
                    this.moveCooldown = true;
                    this.time.delayedCall(100, () => {
                        this.moveCooldown = false;
                    });
                }
            }
            
            // 画面外に出た寿司を削除
            this.fallingSushi = this.fallingSushi.filter(sushi => {
                if (sushi && sushi.y > 650) { // 画面外に出た場合
                    console.log('寿司が画面外に出ました');
                    sushi.destroy();
                    
                    // 1貫目を逃した場合、2貫目を落とす
                    if (this.catchedSushi.length === 0) {
                        console.log('1貫目を逃したので2貫目を落とします');
                        this.time.delayedCall(500, () => {
                            this.dropSushi(2);
                        });
                    }
                    // 2貫目も逃した場合、判定を実行
                    else if (this.catchedSushi.length === 1) {
                        console.log('2貫目も逃したので判定を実行します');
                        this.time.delayedCall(500, () => {
                            this.judgeResult();
                        });
                    }
                    
                    return false;
                }
                return true;
            });
        }
    }
} 