import { useEffect, useState } from "react";
import { supabase, Payment } from "@/lib/supabase";

interface PaymentStatusResult {
  subscriptionStatus: "subscribed" | "free";
  transactionKey: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * 구독 상태 조회 Hook
 * payment 테이블에서 구독 상태를 조회하고 결과를 반환합니다.
 */
export function usePaymentStatus(): PaymentStatusResult {
  const [subscriptionStatus, setSubscriptionStatus] = useState<"subscribed" | "free">("free");
  const [transactionKey, setTransactionKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1-1) payment 테이블의 목록 조회
        const { data: payments, error: fetchError } = await supabase
          .from("payment")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw new Error(`결제 정보 조회 실패: ${fetchError.message}`);
        }

        if (!payments || payments.length === 0) {
          setSubscriptionStatus("free");
          setTransactionKey(null);
          return;
        }

        // 1-1-1) transaction_key로 그룹화하고 각 그룹에서 created_at 최신 1건씩 추출
        const groupedPayments = new Map<string, Payment>();
        for (const payment of payments) {
          const key = payment.transaction_key;
          if (!groupedPayments.has(key)) {
            groupedPayments.set(key, payment);
          } else {
            const existing = groupedPayments.get(key);
            if (existing && payment.created_at && existing.created_at) {
              // created_at이 더 최신인 것으로 교체
              if (new Date(payment.created_at) > new Date(existing.created_at)) {
                groupedPayments.set(key, payment);
              }
            }
          }
        }

        // 1-1-2) 위 그룹 결과에서 조회:
        //        1) status === "Paid"
        //        2) start_at <= 현재시각 <= end_grace_at
        const now = new Date();
        const activePayments = Array.from(groupedPayments.values()).filter((payment) => {
          if (payment.status !== "Paid") {
            return false;
          }

          const startAt = new Date(payment.start_at);
          const endGraceAt = new Date(payment.end_grace_at);

          return startAt <= now && now <= endGraceAt;
        });

        // 1-2) 조회 결과에 따른 로직 완성
        if (activePayments.length > 0) {
          // 조회 결과 1건 이상
          // - 상태메시지: 구독중
          // - "구독취소" 버튼 활성화
          // - "구독취소" 버튼에 transaction_key 전달
          const latestPayment = activePayments.sort((a, b) => {
            if (!a.created_at || !b.created_at) return 0;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          })[0];

          setSubscriptionStatus("subscribed");
          setTransactionKey(latestPayment.transaction_key);
        } else {
          // 조회 결과 0건
          // - 상태메시지: Free
          // - "구독하기" 버튼 활성화
          setSubscriptionStatus("free");
          setTransactionKey(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
        setError(errorMessage);
        console.error("구독 상태 조회 오류:", err);
        // 에러 발생 시 기본값 설정
        setSubscriptionStatus("free");
        setTransactionKey(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentStatus();
  }, []);

  return {
    subscriptionStatus,
    transactionKey,
    isLoading,
    error,
  };
}

