import { test, expect } from "@playwright/test";

test.describe("궁합 맵 탐색", () => {
  test("MBTI 선택 후 배지 클릭 → 모달 열림/닫힘", async ({ page }) => {
    // 1. /mbti-map 접속
    await page.goto("/mbti-map");

    // 2. MBTI 모달에서 ENFP 선택
    const enfpBtn = page.getByTestId("mbti-btn-ENFP");
    await expect(enfpBtn).toBeVisible({ timeout: 10000 });
    await enfpBtn.click();

    // 3. 페이지에 MBTI 타입들이 표시됨 확인
    // MbtiBadge가 렌더되어야 함 (여러 개 있을 수 있으므로 first() 사용)
    await expect(page.getByTestId("mbti-badge-INFJ").first()).toBeVisible({
      timeout: 10000,
    });

    // 4. INFJ 배지 클릭 → CompatDetailModal 열림 (첫 번째 배지 클릭)
    await page.getByTestId("mbti-badge-INFJ").first().click();

    // 5. compat-detail-modal 표시 확인
    const modal = page.getByTestId("compat-detail-modal");
    await expect(modal).toBeVisible({ timeout: 5000 });

    // 6. close-btn(✕) 클릭 → 모달 닫힘
    const closeBtn = page.getByTestId("close-btn");
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // 모달이 닫혔는지 확인
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });

  test("여러 배지 클릭 → 다른 모달 내용 표시", async ({ page }) => {
    await page.goto("/mbti-map");

    // INTJ 선택
    await expect(page.getByTestId("mbti-btn-INTJ")).toBeVisible({ timeout: 10000 });
    await page.getByTestId("mbti-btn-INTJ").click();

    // 첫 번째 배지 클릭 (INFJ)
    await expect(page.getByTestId("mbti-badge-INFJ").first()).toBeVisible({ timeout: 10000 });
    await page.getByTestId("mbti-badge-INFJ").first().click();

    const modal = page.getByTestId("compat-detail-modal");
    await expect(modal).toBeVisible({ timeout: 5000 });

    // 모달 내용 캡처
    const firstModalText = await modal.textContent();

    // 모달 닫기
    await page.getByTestId("close-btn").click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // 다른 배지(ENFP) 클릭
    await expect(page.getByTestId("mbti-badge-ENFP").first()).toBeVisible({ timeout: 5000 });
    await page.getByTestId("mbti-badge-ENFP").first().click();

    await expect(modal).toBeVisible({ timeout: 5000 });
    const secondModalText = await modal.textContent();

    // 다른 배지이므로 내용이 달라야 함
    expect(firstModalText).not.toBe(secondModalText);
  });
});
