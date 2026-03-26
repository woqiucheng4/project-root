const app = getApp();

const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.apiBase}${url}`,
      method,
      data,
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.error || `请求失败: ${res.statusCode}`));
        }
      },
      fail: (err) => reject(new Error(err.errMsg || '网络异常'))
    });
  });
};

module.exports = {
  post: (url, data) => request(url, 'POST', data),
  get: (url) => request(url, 'GET')
};
