import { _decorator, Component, Node, Button } from 'cc';
import { director } from 'cc';

export class scene_manager {
    private static _instance: scene_manager;
    private _lastGameSceneName: string = '';
    
    // 不需要记录的结算类场景名称列表
    private readonly _excludeScenes: string[] = [
        'victor_scene',
        'fail_scene',
    ];

    static getInstance(): scene_manager {
        if (!this._instance) {
            this._instance = new scene_manager();
        }
        return this._instance;
    }

    /**
     * 记录当前场景（自动跳过结算类场景）
     * @param sceneName 当前场景名称
     */
    recordCurrentScene(sceneName: string): void {
        // 修改这里：使用 indexOf 替代 includes
        if (this._excludeScenes.indexOf(sceneName) !== -1) {
            console.log(`跳过记录结算场景: ${sceneName}`);
            return;
        }
        
        this._lastGameSceneName = sceneName;
        console.log(`记录游戏场景: ${sceneName}`);
    }

    /**
     * 公开方法：获取最后记录的游戏场景名
     * @returns 游戏场景名称
     */
    public getLastGameScene(): string {
        if (!this._lastGameSceneName) {
            console.warn('没有记录的游戏场景，返回默认场景');
            return 'Level_1'; // 默认场景，改成你自己的默认场景名
        }
        return this._lastGameSceneName;
    }

    start(){
        this.recordCurrentScene(director.getScene().name); // 启动时记录当前场景
    }

    /**
     * 添加需要排除的场景
     * @param sceneName 场景名称
     */
    public addExcludeScene(sceneName: string): void {
        // 同样使用 indexOf
        if (this._excludeScenes.indexOf(sceneName) === -1) {
            this._excludeScenes.push(sceneName);
        }
    }

    /**
     * 清除记录
     */
    public clearRecord(): void {
        this._lastGameSceneName = '';
    }
}