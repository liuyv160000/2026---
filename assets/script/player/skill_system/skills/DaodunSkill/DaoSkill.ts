import { _decorator, Component, Node , Prefab, instantiate, resources, Vec3,Vec2,
        input, Input, EventKeyboard, KeyCode, Collider2D, BoxCollider2D, Contact2DType,
 } from 'cc';
import { BaseSkill } from '../../BaseSkill';
import { Playercontralor } from '../../../Playercontralor';

const { ccclass, property } = _decorator;

@ccclass('DaoSkill')
export class DaoSkill extends BaseSkill {


    private player: Playercontralor | null = null; // 玩家引用
    private check_zone: BoxCollider2D | null = null; // 攻击检测区域

    onLoad(){
        this.player = this.node.getComponent(Playercontralor);
        if (!this.skillId) {
            this.skillId = 'DAO';
        }
        this.initInput();
    }

    private initInput(): void {
            input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
            input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        }

    private onKeyDown(event: EventKeyboard): void {
       
    }

    private onKeyUp(event: EventKeyboard): void {
       
    }

    y_check(){

    }

    start() {
        let check_zone = new BoxCollider2D();
        check_zone.sensor = true;
        check_zone.size.set(805,36);
        check_zone.offset.set(380,0);
        //this.check_zone = check_zone;
    }

    update(deltaTime: number) {
        
    }
}


