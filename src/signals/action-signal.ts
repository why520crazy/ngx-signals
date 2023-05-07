import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Behavior, BehaviorContext, createBehaviorFromFunction, handleBehaviorError, pickBehaviorCallbacks } from './behavior';
import { SettableSignal, signal } from '@angular/core';
import { ErrorFn, ExtractObservableValue, SuccessFn } from './types';

interface ActionBehavior<R> {
    saving: SettableSignal<boolean>;

    execute(success?: SuccessFn<R>, error?: ErrorFn): void;
    execute(context: BehaviorContext<R>): void;
    execute(successOrContext: SuccessFn<R> | BehaviorContext<R>, error?: ErrorFn): void;
}

class ActionBehaviorImpl<R, A extends (...args: any) => Observable<R>> implements ActionBehavior<R> {
    saving = signal(false);

    private executeParams!: Parameters<A> | null;

    constructor(private action: A, private context: BehaviorContext<R>) {}

    execute(context: BehaviorContext<R>): void;
    execute(success?: SuccessFn<R>, error?: ErrorFn): void;
    execute(successOrContext: SuccessFn<R> | BehaviorContext<R>, error?: ErrorFn): void {
        if (this.saving()) {
            return;
        }
        this.saving.set(true);
        const callbacks = pickBehaviorCallbacks(this.context, successOrContext, error);
        try {
            this.action
                .apply(undefined, this.executeParams!)
                .pipe(
                    finalize(() => {
                        this.executeParams = null;
                    }),
                    tap((value) => {
                        this.saving.set(false);
                        this.executeParams = null;
                    })
                )
                .subscribe({
                    next: callbacks?.success,
                    error: (error: Error) => {
                        this.saving.set(false);
                        handleBehaviorError(error, callbacks.error!);
                    }
                });
        } catch (error: any) {
            this.saving.set(false);
            handleBehaviorError(error, callbacks.error!);
        }
    }
}

export function actionSignal<A extends (...args: any) => Observable<any> = (...args: any) => Observable<any>>(
    action: A,
    context: BehaviorContext<ExtractObservableValue<ReturnType<A>>> = {}
) {
    const behavior = new ActionBehaviorImpl(action, context);

    const fn = function (...params: Parameters<A>) {
        (fn as any)['executeParams'] = params;
        return fn;
    };
    return createBehaviorFromFunction(fn, {
        context: context,
        action: action,
        execute: behavior.execute.bind(fn),
        saving: behavior.saving
    }) as unknown as Behavior<Parameters<A>, ActionBehavior<ExtractObservableValue<ReturnType<A>>>> &
        ActionBehavior<ExtractObservableValue<ReturnType<A>>>;
}
