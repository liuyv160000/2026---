// 探照灯Debuff激光：碰到玩家后持续刷新Debuff，不扣血
import {
    _decorator,
    Component,
    Vec3,
    Node,
    RigidBody2D,
    Collider2D,
    BoxCollider2D,
    Contact2DType,
    IPhysics2DContact,
    PhysicsSystem2D,
    CCFloat,
} from 'cc';

import { Playercontralor } from '../../../player/Playercontralor';

const { ccclass, property } = _decorator;

@ccclass('searchlight_debuff_laser')
export class searchlight_debuff_laser extends Component {

    @property({ type: CCFloat, tooltip: "激光持续时间" })
    private atk_time: number = 0.5;

    @property({ type: CCFloat, tooltip: "激光自身向左移动速度；如果不想移动就设0" })
    private scroll_speed: number = 0;

    @property({ type: CCFloat, tooltip: "Debuff持续时间，建议略大于每帧间隔，比如0.2~0.5" })
    private debuff_duration: number = 0.3;

    @property({ type: CCFloat, tooltip: "减速倍率，0.5表示减半" })
    private slow_rate: number = 0.5;

    @property({ type: Boolean, tooltip: "是否打印调试日志" })
    private debug_log: boolean = false;

    private collider: BoxCollider2D = null!;
    private rigidBody: RigidBody2D = null!;

    private life_time: number = 0;

    private player_in_laser: boolean = false;
    private player_script: Playercontralor | null = null;

    onLoad(): void {
        this.collider = this.node.getComponent(BoxCollider2D)!;

        if (!this.collider) {
            console.error("searchlight_debuff_laser：当前prefab没有BoxCollider2D");
            return;
        }

        // 必须是Sensor，不然可能会把玩家顶飞
        this.collider.sensor = true;

        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);

        this.rigidBody = this.node.getComponent(RigidBody2D);

        if (this.rigidBody) {
            this.rigidBody.gravityScale = 0;
        }

        PhysicsSystem2D.instance.enable = true;
    }

    start() {
        this.life_time = 0;
    }

    update(deltaTime: number) {
        this.life_time += deltaTime;

        // 如果设置了向左移动速度，则激光跟随场景移动
        if (this.scroll_speed !== 0) {
            const pos = this.node.getPosition();
            this.node.setPosition(
                new Vec3(
                    pos.x - this.scroll_speed * deltaTime,
                    pos.y,
                    pos.z
                )
            );
        }

        // 关键：玩家在激光内时，每帧刷新Debuff
        // 这样即使debuff_duration很短，也不会中途失效
        if (this.player_in_laser && this.player_script) {
            this.player_script.apply_searchlight_debuff(this.debuff_duration,this.slow_rate);
            if (this.debug_log) {
                console.log("searchlight_debuff_laser：持续施加探照灯Debuff");
            }
        }

        if (this.life_time >= this.atk_time) {
            this.node.destroy();
        }
    }

    private onBeginContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        const player = this.findPlayerContralor(other.node);

        if (player) {
            this.player_in_laser = true;
            this.player_script = player;

            // 碰到瞬间先施加一次
            this.player_script.apply_searchlight_debuff(this.debuff_duration, this.slow_rate);

            if (this.debug_log) {
                console.log("searchlight_debuff_laser：玩家进入激光，施加Debuff");
            }
        }
    }

    private onEndContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        const player = this.findPlayerContralor(other.node);

        if (player && player === this.player_script) {
            this.player_in_laser = false;
            this.player_script = null;

            if (this.debug_log) {
                console.log("searchlight_debuff_laser：玩家离开激光");
            }
        }
    }

    private findPlayerContralor(node: Node): Playercontralor | null {
        let current: Node | null = node;

        while (current) {
            const player = current.getComponent(Playercontralor);

            if (player) {
                return player;
            }

            current = current.parent;
        }

        return null;
    }

    public set_atk_time(atk_time: number) {
        this.atk_time = atk_time;
    }

    public set_scroll_speed(speed: number) {
        this.scroll_speed = speed;
    }

    public set_debuff(duration: number, slowRate: number) {
        this.debuff_duration = duration;
        this.slow_rate = slowRate;
    }

    onDestroy() {
        if (this.collider) {
            this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }
}