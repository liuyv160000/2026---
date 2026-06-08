// 普通飞行敌人死亡状态
import { _decorator, Component, Node } from 'cc';
import { IState } from '../../../../fms/FMS';
import { normal_one } from '../normal_one_fiy';
const { ccclass, property } = _decorator;

@ccclass('dead_state')
export class dead_state implements IState {
    private enemy: normal_one; // 关联的敌人实例

    // 传入敌人实例
    constructor(enemy: normal_one) {
        this.enemy = enemy;

    }

    // 状态更新
    update(deltaTime: number) {
        
    }

    // 进入死亡状态
    enter(): void {
        this.enemy.is_dead = true;
        this.enemy.anim.play('die');
    }

    // 退出死亡状态
    exit(): void {
        
    }

}


