/**
 * src/services/wechat.js
 * 
 * 微信公众号对接服务：
 * 负责用户静默授权登录（获取 OpenID）以及精准下发【公考盯盘】模板消息
 */

const APP_ID = process.env.WX_APP_ID;
const APP_SECRET = process.env.WX_APP_SECRET;

// 1. 获取全局 Access Token (需缓存，有效期2小时)
export async function getAccessToken() {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APP_ID}&secret=${APP_SECRET}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.errcode) throw new Error(`获取 WX Token 失败: ${data.errmsg}`);
  return data.access_token;
}

// 2. 网页授权：通过授权 code 换取用户的 openid (用户登录态核心)
export async function getOpenIdByCode(code) {
  const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${APP_ID}&secret=${APP_SECRET}&code=${code}&grant_type=authorization_code`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.errcode) throw new Error(`WX 授权失败: ${data.errmsg}`);
  
  // 这里可以将 data.openid 写入用户数据库，实现静默登录
  return data.openid;
}

// 3. 发送模板消息：当【关注岗位】数据剧烈波动时强制微信震动通知
export async function pushTemplateMessage(openid, jobData) {
  const token = await getAccessToken();
  const url = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`;
  
  // 假定已经在微信公众平台申请好的【考情变动通知】模板 ID
  const TEMPLATE_ID = "YOUR_WX_TEMPLATE_ID_HERE";
  
  const payload = {
    touser: openid,
    template_id: TEMPLATE_ID,
    url: `https://kaogong.pro/result?id=${jobData.reportId}`, // 点击跳转到专属报告页
    data: {
      first: { value: `🚨 紧急情报！您的目标岗位考情发生巨变！`, color: "#ef4444" },
      keyword1: { value: `${jobData.department} - ${jobData.jobTitle}` }, // 岗位名称
      keyword2: { value: `${jobData.currentApplicants}人 已抢报` }, // 当前报名人数
      keyword3: { value: `${jobData.updatedAt}` }, // 更新时间
      remark: { value: `当前竞争尚未饱和 (历年进面均分 ${jobData.historyScore})，点击立即查看突围分析！`, color: "#10b981" }
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  
  const result = await res.json();
  if (result.errcode !== 0) {
    console.error(`向 ${openid} 推送模板消息失败:`, result.errmsg);
    return false;
  }
  return true;
}
