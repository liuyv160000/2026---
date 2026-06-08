// coin_maker.ts - 金币生成器
import { _decorator, Component, Node, Vec3, Prefab, instantiate } from 'cc';
import { Timer } from '../../../Timer';

const { ccclass, property } = _decorator;

@ccclass('coin_maker')
export class coin_maker extends Component {
    
    @property({ type: Prefab, tooltip: "金币预制体" })
    coin_prefab: Prefab = null!;

    @property({ type: [Number], tooltip: "金币生成时间点(秒)" })
    time_for_spawn_coins: number[] = [5, 10, 15, 20];

    @property({ type: [Number], tooltip: "对应时间点的Y轴偏移，与时间点一一对应" })
    coin_y_offsets: number[] = [0, 100, -50, 200];

    protected timer_for_spawn: Timer = null!;
    protected origin_position: Vec3 = new Vec3();
    protected elapsed_time: number = 0;
    protected current_time_index: number = 0;

    public is_paused: boolean = false;

    protected onLoad(): void {
        this.timer_for_spawn = this.addComponent(Timer);
        this.timer_for_spawn.set_duration(1);
        this.origin_position = this.node.getPosition();
    }

    start() {
        // 验证配置长度是否匹配
        if (this.time_for_spawn_coins.length !== this.coin_y_offsets.length) {
            console.warn('[coin_maker] 时间点与偏移量数组长度不匹配，请检查配置');
        }
        this.timer_for_spawn.start();
    }

    update(deltaTime: number) {
        if (this.is_paused) return;

        // 按时间点生成
        if (this.current_time_index < this.time_for_spawn_coins.length) {
            this.elapsed_time += deltaTime;
            if (this.elapsed_time >= this.time_for_spawn_coins[this.current_time_index]) {
                this.dispatch_coin(
                    this.coin_y_offsets[this.current_time_index]
                );
                this.current_time_index++;
            }
        }
    }

    /**
     * 投放金币
     * @param yOffset Y轴偏移量
     */
    private dispatch_coin(yOffset: number) {
        if (!this.coin_prefab) {
            console.warn('[coin_maker] 金币预制体未设置');
            return;
        }

        const coin = instantiate(this.coin_prefab);
        const spawnPosition = new Vec3(
            this.origin_position.x,
            this.origin_position.y + yOffset,
            this.origin_position.z
        );
        coin.setPosition(spawnPosition);
        this.node.parent?.addChild(coin);
    }

    public Pause() {
        if (this.is_paused) return;
        this.is_paused = true;
        this.timer_for_spawn.stop();
    }

    public Resume() {
        if (!this.is_paused) return;
        this.is_paused = false;
        this.timer_for_spawn.start();
    }
}