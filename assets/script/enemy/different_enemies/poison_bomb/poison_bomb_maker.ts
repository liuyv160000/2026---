// 毒气自爆罐生成器：按时间表投放毒气自爆罐
import { _decorator, Component, instantiate, Vec3, Prefab, CCFloat, CCInteger } from 'cc';
import { Timer } from '../../../Timer';
import { ex_manager } from '../../../ex_ctrl/ex_manager';
import { poison_bomb } from './poison_bomb';

const { ccclass, property } = _decorator;

@ccclass('poison_bomb_maker')
export class poison_bomb_maker extends Component {

  private is_paused: boolean = true;
  private timer_for_spawn: Timer = null;

  @property(ex_manager)
  private ex_manager: ex_manager = null;

  @property({ type: [CCFloat], tooltip: "毒气自爆罐生成时间点(秒)" })
  private time_for_spawn_poison_bomb_sets: number[] = [12, 22, 32];

  @property({ type: [CCInteger], tooltip: "生成位置：1=上平台，-1=下平台" })
  private spawn_poison_bomb_side_sets: number[] = [-1, 1, -1];

  @property({ type: CCFloat, tooltip: "下平台Y坐标" })
  private poison_bomb_lower_y: number = -37.175;

  @property({ type: CCFloat, tooltip: "上平台Y坐标" })
  private poison_bomb_upper_y: number = 500;

  @property({ type: CCFloat, tooltip: "跟随背景向左速度" })
  private set_poison_bomb_scroll_speed: number = 800;

  @property({ type: CCFloat, tooltip: "飘向玩家速度" })
  private set_poison_bomb_chase_speed: number = 120;

  @property({ type: CCFloat, tooltip: "爆炸倒计时" })
  private set_poison_bomb_countdown: number = 2.5;

  @property({ type: CCFloat, tooltip: "毒气持续时间" })
  private set_poison_gas_duration: number = 3;

  @property({ type: CCInteger, tooltip: "毒气每次伤害" })
  private set_poison_gas_damage: number = 5;

  private spawn_poison_bomb_index: number = 0;

  @property({ type: Prefab })
  private poison_bomb_prefab: Prefab = null;

  protected onLoad(): void {
    this.timer_for_spawn = this.addComponent(Timer);

    if (!this.ex_manager) {
      console.error("poison_bomb_maker：Ex Manager 没有绑定");
      return;
    }

    this.timer_for_spawn.set_duration(this.ex_manager.get_total_time());
  }

  start() {
    this.timer_for_spawn.start();
  }

  update(deltaTime: number) {
    if (this.is_paused) return;
    this.spawn_poison_bomb();
  }

  private spawn_poison_bomb() {
    if (this.spawn_poison_bomb_index >= this.time_for_spawn_poison_bomb_sets.length) return;

    if (this.timer_for_spawn.get_elapsedTime() >= this.time_for_spawn_poison_bomb_sets[this.spawn_poison_bomb_index]) {
      this.post_poison_bomb();
      this.spawn_poison_bomb_index++;
    }
  }

  private post_poison_bomb() {
    if (!this.poison_bomb_prefab) {
      console.error("poison_bomb_maker：Poison Bomb Prefab 没有绑定");
      return;
    }

    const new_enemy_node = instantiate(this.poison_bomb_prefab);

    let side = -1;

    if (this.spawn_poison_bomb_index < this.spawn_poison_bomb_side_sets.length) {
      side = this.spawn_poison_bomb_side_sets[this.spawn_poison_bomb_index];
    }

    const is_upper = side === 1;
    const spawn_y = is_upper ? this.poison_bomb_upper_y : this.poison_bomb_lower_y;

    const post_position = new Vec3(
      this.node.position.x,
      spawn_y,
      this.node.position.z
    );

    this.node.parent.addChild(new_enemy_node);

    const bomb = new_enemy_node.getComponent(poison_bomb);

    if (bomb) {
      bomb.set_position(post_position.x, post_position.y, is_upper);
      bomb.set_scroll_speed(this.set_poison_bomb_scroll_speed);
      bomb.set_chase_speed(this.set_poison_bomb_chase_speed);
      bomb.set_countdown(this.set_poison_bomb_countdown);
      bomb.set_gas_duration(this.set_poison_gas_duration);
      bomb.set_gas_damage(this.set_poison_gas_damage);
    } else {
      console.error("poison_bomb_maker：poison_bomb.prefab 上没有挂 poison_bomb.ts");
    }
  }

  public Pause() {
    if (this.is_paused) return;

    this.timer_for_spawn.stop();
    this.is_paused = true;
  }

  public Resume() {
    if (!this.is_paused) return;

    this.is_paused = false;
    this.timer_for_spawn.reStart();
  }
}