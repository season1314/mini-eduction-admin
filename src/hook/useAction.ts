import { useState, useCallback, useRef } from 'react';

export function useAction<T, Args extends any[]>(
    actionFn: (...args: Args) => Promise<T>
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const lastId = useRef(0);

    const execute = useCallback(async (...args: Args) => {
        const fetchId = ++lastId.current;
        setLoading(true);
        setError(null);

        try {
            const result = await actionFn(...args);

            if (fetchId === lastId.current) {
                setData(result);
                return result;
            }
        } catch (err: any) {
            if (fetchId === lastId.current) {
                console.error("Action Execution Error:", err);
                setError(err);
            }
            throw err;
        } finally {
            if (fetchId === lastId.current) {
                setLoading(false);
            }
        }
    }, [actionFn]);

    const reset = () => {
        setData(null);
        setError(null);
        setLoading(false);
    };

    return { data, loading, error, execute, setData, reset };
}