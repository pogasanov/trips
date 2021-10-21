class ExpiringStorage {
    get(key: string) {
        const value = localStorage.getItem(key)
        if (!value) {
            return null;
        }

        const cached = JSON.parse(value);
        if (!cached) {
            return null;
        }

        const expires = new Date(cached.expires);

        if (expires < new Date()) {
            localStorage.removeItem(key);
            return null;
        }

        return cached.value;
    }

    set(key: string, value: unknown, lifeTimeInMinutes: number) {
        const currentTime = new Date().getTime();

        const expires = new Date(currentTime + lifeTimeInMinutes * 60000);

        localStorage.setItem(key, JSON.stringify({value, expires}));
    }
}

export default new ExpiringStorage();