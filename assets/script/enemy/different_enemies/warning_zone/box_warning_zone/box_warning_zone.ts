// 警告区域：根据剩余时间逐步变透明
import { _decorator, Component, Sprite, UIOpacity } from 'cc';
import { Timer } from 'db://assets/script/Timer';
const { ccclass, property } = _decorator;

@ccclass('box_warning_zone')
export class box_warning_zone extends Component {
    private warning_duration: number = 1; // 警告持续时间，单位为秒
    private initial_warning_duration = 1; // 初始警告持续时间，用于计算透明度
    private ui_opacity: UIOpacity | null = null; // 透明度组件
    
    @property(Sprite)
    private mask: Sprite = null; // 警告区域的Sprite组件


    // 初始化透明度组件
    onLoad(): void {
        this.initial_warning_duration = this.warning_duration;
        this.ui_opacity = this.node.getComponent(UIOpacity) ?? this.node.addComponent(UIOpacity);
    }

    // 组件启动
    start() {

    }

    // 帧更新：按时间渐隐并销毁
    update(deltaTime: number) {
        const ratio = Math.max(0, this.warning_duration / this.initial_warning_duration);
        if (this.ui_opacity) {
            this.ui_opacity.opacity = Math.round(255 * ratio);
        } else if (this.mask) {
            const alpha = Math.round(255 * ratio);
            this.mask.color.set(this.mask.color.r, this.mask.color.g, this.mask.color.b, alpha);
        }
        this.warning_duration -= deltaTime;
        if(this.warning_duration <= 0) {
            this.scheduleOnce(() => {
                this.node.destroy();
            }, 0.1);
        }
    }
}


