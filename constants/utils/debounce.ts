type DebouncedFunction<T extends any[]> = {
    (...args: T): void;
    cancel: () => void;
};

const debounce = <T extends any[]>(
    func: (...args: T) => void,
    delay: number
): DebouncedFunction<T> => {
    let timer: NodeJS.Timeout | null = null;

    const debouncedFunc = (...args: T) => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => func.apply(null, args), delay);
    };

    debouncedFunc.cancel = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    };

    return debouncedFunc;
};

export default debounce;
