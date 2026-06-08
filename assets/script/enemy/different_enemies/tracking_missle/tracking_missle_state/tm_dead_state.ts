// 追踪导弹死亡状态
import { _decorator, Component, Node } from 'cc';
import { tracking_missle } from '../tracking_missle';
import { FSM, IState } from '../../../../fms/FMS';
const { ccclass, property } = _decorator;

@ccclass('tm_dead_state')
export class tm_dead_state extends Component implements IState {
    private tm: tracking_missle = null!; // 关联的导弹实例
    private state_timer: number = 1; // 死亡倒计时
    
        // 传入导弹实例
        constructor(tm: tracking_missle) {
            super();
            this.tm = tm;
        }

    // 进入死亡状态
    enter(): void {
        this.tm.is_dead = true;
        this.tm.anim.play('boom');
    }

    // 状态启动
    start() {
        this.state_timer = 1;
    }

    // 状态更新：到时销毁
    update(deltaTime: number) {
    }

    // 退出死亡状态
    exit(): void {
    }
}


