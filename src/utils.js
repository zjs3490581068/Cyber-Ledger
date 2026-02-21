export function formatMoney(amount) {
    return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY',
        minimumFractionDigits: 2,
    }).format(amount);
}

export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
    });
}

export function formatLocalDate(d = new Date()) {
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().split('T')[0];
}

export function formatLocalTime(d = new Date()) {
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString();
}
