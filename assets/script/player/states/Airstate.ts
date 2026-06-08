// 玩家空中状态
import { _decorator, Component, Node } from 'cc';
import { IState } from "../../fms/FMS";
import { Playercontralor } from '../Playercontralor';
const { ccclass, property } = _decorator;

@ccclass('Airstate')
export class Airstate implements IState {
    private player: Playercontralor; // 关联的玩家实例
    
    // 传入玩家实例
    constructor(player: Playercontralor){
        this.player = player;
        
    }

    // 进入空中状态
    enter(): void {
        this.player.ifAir = true;
        this.player.ifGround = false;
        this.player.anim.play('air'); // 播放Air动画，假设动画名称为'air'
    }

    // 退出空中状态
    exit(): void {
        
    }
    
    // 状态启动
    start() {

    }

    // 状态更新
    update(deltaTime: number) {
        
    }
}


