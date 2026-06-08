// 敌人基类：提供基础移动、受伤与死亡处理
import { 
    input, 
    Input, 
    EventKeyboard, 
    KeyCode,
    Vec2,
    Vec3,
    geometry,
    Animation,
    RigidBody2D,
    BoxCollider2D,
    Contact2DType,
    Collider2D,
    IPhysics2DContact,
    Color,
    CircleCollider2D,
    tween,
    UITransform
} from 'cc';
import { _decorator, Component, Node } from 'cc';
import { FSM , IState} from '../fms/FMS';
import {  PhysicsSystem2D, ERaycast2DType, Graphics } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('enemy_controler_base')
export class enemy_controler_base extends Component {
    protected enemy_hp: number = 100; // 敌人生命值
    public fsm: FSM = null!; // 状态机
    public player: Node = null!; // 玩家节点引用
    protected move_speed: number = 100; // 移动速度
    protected move_dir_rotate: number = 0; // 移动朝向角度
    protected move_dir: Vec2 = new Vec2(0, 0) // 移动方向

    // 初始化基础参数
    onLoad() {
        this.player = this.node.parent.getChildByName("player")!;
        this.move_speed = 100;
    }


    // 组件启动
    start() {

    }

    // 帧更新：按速度移动
    update(deltaTime: number) {
        this.move_by_speed(deltaTime);
    }

    // 按当前速度和方向移动
    move_by_speed(deltaTime: number)
    {
        let moveVec3 = new Vec3(this.move_dir.x * this.move_speed * deltaTime, this.move_dir.y * this.move_speed * deltaTime, 0);
        this.node.setPosition(this.node.getPosition().add(moveVec3));
    }

    // 具体移动策略由子类实现
    move_way()
    {

    }

    // 检查生命值并触发销毁
    protected die_check()
    {
        if(this.enemy_hp <= 0)
        {
           this.scheduleOnce(this.onDestroy.bind(this), 0.5); // 延迟销毁以播放死亡动画
        }
    }

    // 受到伤害
    public get_hurted(damage: number)
    {
        this.enemy_hp -= damage;    
        this.die_check();
    }

    // 修改移动速度
    public change_speed(speed: number)
    {
        this.move_speed = speed;
    }

    // 销毁敌人节点
    public  onDestroy(): void {
        this.node.destroy();
    }

}

    
