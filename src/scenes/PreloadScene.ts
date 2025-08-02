export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload(): void {
        // ローディングバーの作成
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const loadingText = this.add.text(width / 2, height / 2 - 50, '読み込み中...', {
            font: '20px Arial',
            color: '#ffffff'
        });
        loadingText.setResolution(2);
        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.add.text(width / 2, height / 2 - 5, '0%', {
            font: '18px Arial',
            color: '#ffffff'
        });
        percentText.setResolution(2);
        percentText.setOrigin(0.5, 0.5);

        const assetText = this.add.text(width / 2, height / 2 + 50, '', {
            font: '14px Arial',
            color: '#ffffff'
        });
        assetText.setResolution(2);
        assetText.setOrigin(0.5, 0.5);

        // プログレスバーの更新
        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
            percentText.setText(Math.floor(value * 100) + '%');
        });

        this.load.on('fileprogress', (file: any) => {
            assetText.setText('読み込み中: ' + file.key);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });


        // 実際の画像を読み込み
        this.load.image('cat', 'assets/images/cat.png');
        this.load.image('cat-happy', 'assets/images/cat.png');
        this.load.image('cat2', 'assets/images/cat2.png'); // 追加
        this.load.image('plate', 'assets/images/plates/geta.png');

        // 全ての寿司画像を読み込み
        this.load.image('tuna-sushi', 'assets/images/sushi/tuna.png');
        this.load.image('salmon-sushi', 'assets/images/sushi/salmon.png');
        this.load.image('chutoro-sushi', 'assets/images/sushi/chutoro.png');
        this.load.image('ikura-sushi', 'assets/images/sushi/ikura.png');
        this.load.image('shrimp-sushi', 'assets/images/sushi/shrimp.png');
        this.load.image('egg-sushi', 'assets/images/sushi/egg.png');
        this.load.image('uni-sushi', 'assets/images/sushi/uni.png');
        this.load.image('hotate-sushi', 'assets/images/sushi/hotate.png');
        this.load.image('iwashi-sushi', 'assets/images/sushi/iwashi.png');
        this.load.image('tai-sushi', 'assets/images/sushi/tai.png');

        // プレースホルダー画像の生成（背景とテクスチャ用）
        this.createPlaceholderImages();
    }

    createPlaceholderImages(): void {
        // マグロ寿司のプレースホルダー画像（超高解像度）
        const maguroGraphics = this.add.graphics();
        maguroGraphics.fillStyle(0x8B0000);
        maguroGraphics.fillEllipse(75, 45, 150, 90);
        maguroGraphics.fillStyle(0xFFF8DC);
        maguroGraphics.fillEllipse(75, 45, 120, 60);
        maguroGraphics.lineStyle(3, 0x654321);
        maguroGraphics.strokeEllipse(75, 45, 150, 90);
        maguroGraphics.lineStyle(2, 0x8B0000);
        maguroGraphics.strokeEllipse(75, 45, 120, 60);
        maguroGraphics.generateTexture('sushi-maguro', 150, 90);
        maguroGraphics.destroy();

        // サーモン寿司のプレースホルダー画像（超高解像度）
        const salmonGraphics = this.add.graphics();
        salmonGraphics.fillStyle(0xFF6347);
        salmonGraphics.fillEllipse(75, 45, 150, 90);
        salmonGraphics.fillStyle(0xFFF8DC);
        salmonGraphics.fillEllipse(75, 45, 120, 60);
        salmonGraphics.lineStyle(3, 0x654321);
        salmonGraphics.strokeEllipse(75, 45, 150, 90);
        salmonGraphics.lineStyle(2, 0xFF6347);
        salmonGraphics.strokeEllipse(75, 45, 120, 60);
        salmonGraphics.generateTexture('sushi-salmon', 150, 90);
        salmonGraphics.destroy();

        // 背景のプレースホルダー画像（超高解像度）
        const bgGraphics = this.add.graphics();
        // グラデーション風の背景
        bgGraphics.fillStyle(0xF5DEB3);
        bgGraphics.fillRect(0, 0, 800, 600);
        // 木目風のテクスチャ（より細かく）
        for (let i = 0; i < 800; i += 10) {
            bgGraphics.fillStyle(0xE6D3A3);
            bgGraphics.fillRect(i, 0, 5, 600);
        }
        // 追加の木目パターン
        for (let i = 0; i < 800; i += 30) {
            bgGraphics.fillStyle(0xD4C494);
            bgGraphics.fillRect(i, 0, 15, 600);
        }
        bgGraphics.fillStyle(0x8B4513);
        bgGraphics.fillRect(0, 500, 800, 100);
        // 木目風のテクスチャ（下部、より細かく）
        for (let i = 0; i < 800; i += 8) {
            bgGraphics.fillStyle(0x654321);
            bgGraphics.fillRect(i, 500, 4, 100);
        }
        // 追加の木目パターン（下部）
        for (let i = 0; i < 800; i += 25) {
            bgGraphics.fillStyle(0x543210);
            bgGraphics.fillRect(i, 500, 12, 100);
        }
        bgGraphics.generateTexture('background', 800, 600);
        bgGraphics.destroy();
    }

    create(): void {
        this.scene.start('MenuScene');
    }
} 