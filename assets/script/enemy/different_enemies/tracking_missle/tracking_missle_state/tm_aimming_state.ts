// 追踪导弹瞄准状态
import { _decorator, Component, Node } from 'cc';
import { tracking_missle } from '../tracking_missle';
import { FSM, IState } from '../../../../fms/FMS';
const { ccclass, property } = _decorator;

@ccclass('tm_aimming_state')
export class tm_aimming_state extends Component implements IState {
    private tm: tracking_missle = null!; // 关联的导弹实例

    // 传入导弹实例
    constructor(tm: tracking_missle) {
        super();
        this.tm = tm;
    }

    // 进入瞄准状态
    enter(): void {
        this.tm.is_aimming = true;
        this.tm.change_speed(0);
    }

    // 状态启动
    start() {

    }

    // 状态更新：持续朝向玩家
    update(deltaTime: number) {
        
        this.tm.aiming();
    }


    // 退出瞄准状态
    exit(): void {
        this.tm.is_aimming = false;
    }

}


