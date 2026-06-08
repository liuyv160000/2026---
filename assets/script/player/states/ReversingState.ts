// 玩家重力反转状态
import { _decorator, Component, Node, RigidBody2D, BoxCollider2D, director, Collider2D } from 'cc';
import { IState } from "../../fms/FMS";
import { Playercontralor } from '../Playercontralor';
const { ccclass, property } = _decorator;

@ccclass('ReversingState')
export class ReversingState implements IState {
    private player: Playercontralor; // 关联的玩家实例
    private log_y; // 起始Y位置记录

    private collier_plyaer: Collider2D = null!; // 玩家碰撞体
    private collier_line_platform: Collider2D = null!; // 线平台碰撞体
    
    // 传入玩家与平台碰撞体
    constructor(player: Playercontralor,  collier_line_platform: Collider2D) {
        this.player = player;
        this.collier_plyaer = this.player.collider;
        this.collier_line_platform = collier_line_platform;
    }

    // 进入反转状态
    enter(): void {
        this.log_y = this.player.node.position.y;
        this.player.ifReversing = true;
        this.player.ySpeed = -this.player.transform.contentSize.y*this.player.ifGravityReverse * 0.31;
        this.player.collider.enabled = false;
        this.player.node.scale.set(this.player.node.scale.x, this.player.node.scale.y * -1, this.player.node.scale.z);
        
    }

    // 退出反转状态
    exit(): void {
        this.player.ifReversing = false;
        this.player.collider.enabled = true;
        this.player.ySpeed = 0;
        this.player.reverseGravity();
    }
    
    // 状态启动
    start() {

    }

    // 状态更新：检查反转结束条件
    update(deltaTime: number) {
        this.check(deltaTime);
        
    }

    // 检查是否完成反转
    check(deltaTIme: number){
        if((this.player.node.position.y - this.log_y) * this.player.ifGravityReverse * -1 > this.player.transform.contentSize.y){
            this.player.fsm.changeState('air');
        }
    }



}


