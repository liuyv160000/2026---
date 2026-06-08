// 玩家跳跃状态
import { _decorator, Component, Node } from 'cc';
import { IState } from "../../fms/FMS";
import { Playercontralor } from '../Playercontralor';
import {  Vec2, PhysicsSystem2D, ERaycast2DType, IPhysics2DContact } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('jumpstate')
export class jumpstate implements IState  {
    private player: Playercontralor; // 关联的玩家实例
    
    // 传入玩家实例
    constructor(player: Playercontralor){
        this.player = player;
        
    }
    
    // 进入跳跃状态
    enter(): void {
        this.player.ySpeed = this.player.jumpSpeed * this.player.ifGravityReverse;
        this.player.ifAir = true;
        this.player.ifGround = false;
        this.player.anim.play('jump'); // 播放Jump动画，假设动画名称为'jump'
    }

    // 退出跳跃状态
    exit(): void {
        
    }
    
    // 状态启动
    start() {

    }

    // 垂直速度检查占位
    ySpeedCheck(){
        
    }

    // 状态更新：上升结束切换为空中
    update(deltaTime: number) {
        if(this.player.ySpeed * this.player.ifGravityReverse < 0){
            this.player.fsm.changeState('air');
        }
    }
}


