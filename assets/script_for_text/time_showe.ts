import { _decorator, Component, Node, Label } from 'cc';
import { Timer } from '../script/Timer';
import { ex_manager } from '../script/ex_ctrl/ex_manager';
const { ccclass, property } = _decorator;

@ccclass('time_showe')
export class time_showe extends Component {
    private timer: Timer = null!;
    private label: Label = null!;

    @property(ex_manager)
    exManager: ex_manager = null!;
    
    onLoad() {
        // 获取节点上的 Label 组件
        this.label = this.node.getComponent(Label);
        if (!this.label) {
            console.error('time_showe: 节点上未找到 Label 组件');
            return;
        }
        
        // 添加 Timer 组件并设置总时长
        this.timer = this.node.addComponent(Timer)!;
        this.timer.set_duration(this.exManager.get_total_time());
    }

    start() {
        this.timer.stop();
    }

    update(deltaTime: number) {
        if (!this.timer || !this.label || this.is_paused) return;
        
        // 获取已经过的时间
        const elapsedTime = this.timer.get_elapsedTime();
        
        // 格式化时间显示
        this.label.string = this.formatTime(elapsedTime);
    }
    
    /**
     * 格式化时间显示
     * @param time 时间（秒）
     * @returns 格式化后的时间字符串 (MM:SS 格式)
     */
    private formatTime(time: number): string {
        // 确保时间不为负数
        time = Math.max(0, time);
        
        // 计算分钟和秒
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        
        // 格式化为 MM:SS
        return `${this.padZero(minutes)}:${this.padZero(seconds)}`;
    }
    
    /**
     * 数字补零
     * @param num 数字
     * @returns 补零后的字符串
     */
    private padZero(num: number): string {
        return num < 10 ? `0${num}` : `${num}`;
    }

    private is_paused: boolean = false;

    public pause()
    {
        this.is_paused = true;
        this.timer.stop();

    }

    public resume()
    {
        this.is_paused = false;
        this.timer.reset();
        this.timer.start();
    }



}