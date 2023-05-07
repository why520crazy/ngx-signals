import { signal } from '@angular/core';

export function actionSignal() {
    const saving = signal(false);

    return {
        saving: saving,
        execute:()=>{}
    };
}
