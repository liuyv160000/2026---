// 玩家待机状态
import { _decorator, Component, Node } from 'cc';
import { IState } from "../../fms/FMS";
import { Playercontralor } from '../Playercontralor';
const { ccclass, property } = _decorator;

@ccclass('IdleState')
export class IdleState implements IState {
    private player: Playercontralor; // 关联的玩家实例

    // 传入玩家实例
    constructor(player: Playercontralor){
        this.player = player;
    }

    // 进入待机状态
    enter(): void {
        this.player.anim.play('idle'); // 播放Idle动画，假设动画名称为'idle'
    }

    // 退出待机状态
    exit(): void {
       
    }

    // 状态启动
    start() {

    }

    // 状态更新
    update(deltaTime: number) {
        
    }


}


