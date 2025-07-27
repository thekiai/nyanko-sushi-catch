export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload(): void {
        // ローディング画面の表示
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'ローディング中...',
            style: {
                font: '24px Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        loadingText.setResolution(2);

        // プログレスバーの更新
        this.load.on('progress', function (value: number) {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });

        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // 実際の画像ファイルを読み込み
        this.load.image('cat', '/src/assets/images/cat.png');
        this.load.image('cat-happy', '/src/assets/images/cat.png'); // 同じ画像を満足時にも使用
        this.load.image('plate', '/src/assets/images/plate.png'); // お皿の画像も読み込み

        // プレースホルダー画像の作成（寿司と背景）
        this.createPlaceholderImages();
        
        // 音声ファイルは一時的に無効化（base64エンコードエラーのため）
        // this.load.audio('bgm', 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        // this.load.audio('catch', 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        // this.load.audio('perfect', 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
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