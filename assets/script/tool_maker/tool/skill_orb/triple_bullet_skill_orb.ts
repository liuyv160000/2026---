// 三发散射技能球：拾取后启用三发散射射击技能
import { _decorator, Component, Collider2D, CircleCollider2D, Contact2DType,
     PhysicsSystem2D, IPhysics2DContact, Vec2 } from 'cc';
import { SkillSystem } from '../../../player/skill_system/SkillSystem';
import { bullet_base } from '../../../bullet/bullet_base';

const { ccclass, property } = _decorator;

@ccclass('triple_bullet_skill_orb')
export class triple_bullet_skill_orb extends bullet_base {

    @property
    private skill_id: string = 'bullet_triple'; // 技能ID

    public collider: CircleCollider2D | null = null; // 碰撞体组件

    // 初始化碰撞监听
    protected onLoad(): void {
        super.onLoad();
        this.speed = 500; // 设置水平移动速度
        this.move_dir = new Vec2(-1, 0); // 向左移动
        this.collider = this.node.getComponent(CircleCollider2D);
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
            this.collider.enabled = true;
        }
        PhysicsSystem2D.instance.enable = true;
    }

    // 销毁时清理
    protected onDestroy(): void {
    }

    update(deltaTime: number): void {
        super.update(deltaTime);
    }

    // 碰撞开始：启用三发散射技能并销毁
    protected onBeginContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        const skillSystem = other.node.getComponent(SkillSystem);
        if (!skillSystem) return;
        skillSystem.enableSkill(this.skill_id);
        this.scheduleOnce(() => {
            this.node.destroy();
        }, 0.01);
    }

    // 碰撞结束占位
    protected onEndContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        // 占位
    }
}