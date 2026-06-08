// supply_maker.ts - 支持多时间点与对应偏移位置
import { _decorator, Component, Node, Vec3, Prefab, instantiate } from 'cc';
import { Timer } from '../../../Timer';

const { ccclass, property } = _decorator;

interface SupplyConfig {
    time: number;       // 投放时间点(秒)
    yOffset: number;    // Y轴偏移位置
}

@ccclass('box_supply_maker')
export class box_supply_maker extends Component {
    
    @property({ type: Prefab, tooltip: "补给预制体" })
    supply_prefab: Prefab = null!;

    @property({ type: [Number], tooltip: "补给生成时间点(秒)" })
    time_for_post_supply: number[] = [15, 25];

    @property({ type: [Number], tooltip: "对应时间点的Y轴偏移，与时间点一一对应" })
    supply_y_offsets: number[] = [100, 200];

    protected timer_for_supply: Timer = null!;
    protected origin_position: Vec3 = new Vec3(0, 0, 0);
    protected elapsed_time: number = 0;
    protected current_time_index: number = 0;

    public is_paused: boolean = false;

    protected onLoad(): void {
        this.timer_for_supply = this.addComponent(Timer);
        this.timer_for_supply.set_duration(1);
        this.origin_position = this.node.getPosition();
    }

    start() {
        // 验证配置长度是否匹配
        if (this.time_for_post_supply.length !== this.supply_y_offsets.length) {
            console.warn('时间点与偏移量数组长度不匹配，请检查配置');
        }
        this.timer_for_supply.start();
    }

    update(deltaTime: number) {
        if (this.is_paused) return;

        // 按时间点生成
        if (this.current_time_index < this.time_for_post_supply.length) {
            this.elapsed_time += deltaTime;
            if (this.elapsed_time >= this.time_for_post_supply[this.current_time_index]) {
                this.dispatch_supply(
                    this.supply_y_offsets[this.current_time_index]
                );
                this.current_time_index++;
            }
        }
    }

    /**
     * 投放补给
     * @param yOffset Y轴偏移量
     */
    private dispatch_supply(yOffset: number) {
        if (!this.supply_prefab) {
            console.warn('补给预制体未设置');
            return;
        }

        const supply = instantiate(this.supply_prefab);
        const spawnPosition = new Vec3(
            this.origin_position.x,
            this.origin_position.y + yOffset,
            this.origin_position.z
        );
        supply.setPosition(spawnPosition);
        this.node.parent?.addChild(supply);
    }

    public Pause() {
        if (this.is_paused) return;
        this.is_paused = true;
        this.timer_for_supply.stop();
    }

    public Resume() {
        if (!this.is_paused) return;
        this.is_paused = false;
        this.timer_for_supply.start();
    }
}