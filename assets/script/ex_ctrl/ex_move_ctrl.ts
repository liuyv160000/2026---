// 关卡移动控制：驱动节点按速度移动
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ex_move_ctrl')
export class ex_move_ctrl extends Component {
    private is_paused: boolean = true; // 游戏是否暂停
    private speed: number = 1200; // 移动速度


    // 组件启动
    start() {

    }

    // 帧更新：按速度移动
    update(deltaTime: number) {
        if (this.is_paused) {
            return;
        }
        // 移动逻辑
        this.move(deltaTime);
    }


    // 按速度移动节点
    move(deltaTime: number) {
        this.node.setPosition(this.node.position.x + this.speed * deltaTime, this.node.position.y);
    }

    // 暂停移动
    stop() {
        this.is_paused = true;
    }

    // 恢复移动
    resume() {
        this.is_paused = false;
    }

}


