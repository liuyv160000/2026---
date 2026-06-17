// 机械老鼠生成器：按时间表投放机械老鼠
import { _decorator, Component, instantiate, Vec3, Prefab } from 'cc';
import { Timer } from '../../../Timer';
import { ex_manager } from '../../../ex_ctrl/ex_manager';
import { machine_mouse } from './machine_mouse';

const { ccclass, property } = _decorator;

@ccclass('machine_mouse_maker')
export class machine_mouse_maker extends Component {

  private is_paused: boolean = true; // 游戏是否暂停
  private timer_for_spawn: Timer = null; // 生成计时器

  @property(ex_manager)
  private ex_manager: ex_manager = null; // 外部关卡管理器

  // 机械老鼠生成时间
  @property({ type: [Number], tooltip: "机械老鼠生成时间点(秒)" })
  private time_for_spawn_machine_mouse_sets: number[] = [12, 20, 25, 30];

  // 生成位置：1=上平台，-1=下平台
  @property({ type: [Number], tooltip: "机械老鼠生成位置：1=上平台，-1=下平台" })
  private spawn_machine_mouse_side_sets: number[] = [-1, 1, -1, 1];

  // 下平台Y坐标
  @property({ type: Number, tooltip: "机械老鼠下平台Y坐标" })
  private machine_mouse_lower_y: number = -37.175;

  // 上平台Y坐标，需要按实际场景调整
  @property({ type: Number, tooltip: "机械老鼠上平台Y坐标" })
  private machine_mouse_upper_y: number = 500;

  // 整体向左速度，建议和电锯/背景速度接近
  @property({ type: Number, tooltip: "机械老鼠跟随背景向左速度" })
  private set_machine_mouse_speed: number = 1000;

  // 自身左右巡逻速度
  @property({ type: Number, tooltip: "机械老鼠自身左右巡逻速度" })
  private set_machine_mouse_patrol_speed: number = 300;

  // 伤害
  @property({ type: Number, tooltip: "机械老鼠伤害" })
  private set_machine_mouse_damage: number = 20;

  private spawn_machine_mouse_index: number = 0;

  @property({ type: Prefab })
  private machine_mouse_prefab: Prefab = null; // 机械老鼠预制体

  protected onLoad(): void {
    this.timer_for_spawn = this.addComponent(Timer);

    if (!this.ex_manager) {
      console.error("machine_mouse_maker：Ex Manager 没有绑定，请在 Inspector 里拖入 ex_manager");
      return;
    }

    this.timer_for_spawn.set_duration(this.ex_manager.get_total_time());
  }

  start() {
    this.timer_for_spawn.start();
  }

  update(deltaTime: number) {
    if (this.is_paused) return;

    this.spawn_machine_mouse();
  }

  // 投放机械老鼠
  private spawn_machine_mouse() {
    if (this.spawn_machine_mouse_index >= this.time_for_spawn_machine_mouse_sets.length) return;

    if (this.timer_for_spawn.get_elapsedTime() >= this.time_for_spawn_machine_mouse_sets[this.spawn_machine_mouse_index]) {
      this.post_machine_mouse();
      this.spawn_machine_mouse_index++;
    }
  }

  // 生成机械老鼠
  private post_machine_mouse() {
    if (!this.machine_mouse_prefab) {
      console.error("machine_mouse_maker：Machine Mouse Prefab 没有绑定，请拖入 machine_mouse.prefab");
      return;
    }

    const new_enemy_node = instantiate(this.machine_mouse_prefab);

    // 默认下平台
    let side = -1;

    if (this.spawn_machine_mouse_index < this.spawn_machine_mouse_side_sets.length) {
      side = this.spawn_machine_mouse_side_sets[this.spawn_machine_mouse_index];
    }

    const is_upper = side === 1;
    const spawn_y = is_upper ? this.machine_mouse_upper_y : this.machine_mouse_lower_y;

    const post_position = new Vec3(
      this.node.position.x,
      spawn_y,
      this.node.position.z
    );

    this.node.parent.addChild(new_enemy_node);

    const mouse = new_enemy_node.getComponent(machine_mouse);

    if (mouse) {
      mouse.set_position(post_position.x, post_position.y, is_upper);
      mouse.set_speed(this.set_machine_mouse_speed);
      mouse.set_patrol_speed(this.set_machine_mouse_patrol_speed);
      mouse.set_damage(this.set_machine_mouse_damage);
    } else {
      console.error("machine_mouse_maker：machine_mouse.prefab 上没有挂 machine_mouse.ts");
    }
  }

  // 暂停生成
  public Pause() {
    if (this.is_paused) return;

    this.timer_for_spawn.stop();
    this.is_paused = true;
  }

  // 恢复生成
  public Resume() {
    if (!this.is_paused) return;

    this.is_paused = false;
    this.timer_for_spawn.reStart();
  }
}