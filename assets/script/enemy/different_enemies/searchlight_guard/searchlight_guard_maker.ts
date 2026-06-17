// 探照灯守卫生成器：按时间表投放探照灯守卫
// 配合 searchlight_guard.ts 使用：上下巡逻 → 随机停住预警 → 发射Debuff激光 → 继续巡逻

import { _decorator, Component, instantiate, Vec3, Prefab, CCFloat, CCInteger } from 'cc';
import { Timer } from '../../../Timer';
import { ex_manager } from '../../../ex_ctrl/ex_manager';
import { searchlight_guard } from './searchlight_guard';

const { ccclass, property } = _decorator;

@ccclass('searchlight_guard_maker')
export class searchlight_guard_maker extends Component {

  private is_paused: boolean = true; // 游戏是否暂停
  private timer_for_spawn: Timer = null!; // 生成计时器

  @property(ex_manager)
  private ex_manager: ex_manager = null!; // 外部关卡管理器

  // ========== 生成时间 ==========

  @property({ type: [CCFloat], tooltip: "探照灯守卫生成时间点(秒)" })
  private time_for_spawn_searchlight_guard_sets: number[] = [15, 28, 40];

  private spawn_searchlight_guard_index: number = 0;


  // ========== 上下平台生成 ==========

  @property({ type: [CCInteger], tooltip: "探照灯守卫生成位置：1=上平台，-1=下平台" })
  private spawn_searchlight_guard_side_sets: number[] = [-1, 1, -1];

  @property({ type: CCFloat, tooltip: "探照灯守卫下平台Y坐标" })
  private searchlight_guard_lower_y: number = -37.175;

  @property({ type: CCFloat, tooltip: "探照灯守卫上平台Y坐标" })
  private searchlight_guard_upper_y: number = 500;


  // ========== 巡逻方向 ==========

  @property({ type: [CCInteger], tooltip: "初始巡逻方向：1=向上，-1=向下" })
  private spawn_searchlight_guard_patrol_dir_sets: number[] = [1, -1, 1];


  // ========== 守卫移动参数 ==========

  @property({ type: CCFloat, tooltip: "守卫进入后停留的X坐标，建议在玩家右侧" })
  private set_searchlight_idle_x: number = 850;

  @property({ type: CCFloat, tooltip: "守卫进入和逃离速度" })
  private set_searchlight_guard_scroll_speed: number = 400;

  @property({ type: CCFloat, tooltip: "守卫上下巡逻高度" })
  private set_searchlight_float_range: number = 260;

  @property({ type: CCFloat, tooltip: "守卫上下巡逻速度，单位：像素/秒" })
  private set_searchlight_float_speed: number = 250;

  @property({ type: CCFloat, tooltip: "守卫待机攻击阶段总时间" })
  private set_searchlight_idle_time: number = 10;

  @property({ type: CCFloat, tooltip: "守卫进入阶段时间，仅保留兼容；新版主要靠Idle X控制进入结束" })
  private set_searchlight_on_in_time: number = 1.5;


  // ========== 随机停住/预警/发射参数 ==========

  @property({ type: CCFloat, tooltip: "最短攻击间隔：守卫上下飞行多久后停住预警" })
  private set_searchlight_min_fire_interval: number = 1.5;

  @property({ type: CCFloat, tooltip: "最长攻击间隔：守卫上下飞行多久后停住预警" })
  private set_searchlight_max_fire_interval: number = 3.0;

  @property({ type: CCFloat, tooltip: "预警区域持续时间" })
  private set_searchlight_warning_duration: number = 1.0;

  @property({ type: CCFloat, tooltip: "探照激光持续时间" })
  private set_searchlight_laser_atk_time: number = 0.5;

  @property({ type: CCFloat, tooltip: "探照激光自身向左速度；想让光束固定在原位置就设0" })
  private set_searchlight_laser_scroll_speed: number = 0;


  // ========== Debuff 参数 ==========

  @property({ type: CCFloat, tooltip: "探照灯Debuff持续时间" })
  private set_searchlight_debuff_duration: number = 0.3;

  @property({ type: CCFloat, tooltip: "探照灯减速倍率，0.5表示减半" })
  private set_searchlight_slow_rate: number = 0.5;


  // ========== Prefab ==========

  @property({ type: Prefab })
  private searchlight_guard_prefab: Prefab = null!; // 探照灯守卫预制体


  protected onLoad(): void {
    this.timer_for_spawn = this.addComponent(Timer);

    if (!this.ex_manager) {
      console.error("searchlight_guard_maker：Ex Manager 没有绑定，请在 Inspector 里拖入 ex_manager");
      return;
    }

    this.timer_for_spawn.set_duration(this.ex_manager.get_total_time());
  }


  start() {
    this.timer_for_spawn.start();
  }


  update(deltaTime: number) {
    if (this.is_paused) return;

    this.spawn_searchlight_guard();
  }


  private spawn_searchlight_guard() {
    if (this.spawn_searchlight_guard_index >= this.time_for_spawn_searchlight_guard_sets.length) return;

    if (this.timer_for_spawn.get_elapsedTime() >= this.time_for_spawn_searchlight_guard_sets[this.spawn_searchlight_guard_index]) {
      this.post_searchlight_guard();
      this.spawn_searchlight_guard_index++;
    }
  }


  private post_searchlight_guard() {
    if (!this.searchlight_guard_prefab) {
      console.error("searchlight_guard_maker：Searchlight Guard Prefab 没有绑定，请拖入 searchlight_guard.prefab");
      return;
    }

    const new_enemy_node = instantiate(this.searchlight_guard_prefab);

    // 默认下平台
    let side = -1;

    if (this.spawn_searchlight_guard_index < this.spawn_searchlight_guard_side_sets.length) {
      side = this.spawn_searchlight_guard_side_sets[this.spawn_searchlight_guard_index];
    }

    const is_upper = side === 1;

    const spawn_y = is_upper ? this.searchlight_guard_upper_y : this.searchlight_guard_lower_y;

    // 默认向上巡逻
    let patrolDir = 1;

    if (this.spawn_searchlight_guard_index < this.spawn_searchlight_guard_patrol_dir_sets.length) {
      patrolDir = this.spawn_searchlight_guard_patrol_dir_sets[this.spawn_searchlight_guard_index];
    }

    const post_position = new Vec3(
      this.node.position.x,
      spawn_y,
      this.node.position.z
    );

    this.node.parent.addChild(new_enemy_node);

    const guard = new_enemy_node.getComponent(searchlight_guard);

    if (guard) {
      // 生成位置与上下平台
      guard.set_position(post_position.x, post_position.y, is_upper);

      // 关键：进入后停在玩家右侧，不要飞到玩家脸上
      guard.set_idle_x(this.set_searchlight_idle_x);

      // 移动参数
      guard.set_scroll_speed(this.set_searchlight_guard_scroll_speed);
      guard.set_float_param(this.set_searchlight_float_range, this.set_searchlight_float_speed);
      guard.set_patrol_dir(patrolDir);
      guard.set_state_time(this.set_searchlight_on_in_time, this.set_searchlight_idle_time);

      // 随机停住攻击参数
      guard.set_fire_interval_range(
        this.set_searchlight_min_fire_interval,
        this.set_searchlight_max_fire_interval
      );

      // 预警参数
      guard.set_warning_duration(this.set_searchlight_warning_duration);

      // 激光参数
      guard.set_laser_atk_time(this.set_searchlight_laser_atk_time);
      guard.set_laser_scroll_speed(this.set_searchlight_laser_scroll_speed);

      // Debuff参数
      guard.set_debuff(this.set_searchlight_debuff_duration, this.set_searchlight_slow_rate);
    } else {
      console.error("searchlight_guard_maker：searchlight_guard.prefab 上没有挂 searchlight_guard.ts");
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