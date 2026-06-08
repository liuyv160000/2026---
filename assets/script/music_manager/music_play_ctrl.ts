// 音乐控制：播放、暂停与停止
import { _decorator, Component, Node, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('music_play_ctrl')
export class music_play_ctrl extends Component {
    @property(AudioSource)
    private audioSource: AudioSource = null; // 音频组件

    // 组件启动
    start() {

    }

    // 帧更新占位
    update(deltaTime: number) {
        
    }

    // 暂停播放并禁用音源
    public pause_music() {
        this.audioSource.stop();
        this.audioSource.enabled = false;
        
    }

    // 开始播放
    public play_music() {
        this.audioSource.play();
    }

    // 停止播放
    public stop_music() {
        this.audioSource.stop();
    }

    // 恢复播放
    public resume_music() {
        this.audioSource.enabled = true;
        this.audioSource.play();
    }
}
