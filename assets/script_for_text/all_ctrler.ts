import { _decorator, Component, Node, Label, tween, UIOpacity } from 'cc';
import { Timer } from '../script/Timer';
import { ex_manager } from '../script/ex_ctrl/ex_manager';

const { ccclass, property } = _decorator;

@ccclass('TextTipData')
class TextTipData {
    @property({ tooltip: "要显示的文本内容" })
    public text: string = "";

    @property({ type: Number, tooltip: "出现时间点(秒)，从游戏开始算起" })
    public appearTime: number = 0;

    @property({ type: Number, tooltip: "持续时间(秒)，包含渐变过渡" })
    public duration: number = 2;
}

@ccclass('all_ctrler')
export class all_ctrler extends Component {

    @property(ex_manager)
    public ex_manager: ex_manager = null!;

    @property({ type: Label, tooltip: "显示字幕的Label组件" })
    private tipLabel: Label = null!;

    @property({ type: Node, tooltip: "Label所在的节点" })
    private tipNode: Node = null!;

    @property({ type: [TextTipData], tooltip: "字幕时间表" })
    private textTips: TextTipData[] = [];

    @property({ type: Number, tooltip: "淡入时间(秒)" })
    private fadeInTime: number = 0.3;

    @property({ type: Number, tooltip: "淡出时间(秒)" })
    private fadeOutTime: number = 0.3;

    private timer: Timer = null!;
    private tipIndex: number = 0;
    private isPlaying: boolean = false;
    private isPaused: boolean = false;

    onLoad(): void {
        this.timer = this.node.addComponent(Timer);
        
    }

    start() {
        if(!this.ex_manager) {
            console.error("all_ctrler：ex_manager属性未设置！");
        }else
        {
            this.timer.set_duration(this.ex_manager.get_total_time());
        }
        // 初始内容为空，透明度为0
        if (this.tipLabel) {
            this.tipLabel.string = "";
        }
        if (this.tipNode) {
            this.setOpacity(0);
        }
    }

    update(deltaTime: number) {
        if (this.isPaused) return;
        if (this.isPlaying) return;
        if (this.tipIndex >= this.textTips.length) return;

        const currentTime = this.timer.get_elapsedTime();
        const tip = this.textTips[this.tipIndex];

        if (currentTime >= tip.appearTime) {
            this.playTip(tip);
        }
    }

    private playTip(tip: TextTipData): void {
        if (!this.tipLabel || !this.tipNode) {
            this.tipIndex++;
            return;
        }

        this.isPlaying = true;

        // 设置字幕内容
        this.tipLabel.string = tip.text;

        // 初始透明度为0
        this.setOpacity(0);

        const showTime = tip.duration - this.fadeInTime - this.fadeOutTime;

        tween(this.tipNode)
            // 淡入
            .to(this.fadeInTime, {}, {
                onUpdate: (target: Node, ratio: number) => {
                    this.setOpacity(ratio * 255);
                }
            })
            // 保持显示
            .delay(Math.max(0, showTime))
            // 淡出
            .to(this.fadeOutTime, {}, {
                onUpdate: (target: Node, ratio: number) => {
                    this.setOpacity((1 - ratio) * 255);
                }
            })
            // 完成后：清空内容，索引+1，恢复检测
            .call(() => {
                this.tipLabel.string = "";
                this.tipIndex++;
                this.isPlaying = false;
            })
            .start();
    }

    private setOpacity(opacity: number): void {
        let uiOpacity = this.tipNode.getComponent(UIOpacity);
        if (!uiOpacity) {
            uiOpacity = this.tipNode.addComponent(UIOpacity);
        }
        uiOpacity.opacity = Math.max(0, Math.min(255, Math.round(opacity)));
    }

    // 暂停字幕播放
    public pause(): void {
        this.isPaused = true;
        this.timer.stop();
    }

    // 恢复字幕播放
    public resume(): void {
        this.isPaused = false;
        this.timer.reset();
        this.timer.start();
    }
}