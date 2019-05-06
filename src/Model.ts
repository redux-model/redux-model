export interface AnyObject {
    [key: string]: any;
}

export type ReducerEffects<Data> = Array<{
    when: string;
    effect: (state: Data, action: any) => Data;
}>;

// Base Mix Model
export abstract class Model<Data> {
    private static COUNTER = 0;

    protected readonly successType: string;

    private readonly instanceCounter: number;

    // The parameter name can make different instance.
    constructor(name: string = '') {
        Model.COUNTER += 1;
        this.instanceCounter = Model.COUNTER;
        this.successType = `${this.getTypePrefix()} ${name} success`;
    }

    public getSuccessType(): string {
        return this.successType;
    }

    public createData(): (state: Data | undefined, action: any) => Data {
        const effects = this.getEffects();

        return (state, action) => {
            if (!state) {
                state = this.getInitValue();
            }

            if (this.successType === action.type) {
                return this.onSuccess(state, action);
            }

            for (const { when, effect } of effects) {
                if (when === action.type) {
                    return effect(state, action);
                }
            }

            return state;
        };
    }

    protected getEffects(): ReducerEffects<Data> {
        return [];
    }

    protected getTypePrefix(): string {
        // Constructor name will be random string after uglify.
        let name = this.constructor.name;

        // Do not concat counter in dev mode.
        if (!module.hot) {
            name += `::${this.instanceCounter}::`;
        }

        return name;
    }

    protected abstract getInitValue(): Data;

    protected abstract onSuccess(state: Data, action: any): Data;
}
