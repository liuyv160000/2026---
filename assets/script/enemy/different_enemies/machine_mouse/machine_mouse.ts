// 机器老鼠敌人：跟随背景向左移动，同时局部左右巡逻，碰到玩家只扣血，不推开玩家
import {
    _decorator,
    Animation,
    Collider2D,
    Contact2DType,
    IPhysics2DContact,
    RigidBody2D,
    Vec3,
    BoxCollider2D,
    CircleCollider2D,
    PhysicsSystem2D,
    CCFloat,
    CCInteger, AudioSource
} from 'cc';

import { enemy_controler_base } from '../../enemy_controler_base';
import { Playercontralor } from '../../../player/Playercontralor';

const { ccclass, property } = _decorator;

@ccclass('machine_mouse')
export class machine_mouse extends enemy_controler_base {

    @property({ type: CCFloat })
    public start_x: number = 800;

    @property({ type: CCFloat })
    public start_y: number = -37.175;

    // 整体跟随背景向左移动速度，建议和电锯一致
    @property({ type: CCFloat })
    public default_scroll_speed: number = 1000;

    // 老鼠自身左右巡逻速度
    @property({ type: CCFloat })
    public patrol_speed: number = 300;

    // 老鼠相对中心点的左右巡逻范围
    @property({ type: CCFloat })
    public patrol_left_offset: number = -150;

    @property({ type: CCFloat })
    public patrol_right_offset: number = 150;

    @property({ type: CCInteger })
    public default_damage: number = 20;

    @property(Animation)
    public anim: Animation = null!;

    private rigidBody: RigidBody2D = null!;
    private collider: Collider2D = null!;

    private is_paused: boolean = false;

    private damage: number = 20;

    // 巡逻中心点，这个点会跟随背景向左移动
    private center_x: number = 800;
    private center_y: number = -37.175;

    // 老鼠相对中心点的左右偏移
    private patrol_offset_x: number = 0;

    // 1 向右巡逻，-1 向左巡逻
    private patrol_direction: number = 1;

    // 整体向左速度
    private scroll_speed: number = 1000;

    // 是否生成在上平台
    private is_upper_side: boolean = false;

    onLoad(): void {
        super.onLoad();

        this.center_x = this.start_x;
        this.center_y = this.start_y;

        this.scroll_speed = this.default_scroll_speed;
        this.damage = this.default_damage;

        this.rigidBody = this.node.getComponent(RigidBody2D)!;

        if (this.rigidBody) {
            // 代码控制移动，不受重力影响
            this.rigidBody.gravityScale = 0;
        }

        // 机器老鼠优先使用 BoxCollider2D
        this.collider = this.node.getComponent(BoxCollider2D)!;

        if (!this.collider) {
            this.collider = this.node.getComponent(CircleCollider2D)!;
        }

        if (this.collider) {
            // 关键：Sensor = true，只触发碰撞事件，不产生物理推挤
            this.collider.sensor = true;

            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }

        PhysicsSystem2D.instance.enable = true;

        this.anim = this.node.getComponent(Animation)!;
    }

    @property(AudioSource)
    public audioSource: AudioSource = null!;

    start() {
        this.apply_side_scale();

        this.audioSource.play();

        this.node.setPosition(
            new Vec3(this.center_x + this.patrol_offset_x, this.center_y, 0)
        );

        //如果你后面有机器老鼠动画，可以把 running 改成你的动画名
        if (this.anim) {
            this.anim.play('run');
        }
    }

    update(deltaTime: number) {
        if (this.is_paused) return;

        // 1. 整体跟随背景向左移动
        this.center_x -= this.scroll_speed * deltaTime;

        // 2. 老鼠自身在局部范围内左右巡逻
        this.patrol_offset_x += this.patrol_direction * this.patrol_speed * deltaTime;

        if (this.patrol_offset_x >= this.patrol_right_offset) {
            this.patrol_offset_x = this.patrol_right_offset;
            this.patrol_direction = -1;
        }

        if (this.patrol_offset_x <= this.patrol_left_offset) {
            this.patrol_offset_x = this.patrol_left_offset;
            this.patrol_direction = 1;
        }

        // 3. 最终位置 = 整体向左的位置 + 自身巡逻偏移
        const final_x = this.center_x + this.patrol_offset_x;

        this.node.setPosition(new Vec3(final_x, this.center_y, 0));

        // 4. 出屏销毁
        if (final_x < -900) {
            this.node.destroy();
        }
    }

    protected onBeginContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        if (other.node.name === 'player') {
            const player = other.node.getComponent(Playercontralor);

            if (player) {
                player.get_hurted(this.damage);
            }
        }
    }

    protected onEndContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {

    }

    public Pause() {
        if (this.is_paused) return;
        this.is_paused = true;
    }

    public Resume() {
        if (!this.is_paused) return;
        this.is_paused = false;
    }

    // speed 表示整体跟随背景向左移动速度
    public set_speed(speed: number) {
        this.default_scroll_speed = speed;
        this.scroll_speed = speed;
    }

    public set_damage(damage: number) {
        this.default_damage = damage;
        this.damage = damage;
    }

    public set_patrol_speed(speed: number) {
        this.patrol_speed = speed;
    }

    // is_upper = true 表示生成在上平台，需要上下翻转
    public set_position(x: number, y: number, is_upper: boolean = false) {
        this.start_x = x;
        this.start_y = y;

        this.center_x = x;
        this.center_y = y;

        this.is_upper_side = is_upper;

        this.apply_side_scale();

        this.node.setPosition(
            new Vec3(this.center_x + this.patrol_offset_x, this.center_y, 0)
        );
    }

    private apply_side_scale() {
        const scale = this.node.scale;

        if (this.is_upper_side) {
            // 上平台：上下翻转
            this.node.setScale(scale.x, -Math.abs(scale.y), scale.z);
        } else {
            // 下平台：正常显示
            this.node.setScale(scale.x, Math.abs(scale.y), scale.z);
        }
    }
}