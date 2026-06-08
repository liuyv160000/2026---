// 有限状态机实现与状态接口
import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 状态接口定义
 * 所有具体状态类都必须实现这个接口
 * 使用接口而非抽象类，允许状态类灵活继承其他基类（如 Component）
 */
export interface IState {
    enter(): void;//进入状态时调用,用途：播放进入动画、初始化状态数据、启用特效等
    // 每帧更新@param deltaTime - 距离上一帧的时间间隔（秒），用于帧率无关的计算,用途：处理持续逻辑（如移动、计时器、输入检测）
    update(deltaTime: number): void;
    //退出状态时调用
    exit(): void;
}
/**
 * 有限状态机基类
 * 继承 Component 以便直接挂载到场景节点上（可选，也可作为独立类使用）
 * 
 * 设计要点：
 * 1. 单一职责：只负责状态流转，不处理具体游戏逻辑
 * 2. 类型安全：使用 TypeScript 接口确保状态类实现规范
 * 3. 防御编程：防止重复进入同一状态，避免 null 引用
 */

@ccclass('FSM')
export class FSM extends Component {
    //当前激活的状态实例，null表示未初始化  
    private currentState: IState | null = null;
    // 状态注册表，key 为状态名称（如 "idle", "run"），value 为状态实例
    // 使用 Map 而非 Object，支持任意字符串作为键，且保持插入顺序
    private states: Map<string, IState> = new Map();
    /**
     * 注册状态到状态机
     * 通常在 onLoad() 或 start() 中调用，一次性注册所有可能状态
     * 
     * @param name - 状态唯一标识符，建议用大写常量定义避免拼写错误
     * @param state - 实现 IState 接口的状态实例
     */
    registerState(name: string, state: IState): void {
        this.states.set(name, state);
    }
     /**
     * 切换状态（核心方法）
     * 执行流程：退出当前状态 → 切换引用 → 进入新状态
     * 
     * @param name - 目标状态名称，必须在 registerState 中注册过
     * 
     * 安全机制：
     * 1. 若状态未注册，静默返回（避免崩溃）
     * 2. 若目标状态与当前状态相同，直接返回（防止重复触发）
     * 3. 若当前状态为 null，跳过 exit() 直接 enter()
     * 
     * 注意：不要在 exit() 或 enter() 中直接调用 changeState，可能造成递归。
     * 如需延迟切换，使用 setTimeout 或下一帧处理。
     */
    changeState(name: string): void {
        // 从注册表中获取目标状态
        const newState = this.states.get(name);
         // 防御性检查：未注册的状态或相同状态直接返回
        if (!newState || newState === this.currentState) return;
        // 生命周期回调：先退出当前状态（如果有）
        // 顺序很重要：确保旧状态的清理逻辑在新状态初始化前执行
        this.currentState?.exit();
        // 切换状态引用
        this.currentState = newState;
        // 生命周期回调：进入新状态
        this.currentState.enter();
    }
      /**
     * 更新当前状态
     * 需要在组件的 update() 中手动调用，确保与游戏帧率同步
     * 
     * @param deltaTime - 从引擎传入的时间增量
     * 
     * 调用示例（在使用方组件中）：
     * update(deltaTime: number) {
     *     this.fsm.update(deltaTime);
     * }
     */
    update(deltaTime: number): void {
        // 可选链操作符：若 currentState 为 null 则短路返回
        this.currentState?.update(deltaTime);
    }
      /**
     * 获取当前状态的名称
     * 用于调试、UI 显示或条件判断（如 "能否从当前状态跳跃"）
     * 
     * @returns 当前状态的注册名称，若未初始化则返回 null
     * 
     * 性能注意：使用 Map 遍历，时间复杂度 O(n)，n 为状态数量。
     * 若需频繁调用，建议在 changeState 时缓存当前状态名。
     */
    getCurrentStateName(): string | null {
        // 遍历 Map 查找与当前实例匹配的键名
        for (const [name, state] of this.states) {
            if (state === this.currentState) return name;
        }
        return null;
    }

    
}


