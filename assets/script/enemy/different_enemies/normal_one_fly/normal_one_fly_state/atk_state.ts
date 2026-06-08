import { _decorator, Component, Node, Animation } from 'cc';
import { IState } from '../../../../fms/FMS';
import { normal_one } from '../normal_one_fiy';
const { ccclass, property } = _decorator;

@ccclass('atk_state')
export class atk_state extends Component implements IState {
    private enemy: normal_one; // 关联的敌人实例
    private anim: Animation | null = null;
    private onAnimFinished = () => {
        this.cleanupAnimListener();
        this.enemy.fsm.changeState('idle');
    };

    constructor(enemy: normal_one) {
        super();
        this.enemy = enemy;
    }


    enter(): void {
        this.enemy.attack();
        this.anim = this.enemy.node.getComponent(Animation);
        if (this.anim) {
            this.anim.on(Animation.EventType.FINISHED, this.onAnimFinished, this);
        }
    }

    start() {

    }

    update(deltaTime: number) {
        
    }

    exit(): void {
        this.cleanupAnimListener();
    }

    private cleanupAnimListener() {
        if (this.anim) {
            this.anim.off(Animation.EventType.FINISHED, this.onAnimFinished, this);
        }
    }
}


