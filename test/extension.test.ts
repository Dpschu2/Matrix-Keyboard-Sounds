import * as vscode from 'vscode';
import * as assert from 'assert';
import * as path from 'path';
import {AudioPlayer, EditorListener} from '../src/extension';

suite("Audio Player Tests", () => {
    let base: string;
    let spaceSound: string;
    let audioPlayer: AudioPlayer;
    setup(()=>{
        base = path.join(__dirname,'..', '..');
        spaceSound = path.join(base, 'audio', 'space-audio.wav');
        audioPlayer= new AudioPlayer();
    })
    test("no error when playing", () => {
        assert.doesNotThrow(()=>{
            audioPlayer.play(spaceSound);
        });
    });
});