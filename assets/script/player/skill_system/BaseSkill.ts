// 技能基类：定义技能启用与更新接口
import { _decorator, Component } from 'cc';
import { Timer } from '../../Timer';

const { ccclass, property } = _decorator;

@ccclass('BaseSkill')
export class BaseSkill extends Component {
    @property
    public skillId: string = ''; // 技能ID

    protected active: boolean = false; // 是否启用

    protected skill_timer: Timer = null; // 技能计时器
    protected skill_duration: number; // 技能持续时间

    // 设置技能启用状态
    public setActive(active: boolean): void {
        if (this.active === active) return;
        this.active = active;
        if (this.active) {
            this.onActivate();
        } else {
            this.onDeactivate();
        }
    }

    // 获取当前启用状态
    public isActive(): boolean {
        return this.active;
    }

    // 启用时回调
    protected onActivate(): void {
        // 可选覆写
    }

    // 关闭时回调
    protected onDeactivate(): void {
        // 可选覆写
    }

    // 每帧更新回调
    public updateSkill(deltaTime: number): void {
        // 可选覆写
    }

    public reset_skill(): void {
        this.skill_timer.reset();
    }

    public get_timer(): Timer {
        return this.skill_timer;
    }
}
