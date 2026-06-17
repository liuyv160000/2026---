// 毒气区域：爆炸后生成，持续一段时间，跟随背景向左移动，玩家在区域内持续扣血
import {
  _decorator,
  Component,
  Collider2D,
  Contact2DType,
  IPhysics2DContact,
  BoxCollider2D,
  CircleCollider2D,
  PhysicsSystem2D,
  CCFloat,
  CCInteger,
  Vec3
} from 'cc';

import { Playercontralor } from '../../../player/Playercontralor';

const { ccclass, property } = _decorator;

@ccclass('poison_gas_zone')
export class poison_gas_zone extends Component {

  @property({ type: CCFloat })
  public duration: number = 3;

  // 毒气跟随背景向左速度
  @property({ type: CCFloat })
  public scroll_speed: number = 600;

  @property({ type: CCInteger })
  public damage_per_tick: number = 5;

  @property({ type: CCFloat })
  public tick_interval: number = 0.5;

  // 调试开关，确认 update 是否在跑
  @property
  public debug_log: boolean = false;

  private collider: Collider2D = null!;

  private player_in_gas: boolean = false;
  private player_script: Playercontralor = null!;

  private life_timer: number = 0;
  private damage_timer: number = 0;

  private is_paused: boolean = false;

  onLoad() {
    this.collider = this.node.getComponent(BoxCollider2D)!;

    if (!this.collider) {
      this.collider = this.node.getComponent(CircleCollider2D)!;
    }

    if (this.collider) {
      // 只触发，不推开玩家
      this.collider.sensor = true;

      this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    PhysicsSystem2D.instance.enable = true;

    console.log(
      "poison_gas_zone onLoad：毒气区域脚本已启动，初始速度 = ",
      this.scroll_speed,
      "节点名 = ",
      this.node.name
    );
  }

  start() {
    this.life_timer = 0;
    this.damage_timer = 0;

    console.log(
      "poison_gas_zone start：毒气区域生成位置 = ",
      this.node.position.x,
      this.node.position.y
    );
  }

  update(deltaTime: number) {
    if (this.is_paused) return;

    // 1. 强制跟随背景向左移动
    const currentPos = this.node.getPosition();

    const nextPos = new Vec3(
      currentPos.x - this.scroll_speed * deltaTime,
      currentPos.y,
      currentPos.z
    );

    this.node.setPosition(nextPos);

    if (this.debug_log) {
      console.log(
        "poison_gas_zone update：x = ",
        nextPos.x,
        "speed = ",
        this.scroll_speed
      );
    }

    // 2. 生命周期计时
    this.life_timer += deltaTime;

    if (this.life_timer >= this.duration) {
      this.node.destroy();
      return;
    }

    // 3. 玩家在毒气内，持续扣血
    if (this.player_in_gas && this.player_script) {
      this.damage_timer += deltaTime;

      if (this.damage_timer >= this.tick_interval) {
        this.damage_timer = 0;
        this.player_script.get_hurted(this.damage_per_tick);
      }
    }
  }

  private onBeginContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
    if (other.node.name === 'player') {
      const player = other.node.getComponent(Playercontralor);

      if (player) {
        this.player_in_gas = true;
        this.player_script = player;

        // 进入毒气立即扣一次血
        this.player_script.get_hurted(this.damage_per_tick);
        this.damage_timer = 0;
      }
    }
  }

  private onEndContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
    if (other.node.name === 'player') {
      this.player_in_gas = false;
      this.player_script = null!;
      this.damage_timer = 0;
    }
  }

  public set_duration(duration: number) {
    this.duration = duration;
  }

  public set_scroll_speed(speed: number) {
    this.scroll_speed = speed;

    console.log("poison_gas_zone set_scroll_speed：毒气速度已设置为 = ", this.scroll_speed);
  }

  public set_damage_per_tick(damage: number) {
    this.damage_per_tick = damage;
  }

  public set_tick_interval(interval: number) {
    this.tick_interval = interval;
  }

  public Pause() {
    if (this.is_paused) return;
    this.is_paused = true;
  }

  public Resume() {
    if (!this.is_paused) return;
    this.is_paused = false;
  }
}