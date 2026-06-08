// 激光预警状态
import { _decorator, Component, Node } from 'cc';
import { IState,FSM } from 'db://assets/script/fms/FMS';
import { laser } from '../laser';
const { ccclass, property } = _decorator;

@ccclass('warning_state')
export class warning_state extends Component implements IState {
    private enemy: laser = null!; // 关联的激光敌人
    private warning_time: number = 1; // 警告状态持续时间，单位为秒

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

    // 进入预警状态
    enter(){

    }

    // 退出预警状态
    exit(): void {
        
    }

}


