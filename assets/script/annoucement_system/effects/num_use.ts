import { _decorator, Component, Node, UIOpacity, Vec3, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('num_use')
export class num_use extends Component {
    @property
    private duration: number = 1; // 总持续时间
    
    @property
    private jumpHeight: number = 80; // 蹦出高度
    
    @property
    private fadeInDuration: number = 0.1; // 淡入时间
    
    private ui_opacity: UIOpacity | null = null;
    private startPosition: Vec3 = new Vec3();

    onLoad(): void {
        this.ui_opacity = this.node.getComponent(UIOpacity);
        if (!this.ui_opacity) {
            this.ui_opacity = this.node.addComponent(UIOpacity);
        }
        
        // 记录起始位置并向下偏移
        this.startPosition = this.node.position.clone();
        this.node.setPosition(this.startPosition.x, this.startPosition.y - this.jumpHeight, this.startPosition.z);
        
        // 初始完全透明
        this.ui_opacity.opacity = 0;
    }

    start() {
        // 播放淡入效果
        this.playFadeIn();
        // 播放蹦出效果
        this.playBounce();
        // 播放淡出效果
        this.playFadeOut();
        
        // 总时间后销毁
        this.scheduleOnce(() => {
            this.node.destroy();
        }, this.duration);
    }
    
    /**
     * 淡入效果（透明 -> 不透明）
     */
    private playFadeIn(): void {
        if (!this.ui_opacity) return;
        
        tween(this.ui_opacity)
            .to(this.fadeInDuration, { opacity: 255 }, { easing: 'quadOut' })
            .start();
    }
    
    /**
     * 淡出效果（不透明 -> 透明）
     */
    private playFadeOut(): void {
        if (!this.ui_opacity) return;
        
        // 延迟一段时间后开始淡出，避免淡出太早
        const delayTime = this.duration - 0.4;
        
        tween(this.ui_opacity)
            .delay(Math.max(0, delayTime))
            .to(0.4, { opacity: 0 }, { easing: 'quadIn' })
            .start();
    }
    
    /**
     * 蹦出效果（从下往上弹跳）
     */
    private playBounce(): void {
        // 目标位置（原位置）
        const targetPos = this.startPosition;
        
        // 弹跳点（比目标位置更高的点，产生弹跳感）
        const bouncePos = new Vec3(
            targetPos.x,
            targetPos.y + this.jumpHeight * 0.3,
            targetPos.z
        );
        
        // 阶段1：快速上升到弹跳点
        tween(this.node)
            .to(0.12, { position: bouncePos }, { easing: 'cubicOut' })
            // 阶段2：回落到目标位置（带弹跳感）
            .to(0.18, { position: targetPos }, { easing: 'bounceOut' })
            .start();
        
        // 可选：添加缩放效果（蹦出时放大）
        this.playScaleBounce();
    }
    
    /**
     * 缩放弹跳效果（配合蹦出使用）
     */
    private playScaleBounce(): void {
        tween(this.node)
            .to(0.1, { scale: new Vec3(1.2, 1.2, 1) }, { easing: 'quadOut' })
            .to(0.2, { scale: new Vec3(1, 1, 1) }, { easing: 'quadIn' })
            .start();
    }
    
    /**
     * 公开方法：设置显示时长
     */
    public setDuration(duration: number): void {
        this.duration = duration;
    }
    
    /**
     * 公开方法：设置蹦出高度
     */
    public setJumpHeight(height: number): void {
        this.jumpHeight = height;
    }
}