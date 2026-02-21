// 极简实现的 WebDAV 客户端请求方法 (利用 browser 原生 fetch)
const SYNC_FILENAME = 'cyber-ledger-data.json';

function getAuthHeader(username, password) {
    return 'Basic ' + btoa(unescape(encodeURIComponent(username + ':' + password)));
}

export async function pushToWebdav(config, data) {
    const { url, username, password } = config;
    if (!url || !username || !password) throw new Error("缺少云同步配置");

    // 确保 url 结尾有 '/'
    const targetUrl = url.endsWith('/') ? `${url}${SYNC_FILENAME}` : `${url}/${SYNC_FILENAME}`;

    try {
        const response = await fetch(targetUrl, {
            method: 'PUT',
            headers: {
                'Authorization': getAuthHeader(username, password),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data, null, 2)
        });

        if (!response.ok) {
            throw new Error(`WebDAV HTTP-Error: ${response.status}`);
        }
        return true;
    } catch (err) {
        console.error("WebDAV Push Failed", err);
        throw err;
    }
}

export async function pullFromWebdav(config) {
    const { url, username, password } = config;
    if (!url || !username || !password) throw new Error("缺少云同步配置");

    const targetUrl = url.endsWith('/') ? `${url}${SYNC_FILENAME}` : `${url}/${SYNC_FILENAME}`;

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Authorization': getAuthHeader(username, password),
                'Cache-Control': 'no-cache'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null; // 云端无文件，正常情况
            }
            throw new Error(`WebDAV HTTP-Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (err) {
        console.error("WebDAV Pull Failed", err);
        throw err;
    }
}
