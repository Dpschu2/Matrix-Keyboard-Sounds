'use strict';
import { spawn } from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';

let player: AudioPlayer;
let listener: EditorListener;
let isActive: boolean;

export function activate(context: vscode.ExtensionContext) {
    console.log('Matrix Sounds active');
    player = player || new AudioPlayer();
    listener = listener || new EditorListener(player);
    isActive = context.globalState.get("matrix_sounds", true);

    vscode.commands.registerCommand('matrix_keyboard_sounds.activate', () => {
        if (!isActive) {
            context.globalState.update("matrix_sounds", true);
            isActive = true;
            vscode.window.showInformationMessage("Extension enabled");
        } else {
            vscode.window.showWarningMessage("Extension already enabled");
        }
    });
    vscode.commands.registerCommand('matrix_keyboard_sounds.deactivate', () => {
        if (isActive) {
            context.globalState.update("matrix_sounds", false);
            isActive = false;
            vscode.window.showInformationMessage("Extension disabled");
        } else {
            vscode.window.showWarningMessage("Extension already disabled");
        }
    });
    context.subscriptions.push(listener);
}
export function deactivate() {

}
export class AudioPlayer {
    private proc: any = undefined;
    private silent: boolean = true;

    play(filePath: string) {
        if (!this.silent) {
            this.stop();
        }

        this.silent = false;
        let args = [filePath];
        this.proc = spawn('mplayer', args);
        this.proc.on('error', function (err) {
            if (err.code == "ENOENT") {
                vscode.window.showErrorMessage("Matrix Keyboard Sounds: 'mplayer' is not installed on your $PATH");
            } else {
                vscode.window.showErrorMessage("Matrix Keyboard Sounds: Error");
            }
        });
    }
    stop() {
        if (this.proc) {
            this.proc.kill('SIGTERM');
        }
        this.silent = true;
    }
}
export class EditorListener {
    private disp: vscode.Disposable;
    private subs: vscode.Disposable[] = [];
    private base: string = path.join(__dirname, '..', '..');
    
    private enterSound: string = path.join(this.base, 'audio/matrix-key-sounds', 'enter-audio.wav');
    private deleteSound: string = path.join(this.base, 'audio/matrix-key-sounds', 'matrix-key-3.wav');
    private spaceSound: string = path.join(this.base, 'audio/matrix-key-sounds', 'space-audio.wav');

    private keySound1: string = path.join(this.base, 'audio/matrix-key-sounds', 'matrix-key.wav');
    private keySound2: string = path.join(this.base, 'audio/matrix-key-sounds', 'matrix-key-2.wav');
    private keySound3: string = path.join(this.base, 'audio/matrix-key-sounds', 'matrix-key-3.wav');

    private keyArr: Array<string> = [
        this.keySound1,
        this.keySound2,
        this.keySound3
    ];

    constructor(private player: AudioPlayer) {
        vscode.workspace.onDidChangeTextDocument(this._keystrokeCallback, this, this.subs);
        this.disp = vscode.Disposable.from(...this.subs);
    }

    _keystrokeCallback(e : vscode.TextDocumentChangeEvent) {
        if (!isActive) {
            return;
        }
        let inputText = e.contentChanges[0].text;
        if (inputText == "") {
            this.player.play(this.deleteSound);
        } else if (inputText == " ") {
            this.player.play(this.spaceSound);
        } else if (inputText.length > 2 || inputText == "\n") {
            this.player.play(this.enterSound);
        } else {
            const rand = Math.floor(Math.random()*this.keyArr.length);
            this.player.play(this.keyArr[rand]);
        }
    }

    dispose() {
        this.disp.dispose();
    }
};

