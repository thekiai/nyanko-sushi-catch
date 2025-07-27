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
                font: '20px monospace',
                color: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

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

        // プレースホルダー画像の作成（実際のアセットが用意できるまで）
        this.createPlaceholderImages();
        
        // 音声ファイルは一時的に無効化（base64エンコードエラーのため）
        // this.load.audio('bgm', 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        // this.load.audio('catch', 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        // this.load.audio('perfect', 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    }

    createPlaceholderImages(): void {
        // 猫のプレースホルダー画像
        const catGraphics = this.add.graphics();
        catGraphics.fillStyle(0x8B4513);
        catGraphics.fillRect(0, 0, 100, 80);
        catGraphics.fillStyle(0x000000);
        catGraphics.fillCircle(20, 20, 5);
        catGraphics.fillCircle(80, 20, 5);
        catGraphics.fillStyle(0xFF6B6B);
        catGraphics.fillTriangle(50, 40, 40, 50, 60, 50);
        catGraphics.generateTexture('cat', 100, 80);
        catGraphics.destroy();

        // 満足した猫のプレースホルダー画像
        const happyCatGraphics = this.add.graphics();
        happyCatGraphics.fillStyle(0x8B4513);
        happyCatGraphics.fillRect(0, 0, 100, 80);
        happyCatGraphics.fillStyle(0x000000);
        happyCatGraphics.fillCircle(20, 20, 5);
        happyCatGraphics.fillCircle(80, 20, 5);
        happyCatGraphics.fillStyle(0x32CD32);
        happyCatGraphics.fillTriangle(50, 40, 40, 50, 60, 50);
        happyCatGraphics.generateTexture('cat-happy', 100, 80);
        happyCatGraphics.destroy();

        // マグロ寿司のプレースホルダー画像
        const maguroGraphics = this.add.graphics();
        maguroGraphics.fillStyle(0x8B0000);
        maguroGraphics.fillEllipse(25, 15, 50, 30);
        maguroGraphics.fillStyle(0xFFF8DC);
        maguroGraphics.fillEllipse(25, 15, 40, 20);
        maguroGraphics.generateTexture('sushi-maguro', 50, 30);
        maguroGraphics.destroy();

        // サーモン寿司のプレースホルダー画像
        const salmonGraphics = this.add.graphics();
        salmonGraphics.fillStyle(0xFF6347);
        salmonGraphics.fillEllipse(25, 15, 50, 30);
        salmonGraphics.fillStyle(0xFFF8DC);
        salmonGraphics.fillEllipse(25, 15, 40, 20);
        salmonGraphics.generateTexture('sushi-salmon', 50, 30);
        salmonGraphics.destroy();

        // お皿のプレースホルダー画像
        const plateGraphics = this.add.graphics();
        plateGraphics.fillStyle(0xFFFFFF);
        plateGraphics.fillEllipse(50, 30, 100, 60);
        plateGraphics.lineStyle(2, 0xCCCCCC);
        plateGraphics.strokeEllipse(50, 30, 100, 60);
        plateGraphics.generateTexture('plate', 100, 60);
        plateGraphics.destroy();

        // 背景のプレースホルダー画像
        const bgGraphics = this.add.graphics();
        bgGraphics.fillStyle(0xF5DEB3);
        bgGraphics.fillRect(0, 0, 800, 600);
        bgGraphics.fillStyle(0x8B4513);
        bgGraphics.fillRect(0, 500, 800, 100);
        bgGraphics.generateTexture('background', 800, 600);
        bgGraphics.destroy();
    }

    create(): void {
        this.scene.start('MenuScene');
    }
} 