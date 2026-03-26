"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Loading from "@/components/common/Loading";
import AnimatedCard from "@/components/common/AnimatedCard";

function PaymentContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!id) {
      setError("非法进入漏洞拦截：缺少流水凭证保护参数。");
    }
    setChecking(false);
  }, [id]);

  const handleSimulatePay = async () => {
    setIsProcessing(true);
    
    // 模拟微信安全支付拉起加载状态带来的延迟感，营造产品体验的顺滑...
    setTimeout(async () => {
      try {
        const res = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId: id })
        });
        const data = await res.json();
        
        if (data.success) {
          alert("沙盒充值处理成功！返回深研分析大屏即可查看...");
          window.location.replace(`/result?id=${id}`);
        } else {
          alert("订单死锁失败: " + data.error);
          setIsProcessing(false);
        }
      } catch (err) {
        alert("银行/网络通信故障，未扣除额度：" + err.message);
        setIsProcessing(false);
      }
    }, 2500);
  };

  if (checking) return <Loading text="构建交易池凭据..." />;
  if (error) return <div style={{ color: "var(--accent-color)", textAlign: "center", marginTop: "100px", fontWeight: 'bold' }}>{error}</div>;

  return (
    <div style={{ padding: "var(--spacing-2xl) 0", display: "flex", justifyContent: "center" }}>
      <AnimatedCard style={{ maxWidth: "450px", width: "100%", textAlign: "center" }} delay={0}>
        <h2 style={{ marginBottom: "var(--spacing-xl)" }} className="text-gradient">收银订单台</h2>
        
        <div style={{ marginBottom: "var(--spacing-2xl)", background: "rgba(0,0,0,0.2)", padding: "var(--spacing-lg)", borderRadius: "var(--border-radius-md)" }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: "var(--spacing-sm)" }}>AI 高维分析测算服务单据</p>
          <div style={{ fontSize: "3rem", fontWeight: "bold", background: "linear-gradient(135deg, #10b981, #3b82f6)", WebkitBackgroundClip: "text", color: "transparent" }}>
            ￥9.90
          </div>
          <p style={{ color: "var(--text-secondary)", marginTop: "var(--spacing-md)", fontSize: "0.75rem", wordBreak: "break-all", opacity: 0.6 }}>
            防抵赖追踪编号：{id}
          </p>
        </div>

        <button 
          onClick={handleSimulatePay}
          disabled={isProcessing}
          style={{
            width: "100%", padding: "16px 0", fontSize: "1.2rem", fontWeight: "bold", border: "none",
            background: isProcessing ? "var(--surface-color)" : "#10b981", 
            color: isProcessing ? "var(--text-secondary)" : "#fff",
            borderRadius: "var(--border-radius-full)", cursor: isProcessing ? "not-allowed" : "pointer",
            boxShadow: isProcessing ? "none" : "0 4px 15px rgba(16, 185, 129, 0.4)",
            transition: "all 0.3s"
          }}
        >
          {isProcessing ? "保护组件调用中..." : "💳 虚拟支付以解锁报告核心区"}
        </button>

        <p style={{ marginTop: "var(--spacing-xl)", color: "var(--text-secondary)", fontSize: "0.85rem", opacity: 0.8 }}>
          ※ 点击沙盒购买后，报告内核心高密度的【五大优选岗位+AI智能避坑排雷指令】将自动向您去敏透出。
        </p>
      </AnimatedCard>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<Loading text="正在构建安全金融通道传输..." />}>
      <PaymentContent />
    </Suspense>
  );
}
