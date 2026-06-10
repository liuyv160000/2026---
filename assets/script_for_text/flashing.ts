import { _decorator, Component, Node, Label, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('flashing')
export class flashing extends Component {
    @property({ tooltip: "闪烁速度(次/秒)" })
    private flash_speed: number = 2.0;
    
    @property({ tooltip: "最小透明度(0-255)" })
    private min_opacity: number = 50;
    
    @property({ tooltip: "最大透明度(0-255)" })
    private max_opacity: number = 255;
    
    @property({ tooltip: "是否自动开始闪烁" })
    private auto_start: boolean = true;

    private label: Label = null;
    private elapsed_time: number = 0;
    private is_flashing: boolean = false;
    private current_opacity: number = 255;

    protected onLoad(): void {
        this.label = this.getComponent(Label);
        if (!this.label) {
            console.warn('[flashing] Label组件未找到');
            return;
        }
    }

    start() {
        if (this.auto_start) {
            this.start_flashing();
        }
    }

    update(deltaTime: number) {
        if (!this.is_flashing || !this.label) return;
        
        this.elapsed_time += deltaTime;
        
        // 计算当前透明度（使用正弦波实现平滑闪烁）
        const half_period = 1.0 / this.flash_speed;
        const progress = (this.elapsed_time % half_period) / half_period;
        
        // 在最小和最大透明度之间插值
        this.current_opacity = this.min_opacity + (this.max_opacity - this.min_opacity) * 
            (Math.sin(progress * Math.PI * 2 * this.flash_speed * this.elapsed_time) * 0.5 + 0.5);
        
        // 应用透明度到Label颜色
        const color = this.label.color.clone();
        color.a = this.current_opacity;
        this.label.color = color;
    }

    /** 开始闪烁 */
    public start_flashing(): void {
        if (!this.label) {
            console.warn('[flashing] 无法开始闪烁，Label组件不存在');
            return;
        }
        this.is_flashing = true;
        this.elapsed_time = 0;
    }

    /** 停止闪烁 */
    public stop_flashing(): void {
        this.is_flashing = false;
        
        // 恢复完全透明
        if (this.label) {
            const color = this.label.color.clone();
            color.a = 255;
            this.label.color = color;
        }
    }

    /** 暂停闪烁 */
    public pause_flashing(): void {
        this.is_flashing = false;
    }

    /** 恢复闪烁 */
    public resume_flashing(): void {
        if (this.label) {
            this.is_flashing = true;
        }
    }

    /** 设置闪烁速度 */
    public set_flash_speed(speed: number): void {
        this.flash_speed = Math.max(0.1, speed); // 最小速度为0.1
    }

    /** 设置透明度范围 */
    public set_opacity_range(min: number, max: number): void {
        this.min_opacity = Math.max(0, Math.min(255, min));
        this.max_opacity = Math.max(0, Math.min(255, max));
    }
}