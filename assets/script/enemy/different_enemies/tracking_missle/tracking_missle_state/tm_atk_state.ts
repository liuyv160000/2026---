// 追踪导弹攻击状态
import { _decorator, Component, Node } from 'cc';
import { tracking_missle } from '../tracking_missle';
import { FSM, IState } from '../../../../fms/FMS';
const { ccclass, property } = _decorator;

@ccclass('tm_atk_state')
export class tm_atk_state extends Component implements IState {
    private tm: tracking_missle = null!; // 关联的导弹实例

    // 传入导弹实例
    constructor(tm: tracking_missle) {
        super();
        this.tm = tm;
    }

    // 进入攻击状态
    enter(): void {
        this.tm.is_atking = true;
        this.tm.reset_atk_speed();
    }

    // 状态启动
    start() {

    }

    // 状态更新
    update(deltaTime: number) {
        
    }


    // 退出攻击状态
    exit(): void {
        this.tm.is_atking = false;
    }

}


