// AutoSceneRecorder.ts
import { _decorator, Component, director } from 'cc';
import { scene_manager } from './scene_manager';
const { ccclass, property } = _decorator;

@ccclass('AutoSceneRecorder')
export class AutoSceneRecorder extends Component {
    
    onLoad() {
        // 自动获取并记录当前场景名称
        const sceneName = director.getScene().name;
        scene_manager.getInstance().recordCurrentScene(sceneName);
    }
}