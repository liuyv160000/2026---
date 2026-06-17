// 毒气自爆罐：出现在视野中，缓慢飘向玩家，倒计时结束后自动爆炸，留下毒气区域
import {
    _decorator,
    Animation,
    Collider2D,
    RigidBody2D,
    Vec3,
    BoxCollider2D,
    CircleCollider2D,
    PhysicsSystem2D,
    Prefab,
    instantiate,
    CCFloat,
    CCInteger,
    Node , AudioSource, Sprite
} from 'cc';

import { enemy_controler_base } from '../../enemy_controler_base';
import { poison_gas_zone } from '../poison_gas_zone/poison_gas_zone';

const { ccclass, property } = _decorator;

@ccclass('poison_bomb')
export class poison_bomb extends enemy_controler_base {

    @property({ type: CCFloat })
    public start_x: number = 850;

    @property({ type: CCFloat })
    public start_y: number = -37.175;

    // 跟随背景向左移动速度
    @property({ type: CCFloat })
    public scroll_speed: number = 600;

    // 缓慢飘向玩家速度
    @property({ type: CCFloat })
    public chase_speed: number = 80;

    // 出现后多久自动爆炸
    @property({ type: CCFloat })
    public explode_countdown: number = 2.5;

    // 毒气区域持续时间
    @property({ type: CCFloat })
    public gas_duration: number = 3;

    // 毒气每次伤害
    @property({ type: CCInteger })
    public gas_damage_per_tick: number = 5;

    // 毒气伤害间隔
    @property({ type: CCFloat })
    public gas_tick_interval: number = 0.5;

    @property({ type: Prefab })
    public poison_gas_prefab: Prefab = null!;

    @property(Animation)
    public anim: Animation = null!;

    private rigidBody: RigidBody2D = null!;
    private collider: Collider2D = null!;

    private center_pos: Vec3 = new Vec3(850, -37.175, 0);

    private timer: number = 0;
    private is_paused: boolean = false;
    private has_exploded: boolean = false;
    private is_upper_side: boolean = false;

    private once_exploded: boolean = false; // 确保只爆炸一次

    onLoad(): void {
        super.onLoad();

        this.sprite = this.node.getComponent(Sprite)!;

        this.center_pos = new Vec3(this.start_x, this.start_y, 0);

        this.rigidBody = this.node.getComponent(RigidBody2D)!;

        if (this.rigidBody) {
            this.rigidBody.gravityScale = 0;
        }

        this.collider = this.node.getComponent(BoxCollider2D)!;

        if (!this.collider) {
            this.collider = this.node.getComponent(CircleCollider2D)!;
        }

        if (this.collider) {
            // 关键：毒气罐只作为触发器，不推开玩家
            // 但这里不绑定碰撞爆炸逻辑
            this.collider.sensor = true;
        }

        PhysicsSystem2D.instance.enable = true;

        this.anim = this.node.getComponent(Animation)!;
    }

    start() {
        this.apply_side_scale();

        this.timer = 0;
        this.has_exploded = false;

        this.node.setPosition(this.center_pos);

        // 如果后面有毒气罐待机/闪烁动画，可以在这里播放
        if (this.anim) {
            this.anim.play('idle');
        }
    }

    update(deltaTime: number) {
        if (this.is_paused || this.has_exploded) return;

        this.timer += deltaTime;

        // 1. 跟随背景向左移动，保证它进入玩家视野
        this.center_pos.x -= this.scroll_speed * deltaTime;

        // 2. 缓慢飘向玩家
        this.chase_player(deltaTime);

        this.node.setPosition(this.center_pos);

        // 3. 倒计时结束后自动爆炸
        // 注意：不需要碰到玩家
        if (this.timer >= this.explode_countdown) {
            if(!this.once_exploded)
            {
                this.anim.play('die');
                this.once_exploded = true;
            }
            this.scheduleOnce(() => {
                
                this.explode();
            }, 0.3); // 假设爆炸动画持续0.5秒，动画结束后生成毒气区域
            return;
        }

        // 4. 如果还没爆炸就已经出屏，直接销毁
        if (this.center_pos.x < -900) {
            this.node.destroy();
        }
    }

    // 缓慢飘向玩家
    private chase_player(deltaTime: number) {
        const playerNode = this.get_player_node();

        if (!playerNode) return;

        const playerPos = playerNode.position;

        const dx = playerPos.x - this.center_pos.x;
        const dy = playerPos.y - this.center_pos.y;

        const len = Math.sqrt(dx * dx + dy * dy);

        if (len <= 1) return;

        const dirX = dx / len;
        const dirY = dy / len;

        this.center_pos.x += dirX * this.chase_speed * deltaTime;
        this.center_pos.y += dirY * this.chase_speed * deltaTime;
    }

    @property(AudioSource)
    public audioSource: AudioSource = null!;
    private sprite: Sprite = null!;

    // 自动爆炸，生成毒气区域
    private explode() {
        if (this.has_exploded) return;

        this.has_exploded = true;
        

        console.log("poison_bomb explode：毒气罐爆炸，当前位置 = ", this.node.position.x, this.node.position.y);
        this.audioSource.play();
        if (this.poison_gas_prefab) {
            const gasNode = instantiate(this.poison_gas_prefab);

            gasNode.setPosition(this.node.position);

            this.node.parent.addChild(gasNode);

            const gasScript = gasNode.getComponent(poison_gas_zone);

            if (gasScript) {
                console.log("poison_bomb explode：找到 poison_gas_zone 脚本，开始传参数");

                gasScript.set_duration(this.gas_duration);
                gasScript.set_scroll_speed(this.scroll_speed);
                gasScript.set_damage_per_tick(this.gas_damage_per_tick);
                gasScript.set_tick_interval(this.gas_tick_interval);
            } else {
                console.error("poison_bomb explode：生成了毒气节点，但 poison_gas_zone.prefab 上没有挂 poison_gas_zone.ts");
            }
        } else {
            console.error("poison_bomb：没有绑定 poison_gas_prefab，请在 poison_bomb.prefab 上拖入 poison_gas_zone.prefab");
        }
        this.sprite.destroy(); // 隐藏毒气罐的精灵，显示爆炸动画
        this.scheduleOnce(() => {
            this.node.destroy();
        }, 1); // 假设爆炸动画持续0.5秒，动画结束后销毁毒气罐节点
    }

    private get_player_node(): Node | null {
        if (this.player && this.player.isValid) {
            return this.player;
        }

        if (this.node.parent) {
            const player = this.node.parent.getChildByName('player');

            if (player) {
                this.player = player;
                return player;
            }
        }

        return null;
    }

    public Pause() {
        if (this.is_paused) return;
        this.is_paused = true;
    }

    public Resume() {
        if (!this.is_paused) return;
        this.is_paused = false;
    }

    public set_position(x: number, y: number, is_upper: boolean = false) {
        this.start_x = x;
        this.start_y = y;

        this.center_pos = new Vec3(x, y, 0);

        this.is_upper_side = is_upper;

        this.apply_side_scale();

        this.node.setPosition(this.center_pos);
    }

    public set_scroll_speed(speed: number) {
        this.scroll_speed = speed;
    }

    public set_chase_speed(speed: number) {
        this.chase_speed = speed;
    }

    public set_countdown(time: number) {
        this.explode_countdown = time;
    }

    public set_gas_duration(duration: number) {
        this.gas_duration = duration;
    }

    public set_gas_damage(damage: number) {
        this.gas_damage_per_tick = damage;
    }

    private apply_side_scale() {
        const scale = this.node.scale;

        if (this.is_upper_side) {
            this.node.setScale(scale.x, -Math.abs(scale.y), scale.z);
        } else {
            this.node.setScale(scale.x, Math.abs(scale.y), scale.z);
        }
    }
}