// 追踪导弹进入场景状态
import { _decorator, Component, Node } from 'cc';
import { tracking_missle } from '../tracking_missle';
import { FSM, IState } from '../../../../fms/FMS';
const { ccclass, property } = _decorator;

@ccclass('tm_on_in_state')
export class tm_on_in_state extends Component implements IState {
    private tm: tracking_missle = null!; // 关联的导弹实例
    private time: number = 0.75; // 进入状态持续时间

    // 传入导弹实例
    constructor(tm: tracking_missle) {
        super();
        this.tm = tm;
    }


    // 进入场景状态
    enter(): void {
        this.tm.change_speed(400);
        this.tm.is_onining = true;
    
    }

    // 状态启动
    start() {
        this.tm.collider.enabled = false; // 禁用碰撞体
        this.tm.anim.play('flying'); // 播放进入动画，假设动画名称为'tm_on_in'
    }

    // 状态更新
    update(deltaTime: number) {
        this.time -= deltaTime;
        if (this.time <= 0) {
            this.tm.collider.enabled = true; // 启用碰撞体
        }
    }

    // 退出进入状态
    exit(): void {
        this.tm.is_onining = false;
    }
}


