import { Component, OnInit, signal, DestroyRef, inject } from '@angular/core';
import { actionSignal } from 'ngx-signals';
import { delay, Observable, of, takeUntil, tap } from 'rxjs';

function takeUntilDestroyed() {
    const destroyRef = inject(DestroyRef);

    const destroyed$ = new Observable<void>((observer) => {
        destroyRef!.onDestroy(observer.next.bind(observer));
    });

    return <T>(source: Observable<T>) => {
        return source.pipe(takeUntil(destroyed$));
    };
}
@Component({
    selector: 'app-action-signal',
    templateUrl: './basic.component.html'
})
export class SignalsActionComponent implements OnInit {
    saving = signal(false);

    destroyed = takeUntilDestroyed();

    addAction = actionSignal((obj: { name: string }) => {
        // 调用 API 添加/修改/删除数据
        const result = of(obj).pipe(delay(1000), this.destroyed);
        return result;
    });

    addActionWithError = actionSignal(() => {
        // 调用 API 添加/修改/删除数据
        return of(true).pipe(
            delay(1000),
            tap(() => {
                throw new Error(`Mock Error!`);
            })
        ) as Observable<boolean>;
    });

    // notifyService = inject(ThyNotifyService);

    constructor() {
        // 全局设置错误提示，这样就不用每次调用的时候传递
        // setDefaultErrorHandler(error => {
        //     this.notifyService.error(error.message);
        // });
    }

    ngOnInit(): void {}

    add() {
        this.saving.set(true);
        this.addAction({ name: 'Pet' }).execute((data) => {
            this.saving.set(false);
            // this.notifyService.success(`Add ${data.name} successfully!`);
        });
    }

    addWithError() {
        this.addActionWithError.execute();
    }
}
