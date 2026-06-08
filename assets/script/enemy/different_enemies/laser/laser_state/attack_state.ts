// 激光攻击状态
import { _decorator, Component, Node } from 'cc';
import { IState,FSM } from 'db://assets/script/fms/FMS';
import { laser } from '../laser';
const { ccclass, property } = _decorator;

@ccclass('attack_state')
export class attack_state extends Component implements IState {
    private enemy: laser = null!; // 关联的激光敌人

    // 传入激光实例
    constructor(enemy: laser){
        super();
        this.enemy = enemy;
    }

    // 状态启动
    start() {

    }

    // 状态更新
    update(deltaTime: number) {
        
    }

    // 进入攻击状态
    enter(): void {

    }

    // 退出攻击状态
    exit(): void {
        
    }


}


