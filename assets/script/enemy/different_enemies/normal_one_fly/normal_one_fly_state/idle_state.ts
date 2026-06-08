// 普通飞行敌人待机状态
import { _decorator, Component, Node ,Vec2 ,Vec3} from 'cc';
import { IState } from '../../../../fms/FMS';
import { normal_one } from '../normal_one_fiy';
const { ccclass, property } = _decorator;

@ccclass('idle_state')
export class idle_state implements IState {
    private enemy: normal_one; // 关联的敌人实例

    // 传入敌人实例
    constructor(enemy: normal_one) {
        this.enemy = enemy;
    }
    
    // 状态启动
    start() {

    }

    // 状态更新：移动与攻击
    update(deltaTime: number) {
        this.enemy.move_way();
        this.enemy.attack();
    }
    

    // 进入待机状态
    enter(): void {
        this.enemy.anim.play("idle");
        this.enemy.change_speed(400);
        this.enemy.change_dir(new Vec2(0, -1));
        this.enemy.is_idle = true;
        this.enemy.is_onining = false;
        this.enemy.is_run_away = false;
        this.enemy.is_dead = false;
    }

    // 退出待机状态
    exit(): void {
        this.enemy.is_idle = false;
    }
}


