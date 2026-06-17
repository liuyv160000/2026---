// 探照灯守卫：仿照普通飞行敌人
// 状态：进入到右侧待机点 → 上下巡逻 → 随机停住预警 → 发射Debuff激光 → 继续巡逻 → 退出

import {
    _decorator,
    Vec2,
    Vec3,
    UITransform,
    Prefab,
    instantiate,
    RigidBody2D,
    Contact2DType,
    Collider2D,
    IPhysics2DContact,
    PhysicsSystem2D,
    BoxCollider2D,
    Animation,
    CCFloat
} from 'cc';

import { enemy_controler_base } from '../../enemy_controler_base';
import { Timer } from '../../../Timer';
import { searchlight_debuff_laser } from './searchlight_debuff_laser';
import { box_warning_zone } from '../warning_zone/box_warning_zone/box_warning_zone';

const { ccclass, property } = _decorator;

@ccclass('searchlight_guard')
export class searchlight_guard extends enemy_controler_base {

    public enemy_hp: number = 50;

    private transform: UITransform = null!;
    private rigidBody: RigidBody2D = null!;
    public collider: BoxCollider2D = null!;
    private Physics2DContact: IPhysics2DContact | null = null;
    public anim: Animation = null!;

    // ========== 状态 ==========
    public is_onining: boolean = true;
    public is_idle: boolean = false;
    public is_run_away: boolean = false;
    public is_dead: boolean = false;

    private timer_for_move: Timer = null!;
    private state_timer: Timer = null!;
    private protected_timer: Timer = null!;
    

    @property({ type: CCFloat, tooltip: "待机攻击阶段持续时间" })
    private idle_time: number = 10;

    // ========== 位置与移动 ==========
    @property({ type: CCFloat, tooltip: "进入后停留的X坐标，建议在玩家右侧" })
    private idle_x: number = 850;

    @property({ type: CCFloat, tooltip: "上下巡逻高度" })
    private patrol_height: number = 260;

    @property({ type: CCFloat, tooltip: "初始巡逻方向：1=向上，-1=向下" })
    private patrol_dir: number = 1;

    private loop_time: number = 1;

    @property({ type: CCFloat, tooltip: "进入速度" })
    private on_in_speed: number = 400;

    @property({ type: CCFloat, tooltip: "上下巡逻速度，单位：像素/秒" })
    private idle_move_speed: number = 250;

    @property({ type: CCFloat, tooltip: "逃离速度" })
    private run_away_speed: number = 800;

    // ========== 预警和探照激光 ==========
    @property({ type: Prefab })
    public prefeb_warning_zone: Prefab = null!;

    @property({ type: Prefab })
    public prefeb_laser: Prefab = null!;

    @property({ type: CCFloat, tooltip: "最短攻击间隔" })
    private min_fire_interval: number = 1.5;

    @property({ type: CCFloat, tooltip: "最长攻击间隔" })
    private max_fire_interval: number = 3.0;

    @property({ type: CCFloat, tooltip: "预警持续时间" })
    private warning_duration: number = 1;

    @property({ type: CCFloat, tooltip: "激光持续时间" })
    private laser_atk_time: number = 0.5;

    @property({ type: CCFloat, tooltip: "激光X偏移，负数表示生成在守卫左侧" })
    private laser_x_offset: number = -550;

    @property({ type: CCFloat, tooltip: "激光Y偏移" })
    private laser_y_offset: number = 0;

    @property({ type: CCFloat, tooltip: "激光自身向左速度。想固定不动就设0" })
    private laser_scroll_speed: number = 0;

    @property({ type: CCFloat, tooltip: "Debuff持续时间" })
    private debuff_duration: number = 0.3;

    @property({ type: CCFloat, tooltip: "减速倍率，0.5表示减半" })
    private slow_rate: number = 0.5;

    // ========== 攻击流程内部变量 ==========
    private attack_timer: number = 0;
    private next_fire_interval: number = 2;
    private is_attack_sequence: boolean = false;
    private attack_phase: string = 'none'; // none / warning / laser
    private saved_idle_dir: number = 1;

    // ========== 其他 ==========
    public is_paused: boolean = true;
    private is_upper_side: boolean = false;

    onLoad(): void {
        super.onLoad();

        this.transform = this.node.getComponent(UITransform)!;
        this.anim = this.node.getComponent(Animation)!;

        this.timer_for_move = this.addComponent(Timer)!;
        this.state_timer = this.addComponent(Timer)!;
        this.protected_timer = this.addComponent(Timer)!;

        this.refresh_loop_time();

        this.timer_for_move.set_duration(this.loop_time);
        this.state_timer.set_duration(this.idle_time);
        this.protected_timer.set_duration(1.5);

        this.next_fire_interval = this.get_random_fire_interval();

        this.initPhysics();

        if (this.collider) {
            this.collider.sensor = true;
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }

        PhysicsSystem2D.instance.enable = true;
    }

    private initPhysics(): void {
        if (!this.rigidBody) {
            this.rigidBody = this.node.getComponent(RigidBody2D)!;
        }

        if (this.rigidBody) {
            this.rigidBody.gravityScale = 0;
        }

        if (!this.collider) {
            this.collider = this.node.getComponent(BoxCollider2D)!;
        }
    }

    protected onBeginContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        this.Physics2DContact = contact;
        // 守卫本体默认不伤害玩家，效果由激光处理
    }

    protected onEndContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        this.Physics2DContact = null;
    }

    start() {
        this.apply_side_scale();
        this.anim.play('idle');

        if (this.collider) {
            this.collider.enabled = false;
        }

        this.timer_for_move.start();
        this.state_timer.start();
        this.protected_timer.start();

        this.enter_on_in();

        this.Resume();
    }

    update(deltaTime: number) {
        if (this.is_paused) return;
        if (this.is_dead) return;

        if (this.protected_timer.check_if_end() && this.is_onining) {
            if (this.collider) {
                this.collider.enabled = true;
            }
        }

        this.check_on_in_arrive();
        this.check_idle_end();

        this.update_attack_sequence(deltaTime);

        // 攻击流程中守卫停住，不执行普通移动
        if (!this.is_attack_sequence) {
            super.update(deltaTime);
            this.move_way();
        }

        if (this.node.position.x < -900) {
            this.node.destroy();
        }
    }

    // ========== 状态1：进入 ==========
    private enter_on_in() {
        this.is_onining = true;
        this.is_idle = false;
        this.is_run_away = false;

        this.move_speed = this.on_in_speed;
        this.move_dir = new Vec2(-1, 0);
    }

    private check_on_in_arrive() {
        if (!this.is_onining) return;

        if (this.node.position.x <= this.idle_x) {
            this.node.setPosition(new Vec3(this.idle_x, this.node.position.y, this.node.position.z));
            this.enter_idle();
        }
    }

    // ========== 状态2：待机上下巡逻 ==========
    private enter_idle() {
        this.is_onining = false;
        this.is_idle = true;
        this.is_run_away = false;

        this.move_speed = this.idle_move_speed;
        this.move_dir = new Vec2(0, this.patrol_dir);

        this.refresh_loop_time();

        this.timer_for_move.reset();
        this.timer_for_move.set_duration(this.loop_time);

        this.state_timer.reset();
        this.state_timer.set_duration(this.idle_time);

        this.attack_timer = 0;
        this.next_fire_interval = this.get_random_fire_interval();
        this.is_attack_sequence = false;
        this.attack_phase = 'none';
    }

    private check_idle_end() {
        if (!this.is_idle) return;
        if (this.is_attack_sequence) return;

        if (this.state_timer.check_if_end()) {
            this.enter_run_away();
        }
    }

    override move_way() {
        if (!this.is_idle) return;
        if (this.is_attack_sequence) return;

        if (this.timer_for_move.check_if_end()) {
            this.move_dir = this.move_dir.multiplyScalar(-1);
            this.patrol_dir = this.move_dir.y;
            this.timer_for_move.reset();
        }
    }

    private refresh_loop_time() {
        if (this.idle_move_speed <= 0) {
            this.loop_time = 1;
        } else {
            this.loop_time = this.patrol_height / this.idle_move_speed;
        }

        if (this.timer_for_move) {
            this.timer_for_move.set_duration(this.loop_time);
        }
    }

    // ========== 状态3：逃离 ==========
    private enter_run_away() {
        this.is_onining = false;
        this.is_idle = false;
        this.is_run_away = true;

        this.is_attack_sequence = false;
        this.attack_phase = 'none';

        this.move_speed = this.run_away_speed;
        this.move_dir = new Vec2(-1, 0);
    }

    // ========== 随机停住 → 预警 → 发射激光 → 恢复巡逻 ==========
    private update_attack_sequence(deltaTime: number) {
        if (!this.is_idle) return;

        this.attack_timer += deltaTime;

        // 没在攻击流程中，到随机时间后开始预警
        if (!this.is_attack_sequence) {
            if (this.attack_timer >= this.next_fire_interval) {
                this.start_warning();
            }
            return;
        }

        // 预警结束，进入激光阶段
        if (this.attack_phase === 'warning') {
            if (this.attack_timer >= this.warning_duration) {
                this.fire_laser();
                this.attack_phase = 'laser';
                this.attack_timer = 0;
            }
            return;
        }

        // 激光结束，恢复移动
        if (this.attack_phase === 'laser') {
            if (this.attack_timer >= this.laser_atk_time) {
                this.end_attack_sequence();
            }
        }
    }

    private start_warning() {
        this.is_attack_sequence = true;
        this.attack_phase = 'warning';
        this.attack_timer = 0;

        // 保存当前上下方向，攻击结束后继续沿这个方向走
        this.saved_idle_dir = this.move_dir.y === 0 ? this.patrol_dir : this.move_dir.y;

        // 停住
        this.move_speed = 0;
        this.move_dir = new Vec2(0, 0);

        this.post_warning_zone();
    }

    private post_warning_zone() {
        if (!this.prefeb_warning_zone) {
            console.error("searchlight_guard：没有绑定 prefeb_warning_zone，请拖入 box_warning_zone.prefab");
            return;
        }

        const warningNode = instantiate(this.prefeb_warning_zone);

        warningNode.setPosition(
            new Vec3(
                this.node.getPosition().x + this.laser_x_offset,
                this.node.getPosition().y + this.laser_y_offset,
                0
            )
        );

        this.node.parent.addChild(warningNode);

        const warningScript = warningNode.getComponent(box_warning_zone);

        if (warningScript) {
            warningScript.set_warning_duration(this.warning_duration);
        } else {
            console.error("searchlight_guard：box_warning_zone.prefab 上没有挂 box_warning_zone.ts");
        }
    }

    private fire_laser() {
        if (!this.prefeb_laser) {
            console.error("searchlight_guard：没有绑定 prefeb_laser，请拖入 searchlight_debuff_laser.prefab");
            return;
        }
        this.anim.play('atk');

        const laser = instantiate(this.prefeb_laser);

        laser.setPosition(
            new Vec3(
                this.node.getPosition().x + this.laser_x_offset,
                this.node.getPosition().y + this.laser_y_offset,
                0
            )
        );

        this.node.parent.addChild(laser);

        const laserScript = laser.getComponent(searchlight_debuff_laser);

        if (laserScript) {
            laserScript.set_atk_time(this.laser_atk_time);
            laserScript.set_scroll_speed(this.laser_scroll_speed);
            laserScript.set_debuff(this.debuff_duration, this.slow_rate);
        } else {
            console.error("searchlight_guard：searchlight_debuff_laser.prefab 上没有挂 searchlight_debuff_laser.ts");
        }
    }

    private end_attack_sequence() {
        this.is_attack_sequence = false;
        this.attack_phase = 'none';
        this.attack_timer = 0;
        this.next_fire_interval = this.get_random_fire_interval();

        // 恢复上下巡逻
        this.move_speed = this.idle_move_speed;
        this.move_dir = new Vec2(0, this.saved_idle_dir);

        this.anim.play('idle');
        this.timer_for_move.reset();
    }

    private get_random_fire_interval(): number {
        const min = Math.min(this.min_fire_interval, this.max_fire_interval);
        const max = Math.max(this.min_fire_interval, this.max_fire_interval);

        return min + Math.random() * (max - min);
    }

    // ========== 给 maker 调用 ==========
    public set_position(x: number, y: number, is_upper: boolean = false) {
        this.node.setPosition(new Vec3(x, y, 0));
        this.is_upper_side = is_upper;
        this.apply_side_scale();
    }

    public set_idle_x(x: number) {
        this.idle_x = x;
    }

    public set_patrol_dir(dir: number) {
        this.patrol_dir = dir;
    }

    public set_scroll_speed(speed: number) {
        this.on_in_speed = speed;
        this.run_away_speed = speed;
    }

    public set_float_param(range: number, speed: number) {
        this.patrol_height = range;
        this.idle_move_speed = speed;
        this.refresh_loop_time();
    }

    public set_fire_interval_range(minInterval: number, maxInterval: number) {
        this.min_fire_interval = minInterval;
        this.max_fire_interval = maxInterval;
        this.next_fire_interval = this.get_random_fire_interval();
    }

    public set_warning_duration(duration: number) {
        this.warning_duration = duration;
    }

    public set_laser_atk_time(time: number) {
        this.laser_atk_time = time;
    }

    public set_laser_scroll_speed(speed: number) {
        this.laser_scroll_speed = speed;
    }

    public set_debuff(duration: number, slowRate: number) {
        this.debuff_duration = duration;
        this.slow_rate = slowRate;
    }

    public set_state_time(onInTime: number, idleTime: number) {
        this.idle_time = idleTime;
    }

    public Pause() {
        if (this.is_paused) return;

        this.is_paused = true;
        this.timer_for_move?.stop();
        this.state_timer?.stop();
        this.protected_timer?.stop();
    }

    public Resume() {
        if (!this.is_paused) return;

        this.is_paused = false;
        this.timer_for_move?.reStart();
        this.state_timer?.reStart();
        this.protected_timer?.reStart();
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